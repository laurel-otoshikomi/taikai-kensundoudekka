-- Supabase Auth / RLS hardening draft
-- 作成日: 2026-07-06
--
-- 注意:
-- - これは本番にそのまま実行しないレビュー用ドラフトです。
-- - 先にテストSupabaseまたはテスト大会で検証してください。
-- - 既存アプリは簡易パスワードログインを使っているため、
--   アプリ側のSupabase Auth対応と同時に段階適用してください。

-- 1. 大会メンバー管理テーブル
CREATE TABLE IF NOT EXISTS public.tournament_members (
    id BIGSERIAL PRIMARY KEY,
    tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('staff', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tournament_members_tournament
    ON public.tournament_members(tournament_id);

CREATE INDEX IF NOT EXISTS idx_tournament_members_user
    ON public.tournament_members(user_id);

ALTER TABLE public.tournament_members ENABLE ROW LEVEL SECURITY;

-- 2. 権限判定ヘルパー
CREATE OR REPLACE FUNCTION public.is_tournament_staff(target_tournament_id TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.tournament_members tm
        WHERE tm.tournament_id = target_tournament_id
          AND tm.user_id = auth.uid()
          AND tm.role IN ('staff', 'admin')
    );
$$;

CREATE OR REPLACE FUNCTION public.is_tournament_admin(target_tournament_id TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.tournament_members tm
        WHERE tm.tournament_id = target_tournament_id
          AND tm.user_id = auth.uid()
          AND tm.role = 'admin'
    );
$$;

-- 3. tournament_members 自体のRLS
DROP POLICY IF EXISTS "tournament_members_admin_read" ON public.tournament_members;
CREATE POLICY "tournament_members_admin_read"
    ON public.tournament_members
    FOR SELECT
    USING (public.is_tournament_admin(tournament_id));

DROP POLICY IF EXISTS "tournament_members_admin_write" ON public.tournament_members;
CREATE POLICY "tournament_members_admin_write"
    ON public.tournament_members
    FOR ALL
    USING (public.is_tournament_admin(tournament_id))
    WITH CHECK (public.is_tournament_admin(tournament_id));

-- 4. 既存テーブルのRLS方針案
--
-- 注意:
-- 現在のアプリがSupabase Auth未対応のため、以下のDROP/CREATEを本番で即実行すると
-- 釣果登録・設定保存が失敗する可能性があります。
-- Auth対応後に段階適用してください。

-- players: 読み取りは公開、書き込みは管理者のみ
-- DROP POLICY IF EXISTS "players_public_insert" ON public.players;
-- DROP POLICY IF EXISTS "players_public_update" ON public.players;
-- DROP POLICY IF EXISTS "players_public_delete" ON public.players;
-- CREATE POLICY "players_admin_insert" ON public.players
--     FOR INSERT WITH CHECK (public.is_tournament_admin(tournament_id));
-- CREATE POLICY "players_admin_update" ON public.players
--     FOR UPDATE USING (public.is_tournament_admin(tournament_id))
--     WITH CHECK (public.is_tournament_admin(tournament_id));
-- CREATE POLICY "players_admin_delete" ON public.players
--     FOR DELETE USING (public.is_tournament_admin(tournament_id));

-- catches: 読み取りは公開、書き込みはスタッフ以上
-- DROP POLICY IF EXISTS "catches_public_insert" ON public.catches;
-- DROP POLICY IF EXISTS "catches_public_update" ON public.catches;
-- DROP POLICY IF EXISTS "catches_public_delete" ON public.catches;
-- CREATE POLICY "catches_staff_insert" ON public.catches
--     FOR INSERT WITH CHECK (public.is_tournament_staff(tournament_id));
-- CREATE POLICY "catches_staff_update" ON public.catches
--     FOR UPDATE USING (public.is_tournament_staff(tournament_id))
--     WITH CHECK (public.is_tournament_staff(tournament_id));
-- CREATE POLICY "catches_staff_delete" ON public.catches
--     FOR DELETE USING (public.is_tournament_staff(tournament_id));

-- tournaments: 読み取りは公開、更新/削除は管理者のみ
-- 重要:
-- password/staff_password列を残したまま公開SELECTにすると危険です。
-- 本番では先にアプリ側を「公開用view」参照に変更するか、パスワード列を廃止してください。
-- DROP POLICY IF EXISTS "tournaments_public_update" ON public.tournaments;
-- DROP POLICY IF EXISTS "tournaments_public_delete" ON public.tournaments;
-- CREATE POLICY "tournaments_admin_update" ON public.tournaments
--     FOR UPDATE USING (public.is_tournament_admin(id))
--     WITH CHECK (public.is_tournament_admin(id));
-- CREATE POLICY "tournaments_admin_delete" ON public.tournaments
--     FOR DELETE USING (public.is_tournament_admin(id));

