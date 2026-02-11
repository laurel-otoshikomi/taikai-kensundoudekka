# 🎣 釣果管理システム - 完全再構築ガイド

## Step 1: 新しいSupabaseプロジェクトを作成

1. **Supabaseダッシュボードにアクセス**
   - https://supabase.com/dashboard

2. **「New Project」をクリック**

3. **プロジェクト情報を入力**
   - Name: `taikai-system-v2`
   - Database Password: 強力なパスワードを生成
   - Region: `Northeast Asia (Tokyo)`
   - Pricing Plan: `Free`

4. **プロジェクトが作成されるまで待つ**（2-3分）

---

## Step 2: データベーステーブルを作成

### **SQL Editorで以下を実行**

```sql
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
CREATE INDEX idx_catches_tournament ON public.catches(tournament_id);
CREATE INDEX idx_catches_zekken ON public.catches(zekken);

-- RLSを有効化
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catches ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 全員が読み取り可能
CREATE POLICY "tournaments_public_read" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "players_public_read" ON public.players FOR SELECT USING (true);
CREATE POLICY "catches_public_read" ON public.catches FOR SELECT USING (true);

-- RLSポリシー: 全員が挿入可能
CREATE POLICY "players_public_insert" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "catches_public_insert" ON public.catches FOR INSERT WITH CHECK (true);

-- RLSポリシー: 全員が削除可能
CREATE POLICY "players_public_delete" ON public.players FOR DELETE USING (true);
CREATE POLICY "catches_public_delete" ON public.catches FOR DELETE USING (true);
```

---

## Step 3: テストデータを投入

```sql
-- テスト用の大会を作成
INSERT INTO public.tournaments (id, name, password, staff_password) 
VALUES ('test', 'テスト大会', 'admin123', 'staff123');

-- テスト用の選手を作成
INSERT INTO public.players (tournament_id, zekken, name, club) VALUES
('test', 1, '山田太郎', 'Aチーム'),
('test', 2, '佐藤花子', 'Bチーム'),
('test', 3, '鈴木一郎', 'Cチーム'),
('test', 5, 'テスト太郎', 'テストクラブ');
```

---

## Step 4: API設定を確認

1. **Settings** → **API** に移動
2. **以下の情報をコピー**:
   - Project URL (例: `https://xxxxx.supabase.co`)
   - anon public key

---

## Step 5: アプリのコードを更新

`main.js`の先頭を以下に置き換え：

```javascript
// Supabaseをインポート
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// ⚠️ ここに新しいプロジェクトの情報を入れる
const supabaseUrl = 'https://あなたのプロジェクトID.supabase.co';
const supabaseKey = 'あなたのanon public key';
const client = createClient(supabaseUrl, supabaseKey);
```

---

## Step 6: 動作確認

1. アプリにアクセス
2. 大会ID「test」で参加
3. パスワード「admin123」でログイン
4. 選手が表示されることを確認
5. 釣果登録をテスト

---

## 完了！

これで完全にクリーンな環境で動作します 🎉
