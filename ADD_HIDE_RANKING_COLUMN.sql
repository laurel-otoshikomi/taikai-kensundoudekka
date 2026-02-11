-- tournamentsテーブルにhide_rankingカラムを追加
-- このSQLをSupabase SQL Editorで実行してください

ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS hide_ranking BOOLEAN DEFAULT FALSE;

-- 既存のデータにデフォルト値を設定
UPDATE tournaments 
SET hide_ranking = FALSE 
WHERE hide_ranking IS NULL;

-- 確認
SELECT id, name, hide_ranking FROM tournaments;
