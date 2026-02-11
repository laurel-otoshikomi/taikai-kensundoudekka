# Supabase RLSポリシー修正手順

## 問題
現在、匿名ユーザー（anon）がデータを読み取れないため、アプリが動作していません。

## 修正方法

### 1. Supabaseダッシュボードにアクセス
https://supabase.com/dashboard/project/pajzsgbnoqdinvfmvlog

### 2. SQL Editorを開く
左メニューの「SQL Editor」をクリック

### 3. 以下のSQLを実行

```sql
-- tournamentsテーブル: 全員が読み取り可能
DROP POLICY IF EXISTS "tournaments_select_policy" ON public.tournaments;
CREATE POLICY "tournaments_select_policy" ON public.tournaments
FOR SELECT USING (true);

-- playersテーブル: 全員が読み取り可能
DROP POLICY IF EXISTS "players_select_policy" ON public.players;
CREATE POLICY "players_select_policy" ON public.players
FOR SELECT USING (true);

-- playersテーブル: 全員が挿入可能（テスト用）
DROP POLICY IF EXISTS "players_insert_policy" ON public.players;
CREATE POLICY "players_insert_policy" ON public.players
FOR INSERT WITH CHECK (true);

-- playersテーブル: 全員が削除可能（テスト用）
DROP POLICY IF EXISTS "players_delete_policy" ON public.players;
CREATE POLICY "players_delete_policy" ON public.players
FOR DELETE USING (true);

-- catchesテーブル: 全員が読み取り可能
DROP POLICY IF EXISTS "catches_select_policy" ON public.catches;
CREATE POLICY "catches_select_policy" ON public.catches
FOR SELECT USING (true);

-- catchesテーブル: 全員が挿入可能
DROP POLICY IF EXISTS "catches_insert_policy" ON public.catches;
CREATE POLICY "catches_insert_policy" ON public.catches
FOR INSERT WITH CHECK (true);

-- catchesテーブル: 全員が削除可能（管理者用）
DROP POLICY IF EXISTS "catches_delete_policy" ON public.catches;
CREATE POLICY "catches_delete_policy" ON public.catches
FOR DELETE USING (true);
```

### 4. 実行ボタンをクリック

### 5. アプリをリロードして確認

---

## 代替案：RLSを一時的に無効化（開発中のみ）

もしポリシーの設定が面倒な場合、一時的にRLSを無効化することもできます：

```sql
-- RLSを無効化（本番環境では推奨しません）
ALTER TABLE public.tournaments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.players DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.catches DISABLE ROW LEVEL SECURITY;
```

---

## 確認方法

1. 上記のSQLを実行
2. https://taikai-kensundoudekka.pages.dev/ にアクセス
3. F12でコンソールを開く
4. エラーが消えていることを確認
5. 大会にログインして選手登録をテスト

---

## セキュリティについて

**本番環境では、適切なRLSポリシーを設定してください。**

例：
- 読み取り：全員可能
- 書き込み：ログインユーザーのみ
- 削除：管理者のみ

ただし、このアプリはパスワード認証を独自実装しているため、
Supabase Authを使っていません。そのため、RLSポリシーでは
「全員許可」にするか、独自のセキュリティロジックを実装する必要があります。
