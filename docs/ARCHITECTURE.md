# 🏗️ システム設計ドキュメント

## 目次
1. [システムアーキテクチャ](#システムアーキテクチャ)
2. [データベース設計](#データベース設計)
3. [フロントエンド設計](#フロントエンド設計)
4. [データフロー](#データフロー)
5. [セキュリティ設計](#セキュリティ設計)
6. [パフォーマンス最適化](#パフォーマンス最適化)

---

## 🏛️ システムアーキテクチャ

### 全体構成

```
┌──────────────────────────────────────────┐
│           ユーザー（ブラウザ）              │
└────────────────┬─────────────────────────┘
                 │ HTTPS
                 ▼
┌──────────────────────────────────────────┐
│      Cloudflare Pages (静的ホスティング)   │
│  ┌────────────────────────────────────┐  │
│  │  index.html + main.js (Viteビルド)  │  │
│  └────────────────────────────────────┘  │
└────────────────┬─────────────────────────┘
                 │ REST API (Supabase Client)
                 ▼
┌──────────────────────────────────────────┐
│         Supabase (BaaS)                  │
│  ┌────────────────────────────────────┐  │
│  │  PostgreSQL Database               │  │
│  │  - tournaments                     │  │
│  │  - players                         │  │
│  │  - catches                         │  │
│  └────────────────────────────────────┘  │
│  ┌────────────────────────────────────┐  │
│  │  Auth (認証・権限管理)               │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

### 技術スタック詳細

#### フロントエンド層
- **フレームワーク**: なし（バニラJavaScript）
- **ビルドツール**: Vite 5.x
- **スタイリング**: CSS3（カスタム変数使用）
- **デプロイ**: Cloudflare Pages

**選定理由**:
- シンプルさと保守性を重視
- ビルドサイズの最小化
- 学習コストの低減

#### バックエンド層
- **データベース**: Supabase PostgreSQL 15
- **API**: Supabase REST API（自動生成）
- **認証**: Supabase Auth（現在は簡易実装）

**選定理由**:
- サーバーレスでスケーラブル
- リアルタイム機能の将来的な拡張可能性
- 無料プランで十分な機能

---

## 🗄️ データベース設計

### ERダイアグラム

```
tournaments (大会)
├── id (PK)
├── name
├── logo (base64)
└── created_at
    │
    │ 1:N
    ▼
players (参加者)
├── id (PK)
├── tournament_id (FK) ──┐
├── zekken             │
├── name               │
├── club               │
└── created_at         │
                       │
                       │ 1:N
                       ▼
              catches (釣果)
              ├── id (PK)
              ├── tournament_id (FK)
              ├── zekken
              ├── length
              ├── weight
              └── created_at
```

### テーブル定義

#### tournaments テーブル
**目的**: 大会情報を管理

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | SERIAL | PRIMARY KEY | 大会ID（自動採番） |
| name | TEXT | NOT NULL | 大会名 |
| logo | TEXT | NULL | ロゴ画像（base64エンコード） |
| created_at | TIMESTAMP | DEFAULT NOW() | 作成日時 |

**インデックス**:
- PRIMARY KEY (id)

**SQL定義**:
```sql
CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE tournaments IS '大会情報';
COMMENT ON COLUMN tournaments.logo IS 'ロゴ画像データ（base64エンコード）。管理者がアップロードしたロゴは全ユーザーに表示される。';
```

#### players テーブル
**目的**: 参加者情報を管理

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | SERIAL | PRIMARY KEY | 参加者ID（自動採番） |
| tournament_id | INTEGER | NOT NULL, FOREIGN KEY | 大会ID |
| zekken | INTEGER | NOT NULL | ゼッケン番号（1-999） |
| name | TEXT | NOT NULL | 参加者名 |
| club | TEXT | NULL | 所属（任意） |
| created_at | TIMESTAMP | DEFAULT NOW() | 登録日時 |

**制約**:
- UNIQUE(tournament_id, zekken) - 同一大会内でゼッケン番号は一意
- FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE

**インデックス**:
- PRIMARY KEY (id)
- UNIQUE INDEX (tournament_id, zekken)
- INDEX (tournament_id) - 大会ごとの参加者検索用

**SQL定義**:
```sql
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    zekken INTEGER NOT NULL,
    name TEXT NOT NULL,
    club TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(tournament_id, zekken)
);

CREATE INDEX idx_players_tournament ON players(tournament_id);

COMMENT ON TABLE players IS '参加者情報';
```

#### catches テーブル
**目的**: 釣果データを管理

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | SERIAL | PRIMARY KEY | 釣果ID（自動採番） |
| tournament_id | INTEGER | NOT NULL, FOREIGN KEY | 大会ID |
| zekken | INTEGER | NOT NULL | ゼッケン番号 |
| length | REAL | NULL | 長さ（cm） |
| weight | INTEGER | NULL | 重さ（g） |
| created_at | TIMESTAMP | DEFAULT NOW() | 登録日時 |

**制約**:
- FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
- CHECK (length > 0 OR weight > 0) - 長さまたは重さの少なくとも一方は必須

**インデックス**:
- PRIMARY KEY (id)
- INDEX (tournament_id, zekken) - ゼッケンごとの釣果検索用
- INDEX (created_at DESC) - 最近の登録履歴表示用

**SQL定義**:
```sql
CREATE TABLE catches (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    zekken INTEGER NOT NULL,
    length REAL CHECK (length IS NULL OR length > 0),
    weight INTEGER CHECK (weight IS NULL OR weight > 0),
    created_at TIMESTAMP DEFAULT NOW(),
    CHECK (length IS NOT NULL OR weight IS NOT NULL)
);

CREATE INDEX idx_catches_tournament_zekken ON catches(tournament_id, zekken);
CREATE INDEX idx_catches_created_at ON catches(created_at DESC);

COMMENT ON TABLE catches IS '釣果データ';
```

### データ整合性

#### カスケード削除
- 大会を削除すると、関連する参加者と釣果が自動削除される
- `ON DELETE CASCADE` で実装

#### ゼッケン番号の一意性
- 同一大会内でゼッケン番号は重複不可
- `UNIQUE(tournament_id, zekken)` 制約で保証

#### 釣果の必須項目
- 長さまたは重さの少なくとも一方は必須
- `CHECK` 制約で保証

---

## 🎨 フロントエンド設計

### ファイル構成

```
webapp/
├── index.html          # HTMLテンプレート
├── main.js            # アプリケーションロジック
├── vite.config.js     # Viteビルド設定
└── package.json       # 依存関係
```

### main.js の構造

#### グローバル変数
```javascript
let supabase;           // Supabaseクライアント
let CONFIG = {};        // 大会設定
let PLAYERS = [];       // 参加者リスト
let CATCHES = [];       // 釣果リスト
let AUTH_LEVEL = 0;     // 権限レベル
```

#### 主要な関数グループ

##### 初期化関連
- `initApp()` - アプリケーション初期化
- `setupAuth()` - 権限管理セットアップ

##### 大会管理
- `loadTournaments()` - 大会一覧読み込み
- `createTournament()` - 新規大会作成
- `openTournament(id)` - 大会を開く
- `deleteTournament(id)` - 大会削除
- `closeTournament()` - 大会を閉じる

##### 参加者管理
- `registerPlayer()` - 参加者登録
- `updatePlayerSelect()` - ゼッケン選択更新

##### 釣果管理
- `registerCatch()` - 釣果登録
- `editCatch(id, zekken, length, weight)` - 釣果編集
- `deleteCatch(id)` - 釣果削除（エントリーポイント）
- `showDeleteConfirmDialog(catchId)` - カスタム削除モーダル表示
- `confirmDeleteCatch(catchId)` - 削除実行
- `closeDeleteConfirmDialog()` - モーダルを閉じる

##### ランキング
- `updateRankings()` - ランキング計算・表示
- `showPlayerDetail(zekken)` - 参加者詳細表示

##### トップページ
- `renderTopPage()` - トップページレンダリング
- `switchTopTab(tab)` - タブ切り替え（長さ/重さ）

##### UI/UXカスタマイズ
- `uploadLogo()` - ロゴアップロード
- `applyThemeColors()` - テーマカラー適用
- `setThemeColors(primary, secondary, heading)` - テーマカラー設定
- `lightenColor(color, percent)` - 色を明るくする
- `darkenColor(color, percent)` - 色を暗くする

### ページ遷移

```
大会選択ページ (#tournament-select-page)
    │
    ├─ 新規大会作成 → createTournament()
    │
    └─ 大会選択 → openTournament(id)
                      │
                      ▼
            ┌─────────────────────────┐
            │  メインページ (#main-page) │
            └─────────────────────────┘
                      │
                      ├─ 参加者登録 → registerPlayer()
                      ├─ 釣果登録 → registerCatch()
                      ├─ 釣果編集 → editCatch()
                      ├─ 釣果削除 → deleteCatch()
                      └─ トップページへ → showPage('top-page')
                                              │
                                              ▼
                                    ┌──────────────────────┐
                                    │ トップページ (#top-page) │
                                    └──────────────────────┘
                                              │
                                              └─ メインページへ → showPage('main-page')
```

### CSS変数システム

#### 定義箇所: index.html
```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #7c3aed;
    --heading-color: #1e3a8a;
}
```

#### 適用される要素
- ボタン背景（`.btn`, `.btn-primary`）
- 見出し（`h1`, `h2`, `h3`）
- タブ（`.tab.active`）
- モーダル背景
- カードグラデーション
- テキストカラー

#### 動的変更
```javascript
document.documentElement.style.setProperty('--primary-color', '#2563eb');
document.documentElement.style.setProperty('--secondary-color', '#7c3aed');
document.documentElement.style.setProperty('--heading-color', '#1e3a8a');
```

---

## 🔄 データフロー

### 釣果登録のフロー

```
┌──────────────┐
│ ユーザー入力  │
└──────┬───────┘
       │ ゼッケン、長さ、重さ
       ▼
┌──────────────────┐
│ バリデーション    │
│ - 必須項目チェック │
│ - 数値範囲チェック │
└──────┬───────────┘
       │ OK
       ▼
┌──────────────────┐
│ Supabase INSERT  │
│ → catches テーブル │
└──────┬───────────┘
       │ 成功
       ▼
┌──────────────────┐
│ CATCHES配列更新   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ updateRankings() │
│ - ランキング再計算 │
│ - UI更新         │
└──────────────────┘
```

### ランキング計算のフロー

```
┌──────────────┐
│ CATCHES配列   │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────┐
│ 参加者ごとに釣果をグループ化  │
│ Map<zekken, catches[]>       │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ 各参加者の最大値を計算        │
│ - 最大長さ                   │
│ - 最大重さ                   │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ ソート（降順）               │
│ - 長さランキング              │
│ - 重さランキング              │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ 順位付け                     │
│ （同率の場合は同順位）        │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│ HTMLレンダリング             │
│ - ランキングテーブル          │
│ - トップページカード          │
└─────────────────────────────┘
```

### ロゴアップロードのフロー

```
┌──────────────┐
│ ファイル選択   │
└──────┬───────┘
       │ 画像ファイル
       ▼
┌──────────────────┐
│ FileReader      │
│ → base64エンコード │
└──────┬───────────┘
       │ base64文字列
       ▼
┌──────────────────┐
│ Supabase UPDATE  │
│ → tournaments.logo │
└──────┬───────────┘
       │ 成功
       ▼
┌──────────────────┐
│ CONFIG.logo更新   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ ロゴ表示          │
│ <img src="...">  │
└──────────────────┘
```

---

## 🔒 セキュリティ設計

### 現在の実装

#### クライアントサイドの権限チェック
```javascript
// 編集・削除ボタンの表示制御
${AUTH_LEVEL >= 1 ? `
    <button onclick="editCatch(...)">編集</button>
` : ''}
```

**問題点**:
- JavaScriptで制御しているため、改ざん可能
- バックエンドでの権限チェックが必要

### 推奨される改善案

#### 1. Supabase RLS (Row Level Security) の実装

**tournaments テーブル**:
```sql
-- 全員が閲覧可能
CREATE POLICY "Enable read access for all users" ON tournaments
    FOR SELECT USING (true);

-- 管理者のみが作成・更新・削除可能
CREATE POLICY "Enable insert for administrators" ON tournaments
    FOR INSERT WITH CHECK (auth.jwt()->>'auth_level' = '2');

CREATE POLICY "Enable update for administrators" ON tournaments
    FOR UPDATE USING (auth.jwt()->>'auth_level' = '2');

CREATE POLICY "Enable delete for administrators" ON tournaments
    FOR DELETE USING (auth.jwt()->>'auth_level' = '2');
```

**players テーブル**:
```sql
-- 全員が閲覧可能
CREATE POLICY "Enable read access for all users" ON players
    FOR SELECT USING (true);

-- スタッフ以上が登録可能
CREATE POLICY "Enable insert for staff" ON players
    FOR INSERT WITH CHECK (auth.jwt()->>'auth_level' >= '1');
```

**catches テーブル**:
```sql
-- 全員が閲覧可能
CREATE POLICY "Enable read access for all users" ON catches
    FOR SELECT USING (true);

-- スタッフ以上が登録・編集・削除可能
CREATE POLICY "Enable insert for staff" ON catches
    FOR INSERT WITH CHECK (auth.jwt()->>'auth_level' >= '1');

CREATE POLICY "Enable update for staff" ON catches
    FOR UPDATE USING (auth.jwt()->>'auth_level' >= '1');

CREATE POLICY "Enable delete for staff" ON catches
    FOR DELETE USING (auth.jwt()->>'auth_level' >= '1');
```

#### 2. Supabase Auth の実装

**ユーザー登録時にカスタムクレームを設定**:
```javascript
// サインアップ時
const { user, error } = await supabase.auth.signUp({
    email: 'user@example.com',
    password: 'password',
    options: {
        data: {
            auth_level: 1  // スタッフレベル
        }
    }
});
```

**JWTトークンに権限レベルを含める**:
- Supabaseのダッシュボードで「Custom Claims」を設定
- `auth.jwt()->>'auth_level'` でRLSポリシー内で参照可能

### XSS対策

**現在の実装**:
- テキスト入力は全て `textContent` で挿入
- HTMLエスケープは自動的に行われる

**innerHTML使用箇所の注意**:
```javascript
// ❌ 危険（ユーザー入力をそのまま挿入）
element.innerHTML = `<div>${userInput}</div>`;

// ✅ 安全（textContentを使用）
element.textContent = userInput;
```

### SQLインジェクション対策

**Supabase Client使用**:
- プリペアドステートメント自動使用
- 手動でSQLを書く必要がない

```javascript
// ✅ 安全（Supabaseクライアントが自動エスケープ）
const { data } = await supabase
    .from('catches')
    .select('*')
    .eq('zekken', userInput);
```

---

## ⚡ パフォーマンス最適化

### 現在の最適化

#### 1. データの事前読み込み
```javascript
async function openTournament(tournamentId) {
    // 大会、参加者、釣果を並列で取得
    const [tournamentData, playersData, catchesData] = await Promise.all([
        supabase.from('tournaments').select('*').eq('id', tournamentId).single(),
        supabase.from('players').select('*').eq('tournament_id', tournamentId),
        supabase.from('catches').select('*').eq('tournament_id', tournamentId)
    ]);
    // メモリに保存して高速アクセス
    PLAYERS = playersData.data;
    CATCHES = catchesData.data;
}
```

#### 2. Viteによるバンドル最適化
```javascript
// vite.config.js
export default {
    build: {
        minify: 'terser',         // コード圧縮
        sourcemap: false,         // ソースマップ無効化（本番）
        rollupOptions: {
            output: {
                manualChunks: undefined  // 単一ファイル出力
            }
        }
    }
}
```

#### 3. インデックスの活用
```sql
-- 頻繁に使われるクエリ用のインデックス
CREATE INDEX idx_players_tournament ON players(tournament_id);
CREATE INDEX idx_catches_tournament_zekken ON catches(tournament_id, zekken);
CREATE INDEX idx_catches_created_at ON catches(created_at DESC);
```

### 将来の最適化案

#### 1. 仮想スクロール
長い参加者リストやランキングに対して、表示範囲のみレンダリング。

#### 2. Service Worker によるキャッシュ
静的ファイルをオフラインでも利用可能に。

#### 3. CDNの活用
Cloudflare Pagesが自動的にCDN配信を提供。

#### 4. 画像最適化
ロゴ画像を WebP 形式で保存し、サイズを削減。

---

## 📊 監視とログ

### 現在の実装

#### コンソールログ
```javascript
console.log('🖼️ ロゴを読み込み中...');
console.log('📊 ランキングを更新中...');
console.error('❌ エラー:', error);
```

### 推奨される改善案

#### 1. エラートラッキング（Sentry等）
```javascript
import * as Sentry from "@sentry/browser";

Sentry.init({
    dsn: "YOUR_DSN",
    environment: "production"
});
```

#### 2. アナリティクス（Google Analytics等）
```javascript
// ページビューのトラッキング
gtag('event', 'page_view', {
    page_title: 'Tournament Page',
    page_path: '/tournament'
});
```

#### 3. パフォーマンスモニタリング
```javascript
// Web Vitals の測定
import { getCLS, getFID, getFCP } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
```

---

**最終更新**: 2026-07-04
