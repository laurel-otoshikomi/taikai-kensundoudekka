-- ===================================
-- 🎣 釣果管理システム - データベース構築SQL
-- ===================================

-- 1. tournamentsテーブル（大会情報）
CREATE TABLE public.tournaments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    staff_password TEXT NOT NULL,
    rule_type TEXT DEFAULT '長寸',
    limit_count INTEGER DEFAULT 0,
    sort1 TEXT DEFAULT 'max_len',
    sort2 TEXT DEFAULT 'limit_weight',
    sort3 TEXT DEFAULT 'count',
    is_finished BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. playersテーブル（選手情報）
CREATE TABLE public.players (
    id BIGSERIAL PRIMARY KEY,
    tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    zekken INTEGER NOT NULL,
    name TEXT NOT NULL,
    club TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, zekken)
);

-- 3. catchesテーブル（釣果情報）
CREATE TABLE public.catches (
    id BIGSERIAL PRIMARY KEY,
    tournament_id TEXT NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
    zekken INTEGER NOT NULL,
    length DECIMAL(10, 2) NOT NULL,
    weight DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックスを作成（高速化）
CREATE INDEX idx_players_tournament ON public.players(tournament_id);
CREATE INDEX idx_players_zekken ON public.players(zekken);
CREATE INDEX idx_catches_tournament ON public.catches(tournament_id);
CREATE INDEX idx_catches_zekken ON public.catches(zekken);

-- RLSを有効化
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catches ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 全員が読み取り可能
CREATE POLICY "tournaments_public_read" ON public.tournaments 
    FOR SELECT USING (true);

CREATE POLICY "players_public_read" ON public.players 
    FOR SELECT USING (true);

CREATE POLICY "catches_public_read" ON public.catches 
    FOR SELECT USING (true);

-- RLSポリシー: 全員が挿入可能
CREATE POLICY "players_public_insert" ON public.players 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "catches_public_insert" ON public.catches 
    FOR INSERT WITH CHECK (true);

-- RLSポリシー: 全員が削除可能
CREATE POLICY "players_public_delete" ON public.players 
    FOR DELETE USING (true);

CREATE POLICY "catches_public_delete" ON public.catches 
    FOR DELETE USING (true);

-- RLSポリシー: 全員が更新可能
CREATE POLICY "players_public_update" ON public.players 
    FOR UPDATE USING (true);

CREATE POLICY "catches_public_update" ON public.catches 
    FOR UPDATE USING (true);

-- ===================================
-- テストデータ投入
-- ===================================

-- テスト用の大会を作成
INSERT INTO public.tournaments (id, name, password, staff_password) 
VALUES ('test', 'テスト大会', 'admin123', 'staff123');

-- テスト用の選手を作成
INSERT INTO public.players (tournament_id, zekken, name, club) VALUES
('test', 1, '山田太郎', 'Aチーム'),
('test', 2, '佐藤花子', 'Bチーム'),
('test', 3, '鈴木一郎', 'Cチーム'),
('test', 5, 'テスト太郎', 'テストクラブ'),
('test', 10, '田中次郎', 'Dチーム');

-- テスト用の釣果を作成
INSERT INTO public.catches (tournament_id, zekken, length, weight) VALUES
('test', 1, 52.5, 2100),
('test', 1, 48.3, 1800),
('test', 2, 55.0, 2500),
('test', 3, 50.0, 2000);

-- ===================================
-- 確認クエリ
-- ===================================

-- テーブルが作成されたか確認
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tournaments', 'players', 'catches');

-- データが入っているか確認
SELECT 'tournaments' as table_name, COUNT(*) as count FROM public.tournaments
UNION ALL
SELECT 'players', COUNT(*) FROM public.players
UNION ALL
SELECT 'catches', COUNT(*) FROM public.catches;
