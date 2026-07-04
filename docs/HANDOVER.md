# 🎣 釣り大会管理システム - AIエージェント引き継ぎドキュメント

**作成日**: 2026-07-04  
**プロジェクト名**: taikai-kensundoudekka  
**本番URL**: https://taikai-kensundoudekka.pages.dev

---

## 📋 目次

1. [プロジェクト概要](#プロジェクト概要)
2. [技術スタック](#技術スタック)
3. [開発環境セットアップ](#開発環境セットアップ)
4. [実装済み機能一覧](#実装済み機能一覧)
5. [最近の変更履歴](#最近の変更履歴)
6. [ファイル構成](#ファイル構成)
7. [重要な実装詳細](#重要な実装詳細)
8. [未完了タスク](#未完了タスク)
9. [デプロイ手順](#デプロイ手順)
10. [トラブルシューティング](#トラブルシューティング)

---

## 🎯 プロジェクト概要

### システムの目的
釣り大会のリアルタイム管理システム。参加者の登録、釣果の記録、ランキング表示、表彰式用の演出機能を提供。

### 主な利用シーン
- **大会開催中**: スタッフが釣果を随時入力
- **参加者**: リアルタイムでランキングを確認
- **表彰式**: トップページで上位3名を大きく表示

### ユーザー権限レベル
- **レベル0 (ゲスト)**: 閲覧のみ
- **レベル1 (スタッフ)**: 釣果の登録・編集・削除が可能
- **レベル2 (管理者)**: 大会設定、ロゴアップロード、テーマ変更が可能

---

## 🛠️ 技術スタック

### フロントエンド
- **バニラJavaScript** (ES6+) - フレームワーク不使用
- **HTML5** + **CSS3**
- **Vite** - ビルドツール

### バックエンド・インフラ
- **Supabase PostgreSQL** - データベース（tournaments, players, catches テーブル）
- **Cloudflare Pages** - 静的サイトホスティング
- **GitHub** - コードリポジトリ & 自動デプロイトリガー

### 主要ライブラリ
- なし（依存関係を最小化）

---

## 💻 開発環境セットアップ

### 1. リポジトリクローン
```bash
git clone https://github.com/laurel-otoshikomi/taikai-kensundoudekka.git
cd taikai-kensundoudekka
```

### 2. 依存関係インストール
```bash
npm install
```

### 3. 開発サーバー起動
```bash
npm run dev
# または
vite dev
```

### 4. ビルド（本番用）
```bash
npm run build
# dist/ フォルダに出力される
```

### 5. 環境変数（不要）
Supabase接続情報は `main.js` 内にハードコード済み（公開プロジェクト用の設定）

---

## ✅ 実装済み機能一覧

### コア機能
- [x] 大会の作成・選択・削除
- [x] 参加者登録（ゼッケン番号、名前、所属）
- [x] 釣果記録（長さ・重さ）
- [x] リアルタイムランキング表示（長さ順・重さ順）
- [x] トップページ（上位3名のみ大きく表示）
- [x] 最近の登録履歴表示

### UI/UX改善
- [x] **統一テーマカラーシステム** - CSS変数で全要素を統一
- [x] **ライト/ダークモード対応** - 可読性を考慮した配色
- [x] **テーマプリセット** - 6種類のカラーテーマ選択可能
- [x] **トップページUI強化** - カードに境界線とシャドウ追加
- [x] **登録履歴のテキスト強調** - 名前とゼッケン番号を太字化
- [x] **ロゴのデータベース保存** - 全ユーザーに表示（localStorage → DB移行）
- [x] **モバイルレイアウト最適化** - 順位とメダルが正しく並ぶ
- [x] **ボタンUI改善** - 絵文字とテキストの適切な配置
- [x] **カスタム削除確認モーダル** - ブラウザネイティブの confirm() を置き換え

### 権限管理
- [x] **スタッフ権限で編集・削除可能** - AUTH_LEVEL >= 1 に変更
- [x] 管理者専用機能（大会削除、ロゴアップロード）

### アニメーション・演出
- [x] モーダル表示時のフェードイン・スライドイン
- [x] 削除モーダルのバックドロップぼかし効果

---

## 📝 最近の変更履歴

### 最新コミット: `eec6c19`
**コミットメッセージ**: "feat: 編集・削除ボタンのUI改善とカスタム削除確認モーダル追加"

#### 変更内容
1. **カスタム削除確認モーダル実装**
   - ファイル: `main.js` (lines 1117-1240)
   - ブラウザの `confirm()` を置き換え
   - テーマカラーに対応したグラデーション背景
   - アニメーション追加（fadeIn, slideIn）
   - バックドロップぼかし効果

2. **編集・削除ボタンのレイアウト改善**
   - ファイル: `main.js` (lines 930-936)
   - 絵文字とテキストを分離（`<span>` で囲む）
   - flexboxで適切な間隔（gap: 4px）
   - 両ボタンを横並びに配置（gap: 8px）

3. **スタッフ権限の拡張**
   - `AUTH_LEVEL === 2` → `AUTH_LEVEL >= 1` に変更
   - スタッフも編集・削除可能に

### その他の重要な変更（時系列）

#### 2026-07-04 午前: ロゴのデータベース移行
- **問題**: localStorage のロゴがモバイルや他のブラウザで見えない
- **解決**: tournaments テーブルに logo カラム追加
- **ファイル**: 
  - `migrations/add_logo_column.sql` (作成)
  - `migrations/README_logo_migration.md` (作成)
  - `main.js` (openTournament 関数を修正)

#### 2026-07-04 午前: モバイルランキングレイアウト修正
- **問題**: トップページで順位とメダルが別の行に折り返される
- **解決**: flexboxの3カラムレイアウトに変更
  - 左: メダル + 順位（flex-shrink: 0）
  - 中央: 名前・所属（flex: 1）
  - 右: 「タップで詳細」（flex-shrink: 0）

#### 2026-07-03: テーマカラーシステム統一
- CSS変数を全要素に適用
- ライトモード時の可読性改善（動的な色計算）
- テーマプリセット6種類追加

---

## 📂 ファイル構成

```
/home/user/webapp/
├── index.html              # メインHTMLファイル
├── main.js                 # メインアプリケーションロジック（重要！）
├── package.json            # npm依存関係
├── vite.config.js          # Viteビルド設定
├── .gitignore              # Git除外設定
├── dist/                   # ビルド出力（自動生成、コミット必須）
│   ├── index.html
│   └── assets/
│       └── main-*.js       # バンドル済みJS
├── migrations/             # データベースマイグレーション
│   ├── add_logo_column.sql
│   └── README_logo_migration.md
└── docs/                   # ドキュメント（今作成中）
    ├── HANDOVER.md         # 本ファイル
    ├── FEATURES.md         # 機能詳細
    ├── ARCHITECTURE.md     # システム設計
    └── DEPLOYMENT.md       # デプロイ手順
```

### 最重要ファイル

#### `main.js` (約1600行)
全てのアプリケーションロジックが含まれる単一ファイル。

**主要な関数**:
- `initApp()` - アプリ初期化
- `openTournament(id)` - 大会を開く
- `createTournament()` - 新規大会作成
- `registerPlayer()` - 参加者登録
- `registerCatch()` - 釣果登録
- `editCatch(id, zekken, length, weight)` - 釣果編集
- `deleteCatch(id)` - 釣果削除（カスタムモーダル経由）
- `showDeleteConfirmDialog(catchId)` - 削除確認モーダル表示
- `updateRankings()` - ランキング更新
- `renderTopPage()` - トップページレンダリング
- `uploadLogo()` - ロゴアップロード（DB保存）
- `applyThemeColors()` - テーマカラー適用

**グローバル変数**:
- `CONFIG` - 大会設定（ID、名前、ロゴなど）
- `PLAYERS` - 参加者リスト
- `CATCHES` - 釣果リスト
- `AUTH_LEVEL` - 現在のユーザー権限レベル

#### `index.html` (約1200行)
HTMLテンプレートとインラインCSS。

**重要なセクション**:
- CSS変数定義（`:root` セレクタ）
- テーマプリセットボタン（6種類）
- ロゴ表示エリア（`.logo` クラス）
- 各ページのコンテナ（`#tournament-select-page`, `#main-page`, `#top-page`）

---

## 🔍 重要な実装詳細

### テーマカラーシステム

#### CSS変数（index.html 内）
```css
:root {
    --primary-color: #2563eb;     /* プライマリカラー */
    --secondary-color: #7c3aed;   /* セカンダリカラー */
    --heading-color: #1e3a8a;     /* 見出しカラー（ライトモード用） */
}
```

#### 動的カラー計算（main.js）
```javascript
function applyThemeColors() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary-color').trim();
    
    // ライトモード時は見出しを暗く、ダークモード時は明るく
    let headingColor;
    if (isDarkMode) {
        headingColor = lightenColor(primaryColor, 40);
    } else {
        headingColor = getComputedStyle(document.documentElement)
            .getPropertyValue('--heading-color').trim() || darkenColor(primaryColor, 20);
    }
    
    // 全要素に適用
    document.querySelectorAll('h1, h2, h3').forEach(el => {
        el.style.color = headingColor;
    });
    // ... 他の要素にも適用
}
```

### ロゴのデータベース保存

#### アップロード処理（main.js）
```javascript
async function uploadLogo() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            const logoData = event.target.result;
            
            // データベースに保存
            const { error } = await supabase
                .from('tournaments')
                .update({ logo: logoData })
                .eq('id', CONFIG.tournamentId);
            
            if (!error) {
                CONFIG.logo = logoData;
                // ロゴ表示
                document.querySelectorAll('.logo').forEach(logo => {
                    logo.src = logoData;
                    logo.classList.add('visible');
                });
            }
        };
        reader.readAsDataURL(file);
    };
    input.click();
}
```

#### 読み込み処理（main.js）
```javascript
async function openTournament(tournamentId) {
    // ... 大会データ取得 ...
    
    // ロゴをデータベースから読み込み
    if (CONFIG.logo) {
        console.log('🖼️ ロゴを読み込み中...');
        const logos = document.querySelectorAll('.logo');
        logos.forEach(logo => {
            logo.src = CONFIG.logo;
            logo.classList.add('visible');
        });
    }
}
```

### カスタム削除確認モーダル

#### モーダル表示（main.js）
```javascript
function showDeleteConfirmDialog(catchId) {
    const dialogHtml = `
        <div id="delete-confirm-dialog" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
            animation: fadeIn 0.2s ease-out;
        ">
            <div style="
                background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
                padding: 30px;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                max-width: 400px;
                width: 90%;
                animation: slideIn 0.3s ease-out;
            " onclick="event.stopPropagation()">
                <h2 style="...">🗑️ 削除確認</h2>
                <p style="...">本当に削除しますか？</p>
                <div style="display: flex; gap: 15px; margin-top: 30px;">
                    <button onclick="closeDeleteConfirmDialog()" style="...">
                        キャンセル
                    </button>
                    <button onclick="confirmDeleteCatch(${catchId})" style="...">
                        削除する
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', dialogHtml);
    
    // 背景クリックで閉じる
    document.getElementById('delete-confirm-dialog').addEventListener('click', (e) => {
        if (e.target.id === 'delete-confirm-dialog') {
            closeDeleteConfirmDialog();
        }
    });
}
```

#### CSSアニメーション（index.html）
```css
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
```

### モバイルランキングレイアウト

#### 3カラムFlexboxレイアウト（main.js）
```javascript
<div style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 15px;">
    <!-- 左カラム: メダル + 順位（折り返し防止） -->
    <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
        ${medalEmoji ? `<span style="font-size: 36px; line-height: 1;">${medalEmoji}</span>` : ''}
        <span style="font-size: 32px; font-weight: bold; color: ${textColor}; white-space: nowrap;">
            ${index + 1}位
        </span>
    </div>
    
    <!-- 中央カラム: 名前・所属（可変幅） -->
    <div style="flex: 1; min-width: 0;">
        <div style="font-size: 20px; font-weight: bold; color: ${textColor}; margin-bottom: 4px;">
            ${r.zekken}番: ${playerName}
        </div>
        ${playerClub ? `<div style="font-size: 14px; opacity: ${labelOpacity}; color: ${textColor};">
            ${playerClub}
        </div>` : ''}
    </div>
    
    <!-- 右カラム: タップ案内（折り返し防止） -->
    <div style="font-size: 12px; opacity: ${labelOpacity}; color: ${textColor}; white-space: nowrap; flex-shrink: 0;">
        👆 タップで<br>詳細
    </div>
</div>
```

**ポイント**:
- `flex-shrink: 0` で左右が縮まないように固定
- `flex: 1` で中央が可変幅
- `white-space: nowrap` で文字の折り返しを防止

---

## ⚠️ 未完了タスク

### データベースマイグレーション
**ステータス**: SQLファイル作成済み、ユーザーによる実行待ち

**手順**:
1. Supabaseダッシュボード（https://supabase.com/dashboard）にアクセス
2. プロジェクトを選択
3. 左メニューから「SQL Editor」を開く
4. `migrations/add_logo_column.sql` の内容をコピー&ペースト
5. 「Run」をクリック

**SQLファイル内容**:
```sql
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS logo TEXT;

COMMENT ON COLUMN tournaments.logo IS 'ロゴ画像データ（base64エンコード）。管理者がアップロードしたロゴは全ユーザーに表示される。';
```

**重要**: このマイグレーションを実行しないと、ロゴアップロード機能がエラーになります。

---

## 🚀 デプロイ手順

### 自動デプロイ（推奨）
1. コードを変更
2. ビルド実行: `npm run build`
3. Git コミット: `git add . && git commit -m "commit message"`
4. Git プッシュ: `git push origin main`
5. Cloudflare Pagesが自動的にビルド&デプロイ（約2-3分）
6. 本番URL（https://taikai-kensundoudekka.pages.dev）で確認

### 手動デプロイ（緊急時）
1. Cloudflare Pagesダッシュボードにアクセス
2. プロジェクト `taikai-kensundoudekka` を選択
3. 「Deployments」タブで「Retry deployment」をクリック

### デプロイ前チェックリスト
- [ ] `npm run build` でエラーが出ないこと
- [ ] `dist/` フォルダがコミットされていること
- [ ] Supabase接続情報が正しいこと
- [ ] テーマカラーが全要素に適用されていること
- [ ] モバイル表示をブラウザの開発者ツールで確認

---

## 🐛 トラブルシューティング

### 問題: ロゴがアップロードできない
**原因**: データベースに `logo` カラムが存在しない  
**解決**: `migrations/add_logo_column.sql` を実行

### 問題: モバイルで順位とメダルが別々の行になる
**原因**: flexboxの設定不足  
**解決**: 既に修正済み（コミット `eec6c19` 以降）

### 問題: 削除ボタンを押してもモーダルが表示されない
**原因**: JavaScriptエラーの可能性  
**確認方法**: ブラウザの開発者ツールで Console を確認  
**解決**: `showDeleteConfirmDialog()` 関数が正しく定義されているか確認

### 問題: テーマカラーが一部の要素に反映されない
**原因**: CSS変数の適用漏れ  
**解決**: `applyThemeColors()` 関数内で該当要素を追加

### 問題: デプロイ後に変更が反映されない
**原因**: ブラウザキャッシュ  
**解決**: Ctrl + Shift + R（Windows/Linux）または Cmd + Shift + R（Mac）で強制リロード

### 問題: Supabaseに接続できない
**原因**: ネットワークエラー、またはSupabaseサービス障害  
**確認**: Supabaseのステータスページ（https://status.supabase.com/）を確認

---

## 📞 連絡先・リソース

### リポジトリ
- GitHub: https://github.com/laurel-otoshikomi/taikai-kensundoudekka

### 本番環境
- URL: https://taikai-kensundoudekka.pages.dev

### 関連サービス
- Cloudflare Pages: https://pages.cloudflare.com/
- Supabase: https://supabase.com/

---

## 📚 追加ドキュメント

引き継ぎをさらにスムーズにするため、以下のドキュメントも合わせて参照してください:

- `FEATURES.md` - 機能詳細とユースケース
- `ARCHITECTURE.md` - システム設計とデータベーススキーマ
- `DEPLOYMENT.md` - デプロイ設定の詳細
- `migrations/README_logo_migration.md` - ロゴマイグレーション手順

---

## ✍️ 最後に

このプロジェクトは、シンプルで保守しやすいコードを目指して開発されました。
フレームワークを使わず、バニラJavaScriptで実装することで、学習コストを最小限に抑えています。

**開発の心構え**:
- コードはシンプルに保つ
- コメントは必要最小限（コード自体が読みやすいことを優先）
- ユーザー体験を最優先
- モバイルファーストで設計

**次のAIエージェントへ**:
このドキュメントを読めば、すぐに開発を継続できるはずです。
何か不明点があれば、コード内のコメントやGitコミット履歴も参考にしてください。

---

**作成者**: Claude (Anthropic AIエージェント)  
**最終更新**: 2026-07-04
