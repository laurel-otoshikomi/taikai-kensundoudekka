-- ===================================
-- 📝 読み仮名フィールドを追加
-- ===================================

-- playersテーブルに reading カラムを追加
ALTER TABLE public.players 
ADD COLUMN IF NOT EXISTS reading TEXT DEFAULT '';

-- 既存のテストデータに読み仮名を追加
UPDATE public.players SET reading = 'やまだたろう' WHERE name = '山田太郎';
UPDATE public.players SET reading = 'さとうはなこ' WHERE name = '佐藤花子';
UPDATE public.players SET reading = 'すずきいちろう' WHERE name = '鈴木一郎';
UPDATE public.players SET reading = 'てすとたろう' WHERE name = 'テスト太郎';
UPDATE public.players SET reading = 'たなかじろう' WHERE name = '田中次郎';

-- 確認クエリ
SELECT id, tournament_id, zekken, name, reading, club 
FROM public.players 
ORDER BY zekken;
