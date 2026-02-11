-- 選手テーブルに読み仮名（ひらがな）フィールドを追加
-- 実行: Supabase SQL Editorで実行してください

-- reading カラムを追加（既存データはNULLになります）
ALTER TABLE players
ADD COLUMN IF NOT EXISTS reading TEXT;

-- 既存の選手データに対して、名前から自動生成した読み仮名を設定
-- ※ これは暫定的な措置です。実際には手動で正しい読み仮名を入力してください
COMMENT ON COLUMN players.reading IS '選手名の読み仮名（ひらがな）';

-- インデックスを追加して検索を高速化
CREATE INDEX IF NOT EXISTS idx_players_reading ON players (reading);
CREATE INDEX IF NOT EXISTS idx_players_name ON players (name);

-- 確認用: 選手データの表示
-- SELECT zekken, name, reading, club FROM players ORDER BY zekken;
