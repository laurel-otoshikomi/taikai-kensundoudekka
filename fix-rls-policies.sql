-- ===================================
-- RLSポリシーの修正（UPDATE対応）
-- ===================================

-- 既存のポリシーを削除して再作成
-- players テーブル
DROP POLICY IF EXISTS "players_public_update" ON public.players;
DROP POLICY IF EXISTS "players_update_policy" ON public.players;

CREATE POLICY "players_public_update" 
ON public.players 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- tournaments テーブル
DROP POLICY IF EXISTS "tournaments_public_update" ON public.tournaments;
DROP POLICY IF EXISTS "tournaments_update_policy" ON public.tournaments;

CREATE POLICY "tournaments_public_update" 
ON public.tournaments 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- catches テーブル（念のため）
DROP POLICY IF EXISTS "catches_public_update" ON public.catches;

CREATE POLICY "catches_public_update" 
ON public.catches 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- 確認用クエリ
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
