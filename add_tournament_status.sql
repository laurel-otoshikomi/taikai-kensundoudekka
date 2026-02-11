-- 大会テーブルに終了フラグを追加
-- 実行: Supabase SQL Editorで実行してください

-- is_ended カラムを追加（デフォルトはfalse = 進行中）
ALTER TABLE tournaments
ADD COLUMN IF NOT EXISTS is_ended BOOLEAN DEFAULT false;

-- コメントを追加
COMMENT ON COLUMN tournaments.is_ended IS '大会が終了しているかどうか（true = 終了、false = 進行中）';

-- 既存の大会は進行中に設定
UPDATE tournaments
SET is_ended = false
WHERE is_ended IS NULL;

-- 確認用: 大会の状態を表示
-- SELECT id, name, is_ended, created_at FROM tournaments ORDER BY created_at DESC;
