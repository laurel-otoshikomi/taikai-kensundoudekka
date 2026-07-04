# 🚀 デプロイメントガイド

## 目次
1. [デプロイ環境](#デプロイ環境)
2. [初回セットアップ](#初回セットアップ)
3. [デプロイ手順](#デプロイ手順)
4. [ロールバック手順](#ロールバック手順)
5. [環境変数管理](#環境変数管理)
6. [データベースマイグレーション](#データベースマイグレーション)
7. [トラブルシューティング](#トラブルシューティング)

---

## 🌐 デプロイ環境

### 本番環境

#### Cloudflare Pages
- **URL**: https://taikai-kensundoudekka.pages.dev
- **プラン**: 無料プラン
- **ビルドコマンド**: `npm run build`
- **出力ディレクトリ**: `dist`
- **Node.jsバージョン**: 18.x

#### GitHub
- **リポジトリ**: https://github.com/laurel-otoshikomi/taikai-kensundoudekka
- **ブランチ**: `main` (本番用)
- **自動デプロイ**: 有効

#### Supabase
- **プロジェクトURL**: [YOUR_SUPABASE_URL]
- **データベース**: PostgreSQL 15
- **プラン**: 無料プラン

### デプロイフロー

```
ローカル開発
    │
    ├─ コード変更
    ├─ npm run build（ビルドテスト）
    └─ git commit
        │
        └─ git push origin main
                │
                ▼
        ┌──────────────────┐
        │  GitHub Repository │
        └────────┬───────────┘
                 │ Webhook
                 ▼
        ┌──────────────────┐
        │ Cloudflare Pages  │
        │  (自動ビルド)      │
        │  1. npm install   │
        │  2. npm run build │
        │  3. デプロイ       │
        └────────┬───────────┘
                 │ 約2-3分
                 ▼
        ┌──────────────────┐
        │  本番環境に反映    │
        │  (CDN配信開始)    │
        └──────────────────┘
```

---

## ⚙️ 初回セットアップ

### 1. Supabaseプロジェクト作成

#### 1.1 アカウント作成
1. https://supabase.com/ にアクセス
2. 「Start your project」をクリック
3. GitHub アカウントでサインイン

#### 1.2 新規プロジェクト作成
1. 「New Project」をクリック
2. プロジェクト名を入力（例: `taikai-kensundoudekka`）
3. データベースパスワードを設定（強力なパスワードを推奨）
4. リージョンを選択（日本: `Northeast Asia (Tokyo)`）
5. 「Create new project」をクリック（約2分で完了）

#### 1.3 データベース初期化
1. 左メニューから「SQL Editor」を選択
2. 以下のSQLを実行:

```sql
-- tournamentsテーブル作成
CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- playersテーブル作成
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    zekken INTEGER NOT NULL,
    name TEXT NOT NULL,
    club TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tournament_id, zekken)
);

-- catchesテーブル作成
CREATE TABLE catches (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    zekken INTEGER NOT NULL,
    length REAL CHECK (length IS NULL OR length > 0),
    weight INTEGER CHECK (weight IS NULL OR weight > 0),
    created_at TIMESTAMP DEFAULT NOW(),
    CHECK (length IS NOT NULL OR weight IS NOT NULL)
);

-- インデックス作成
CREATE INDEX idx_players_tournament ON players(tournament_id);
CREATE INDEX idx_catches_tournament_zekken ON catches(tournament_id, zekken);
CREATE INDEX idx_catches_created_at ON catches(created_at DESC);

-- コメント追加
COMMENT ON TABLE tournaments IS '大会情報';
COMMENT ON TABLE players IS '参加者情報';
COMMENT ON TABLE catches IS '釣果データ';
COMMENT ON COLUMN tournaments.logo IS 'ロゴ画像データ（base64エンコード）。管理者がアップロードしたロゴは全ユーザーに表示される。';
```

#### 1.4 API情報の取得
1. 左メニューから「Settings」→「API」を選択
2. 以下の情報をコピー:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOi...`

### 2. コードにSupabase情報を設定

#### main.js の編集
```javascript
// Supabase初期化
supabase = window.supabase.createClient(
    'YOUR_SUPABASE_URL',        // ← ここに Project URL を貼り付け
    'YOUR_SUPABASE_ANON_KEY'    // ← ここに anon key を貼り付け
);
```

### 3. GitHubリポジトリ作成

#### 3.1 新規リポジトリ作成
1. https://github.com/new にアクセス
2. リポジトリ名を入力（例: `taikai-kensundoudekka`）
3. 「Public」または「Private」を選択
4. 「Create repository」をクリック

#### 3.2 ローカルリポジトリと接続
```bash
cd /home/user/webapp

# Gitリポジトリ初期化（まだの場合）
git init

# リモートリポジトリを追加
git remote add origin https://github.com/YOUR_USERNAME/taikai-kensundoudekka.git

# ファイルを追加
git add .

# コミット
git commit -m "Initial commit"

# プッシュ
git branch -M main
git push -u origin main
```

### 4. Cloudflare Pages セットアップ

#### 4.1 Cloudflare アカウント作成
1. https://dash.cloudflare.com/sign-up にアクセス
2. メールアドレスとパスワードを入力
3. メール認証を完了

#### 4.2 プロジェクト作成
1. ダッシュボードから「Pages」を選択
2. 「Create a project」をクリック
3. 「Connect to Git」を選択
4. GitHubと連携（初回のみ）
5. リポジトリを選択（`taikai-kensundoudekka`）
6. 以下の設定を入力:
   - **Project name**: `taikai-kensundoudekka`
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: `18` (環境変数 `NODE_VERSION=18` を設定)
7. 「Save and Deploy」をクリック

#### 4.3 デプロイ完了確認
- 約2-3分で初回デプロイ完了
- 自動生成されたURL（`https://taikai-kensundoudekka.pages.dev`）にアクセス
- 正常に表示されることを確認

---

## 📦 デプロイ手順

### 通常のデプロイ（コード変更時）

#### 1. ローカルでビルドテスト
```bash
cd /home/user/webapp

# 依存関係が最新か確認
npm install

# ビルドテスト
npm run build

# ビルド成功を確認
ls -la dist/
```

#### 2. 変更をコミット
```bash
# 変更ファイルを確認
git status

# ファイルを追加
git add .

# コミット（わかりやすいメッセージを書く）
git commit -m "feat: カスタム削除モーダル追加"
```

**コミットメッセージの例**:
- `feat: 新機能追加`
- `fix: バグ修正`
- `style: UI改善`
- `refactor: リファクタリング`
- `docs: ドキュメント更新`

#### 3. GitHubにプッシュ
```bash
# mainブランチにプッシュ
git push origin main
```

#### 4. 自動デプロイの確認
1. Cloudflare Pages ダッシュボードにアクセス
2. プロジェクト「taikai-kensundoudekka」を選択
3. 「Deployments」タブで進捗確認
4. ステータスが「Success」になるまで待機（約2-3分）

#### 5. 本番環境で動作確認
```
https://taikai-kensundoudekka.pages.dev
```
- ブラウザで Ctrl + Shift + R（強制リロード）
- 変更が反映されているか確認

---

## 🔄 ロールバック手順

### 方法1: Cloudflare Pages ダッシュボードから

#### 手順
1. Cloudflare Pages ダッシュボードにアクセス
2. プロジェクト「taikai-kensundoudekka」を選択
3. 「Deployments」タブを開く
4. 過去のデプロイ履歴から、戻したいバージョンを探す
5. 右側の「...」メニューから「Rollback to this deployment」をクリック
6. 確認ダイアログで「Rollback」をクリック

**所要時間**: 約30秒

### 方法2: Gitから巻き戻し

#### 手順
```bash
cd /home/user/webapp

# コミット履歴を確認
git log --oneline

# 戻したいコミットのハッシュをコピー（例: abc1234）
git revert abc1234

# または、強制的に戻す（注意: 履歴が変わる）
git reset --hard abc1234
git push -f origin main
```

**注意**: `git push -f` は他の開発者がいる場合は避ける

---

## 🔧 環境変数管理

### Cloudflare Pages での環境変数設定

#### 設定方法
1. Cloudflare Pages ダッシュボードにアクセス
2. プロジェクト「taikai-kensundoudekka」を選択
3. 「Settings」→「Environment variables」を開く
4. 「Add variable」をクリック
5. 変数名と値を入力
6. 「Production」または「Preview」を選択
7. 「Save」をクリック

#### 推奨される環境変数

| 変数名 | 値 | 説明 |
|--------|-----|------|
| `NODE_VERSION` | `18` | Node.jsバージョン |
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase URL（将来的に） |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbG...` | Supabase anon key（将来的に） |

**現在の実装**: Supabase情報はハードコードされているため、環境変数は不要。

**将来の改善**: セキュリティ向上のため、環境変数に移行推奨。

---

## 🗄️ データベースマイグレーション

### マイグレーションファイルの管理

#### 既存のマイグレーション
```
migrations/
├── add_logo_column.sql           # ロゴカラム追加
└── README_logo_migration.md      # 実行手順
```

### 新しいマイグレーションの作成

#### 1. マイグレーションファイル作成
```bash
cd /home/user/webapp/migrations

# ファイル名: YYYYMMDD_description.sql
touch 20260704_add_user_roles.sql
```

#### 2. SQLを記述
```sql
-- 20260704_add_user_roles.sql

-- ユーザーロールテーブル追加
CREATE TABLE user_roles (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    auth_level INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- インデックス追加
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);

-- コメント追加
COMMENT ON TABLE user_roles IS 'ユーザー権限レベル管理';
```

#### 3. README更新
```bash
# migrations/README.md に実行手順を追記
```

### マイグレーション実行

#### Supabase ダッシュボードから実行
1. Supabase ダッシュボードにアクセス
2. 左メニューから「SQL Editor」を選択
3. マイグレーションファイルの内容をコピー&ペースト
4. 「Run」をクリック
5. 成功メッセージを確認

#### CLI から実行（Supabase CLIがある場合）
```bash
# Supabase CLIインストール
npm install -g supabase

# ログイン
supabase login

# マイグレーション実行
supabase db push
```

### マイグレーションのロールバック

#### 手動ロールバック用SQLを用意
```sql
-- 20260704_add_user_roles_rollback.sql

-- user_rolesテーブルを削除
DROP TABLE IF EXISTS user_roles;
```

---

## 🐛 トラブルシューティング

### デプロイが失敗する

#### 原因1: ビルドエラー
**症状**: Cloudflare Pagesで「Build failed」と表示される

**確認方法**:
```bash
cd /home/user/webapp
npm run build
```

**解決方法**:
- エラーメッセージを確認
- 構文エラーがあれば修正
- `package.json` の依存関係を確認

#### 原因2: Node.jsバージョン不一致
**症状**: ビルドログに「Unsupported Node.js version」と表示される

**解決方法**:
1. Cloudflare Pages ダッシュボードにアクセス
2. 「Settings」→「Environment variables」
3. `NODE_VERSION` を `18` に設定
4. デプロイを再試行

### デプロイ後に変更が反映されない

#### 原因1: ブラウザキャッシュ
**解決方法**:
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

#### 原因2: CDNキャッシュ
**解決方法**:
1. Cloudflare ダッシュボードにアクセス
2. 「Caching」→「Configuration」
3. 「Purge Everything」をクリック

### データベース接続エラー

#### 症状
ブラウザのコンソールに以下のエラーが表示される:
```
Failed to fetch
CORS policy error
```

#### 解決方法1: Supabase URLの確認
```javascript
// main.js で正しいURLが設定されているか確認
supabase = window.supabase.createClient(
    'https://xxxxx.supabase.co',  // ← 正しいか確認
    'eyJhbGciOi...'
);
```

#### 解決方法2: Supabaseの公開設定確認
1. Supabase ダッシュボード
2. 「Settings」→「API」
3. 「Project URL」と「anon key」が正しいか確認

### ロゴがアップロードできない

#### 症状
ロゴをアップロードすると、コンソールにエラーが表示される:
```
column "logo" does not exist
```

#### 解決方法
マイグレーション未実行が原因。以下を実行:

```sql
-- migrations/add_logo_column.sql
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS logo TEXT;
```

1. Supabase SQL Editorで実行
2. ページをリロード
3. 再度アップロードを試す

### デプロイは成功するが、ページが真っ白

#### 原因: JavaScriptエラー
**確認方法**:
1. ブラウザで F12 を押す
2. 「Console」タブを開く
3. エラーメッセージを確認

**一般的なエラー**:
- `supabase is not defined` → Supabaseクライアントの初期化失敗
- `Uncaught ReferenceError` → 未定義の変数や関数を使用

**解決方法**:
- エラーメッセージに従って修正
- ローカルでテストしてから再デプロイ

---

## 📊 デプロイ履歴の確認

### Cloudflare Pagesダッシュボード
1. https://dash.cloudflare.com/ にアクセス
2. 「Pages」を選択
3. プロジェクト「taikai-kensundoudekka」をクリック
4. 「Deployments」タブで履歴確認

**表示される情報**:
- デプロイ日時
- コミットハッシュ
- コミットメッセージ
- ビルド時間
- ステータス（Success / Failed）

### GitHubリポジトリ
```bash
cd /home/user/webapp

# コミット履歴を表示
git log --oneline --graph --all

# 最近10件のコミットを表示
git log -10 --pretty=format:"%h - %an, %ar : %s"
```

---

## 🔐 本番環境のセキュリティ

### HTTPS通信
- Cloudflare Pagesは自動的にHTTPSを有効化
- 無料のSSL証明書を提供

### CORS設定
- Supabaseは自動的にCORSを設定
- 必要に応じて、許可するオリジンを制限可能

### DDoS保護
- Cloudflareが自動的にDDoS攻撃を検出・軽減

### アクセス制限（オプション）
Cloudflare Access を使用して、特定のIPアドレスのみアクセス許可可能。

**設定方法**:
1. Cloudflare ダッシュボード
2. 「Zero Trust」→「Access」
3. アプリケーションを追加
4. アクセスポリシーを設定

---

## 📈 本番環境の監視

### Cloudflare Analytics
1. Cloudflare Pages ダッシュボード
2. 「Analytics」タブ
3. 以下の情報を確認:
   - ページビュー数
   - ユニークビジター数
   - データ転送量
   - レスポンス時間

### Supabase Analytics
1. Supabase ダッシュボード
2. 「Reports」タブ
3. 以下の情報を確認:
   - API リクエスト数
   - データベース接続数
   - ストレージ使用量

---

## 🎯 デプロイチェックリスト

### デプロイ前
- [ ] ローカルで `npm run build` が成功する
- [ ] ブラウザでローカルテスト完了
- [ ] コンソールにエラーが出ない
- [ ] モバイル表示を確認
- [ ] Git コミットメッセージが明確

### デプロイ後
- [ ] 本番URLにアクセスできる
- [ ] 全ページが正常に表示される
- [ ] データベース接続が正常
- [ ] ロゴが表示される（アップロード済みの場合）
- [ ] テーマカラーが正しく適用される
- [ ] モバイルで表示確認

### 緊急時の対応準備
- [ ] ロールバック手順を把握
- [ ] Supabaseのバックアップを定期的に取得
- [ ] 連絡先を共有（チーム開発の場合）

---

## 📞 サポートリソース

### 公式ドキュメント
- Cloudflare Pages: https://developers.cloudflare.com/pages/
- Supabase: https://supabase.com/docs
- Vite: https://vitejs.dev/

### コミュニティ
- Cloudflare Discord: https://discord.gg/cloudflaredev
- Supabase Discord: https://discord.supabase.com/

---

**最終更新**: 2026-07-04
