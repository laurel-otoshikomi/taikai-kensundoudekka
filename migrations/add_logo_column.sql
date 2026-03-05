-- tournamentsテーブルにlogoカラムを追加
-- ロゴ画像データ（base64エンコード）を保存するためのカラム

ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS logo TEXT;

-- カラムのコメント追加
COMMENT ON COLUMN tournaments.logo IS 'ロゴ画像データ（base64エンコード）。管理者がアップロードしたロゴは全ユーザーに表示される。';
