-- 全テーブルのRLS（Row Level Security）ポリシーを修正
-- Supabase SQL Editorで実行してください

-- ==========================================
-- tournaments テーブル
-- ==========================================

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "tournaments_insert_policy" ON tournaments;
DROP POLICY IF EXISTS "tournaments_select_policy" ON tournaments;
DROP POLICY IF EXISTS "tournaments_update_policy" ON tournaments;
DROP POLICY IF EXISTS "tournaments_delete_policy" ON tournaments;

-- RLSを有効化
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- 全操作を許可
CREATE POLICY "tournaments_insert_policy" ON tournaments FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "tournaments_select_policy" ON tournaments FOR SELECT TO public USING (true);
CREATE POLICY "tournaments_update_policy" ON tournaments FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "tournaments_delete_policy" ON tournaments FOR DELETE TO public USING (true);

-- ==========================================
-- players テーブル
-- ==========================================

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "players_insert_policy" ON players;
DROP POLICY IF EXISTS "players_select_policy" ON players;
DROP POLICY IF EXISTS "players_update_policy" ON players;
DROP POLICY IF EXISTS "players_delete_policy" ON players;

-- RLSを有効化
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- 全操作を許可
CREATE POLICY "players_insert_policy" ON players FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "players_select_policy" ON players FOR SELECT TO public USING (true);
CREATE POLICY "players_update_policy" ON players FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "players_delete_policy" ON players FOR DELETE TO public USING (true);

-- ==========================================
-- catches テーブル
-- ==========================================

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "catches_insert_policy" ON catches;
DROP POLICY IF EXISTS "catches_select_policy" ON catches;
DROP POLICY IF EXISTS "catches_update_policy" ON catches;
DROP POLICY IF EXISTS "catches_delete_policy" ON catches;

-- RLSを有効化
ALTER TABLE catches ENABLE ROW LEVEL SECURITY;

-- 全操作を許可
CREATE POLICY "catches_insert_policy" ON catches FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "catches_select_policy" ON catches FOR SELECT TO public USING (true);
CREATE POLICY "catches_update_policy" ON catches FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "catches_delete_policy" ON catches FOR DELETE TO public USING (true);

-- ==========================================
-- 確認
-- ==========================================

-- 全ポリシーを確認
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN qual = 'true' THEN '✅ 全て許可'
        ELSE qual 
    END as using_clause,
    CASE 
        WHEN with_check = 'true' THEN '✅ 全て許可'
        ELSE with_check 
    END as with_check_clause
FROM pg_policies
WHERE tablename IN ('tournaments', 'players', 'catches')
ORDER BY tablename, cmd;

-- テーブルのRLS状態を確認
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ 有効'
        ELSE '❌ 無効'
    END as rls_status
FROM pg_tables
WHERE tablename IN ('tournaments', 'players', 'catches')
ORDER BY tablename;
