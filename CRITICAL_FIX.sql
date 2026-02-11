-- ===================================
-- 🚨 緊急修正: UPDATE権限を追加
-- ===================================

-- ⚠️ このSQLを実行しないと設定が保存できません

-- players テーブル
DROP POLICY IF EXISTS "players_public_update" ON public.players;
CREATE POLICY "players_public_update" 
ON public.players 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- tournaments テーブル（これが最重要！）
DROP POLICY IF EXISTS "tournaments_public_update" ON public.tournaments;
CREATE POLICY "tournaments_public_update" 
ON public.tournaments 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- catches テーブル
DROP POLICY IF EXISTS "catches_public_update" ON public.catches;
CREATE POLICY "catches_public_update" 
ON public.catches 
FOR UPDATE 
USING (true) 
WITH CHECK (true);

-- ===================================
-- 確認クエリ
-- ===================================
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('players', 'tournaments', 'catches')
ORDER BY tablename, cmd, policyname;

-- 期待される結果:
-- tournaments テーブルに以下が表示されるべき:
--   tournaments | tournaments_public_read   | SELECT
--   tournaments | tournaments_public_update | UPDATE  ← これが重要！
