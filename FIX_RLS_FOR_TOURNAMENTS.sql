-- tournamentsテーブルのRLS（Row Level Security）ポリシーを修正
-- Supabase SQL Editorで実行してください

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "tournaments_insert_policy" ON tournaments;
DROP POLICY IF EXISTS "tournaments_select_policy" ON tournaments;
DROP POLICY IF EXISTS "tournaments_update_policy" ON tournaments;
DROP POLICY IF EXISTS "tournaments_delete_policy" ON tournaments;

-- RLSを有効化
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- 誰でも大会を作成できる（INSERT）
CREATE POLICY "tournaments_insert_policy" 
ON tournaments 
FOR INSERT 
TO public
WITH CHECK (true);

-- 誰でも大会を閲覧できる（SELECT）
CREATE POLICY "tournaments_select_policy" 
ON tournaments 
FOR SELECT 
TO public
USING (true);

-- 誰でも大会を更新できる（UPDATE）
-- ※ アプリ側で管理者チェックを行っているため
CREATE POLICY "tournaments_update_policy" 
ON tournaments 
FOR UPDATE 
TO public
USING (true)
WITH CHECK (true);

-- 誰でも大会を削除できる（DELETE）
-- ※ アプリ側で管理者チェックを行っているため
CREATE POLICY "tournaments_delete_policy" 
ON tournaments 
FOR DELETE 
TO public
USING (true);

-- 確認
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'tournaments';
