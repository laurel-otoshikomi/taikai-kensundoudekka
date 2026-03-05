# データベースマイグレーション: ロゴカラム追加

## 目的
tournamentsテーブルに`logo`カラムを追加し、管理者がアップロードしたロゴを全ユーザーに表示できるようにします。

## 変更内容

### 1. データベーススキーマ変更
- **テーブル**: `tournaments`
- **新規カラム**: `logo` (TEXT型)
- **用途**: ロゴ画像データ（base64エンコード）を保存

### 2. 実行方法

#### Supabase SQLエディタで実行:
1. Supabase Dashboard にログイン
2. 左メニューから「SQL Editor」を選択
3. `migrations/add_logo_column.sql` の内容をコピー＆ペースト
4. 「Run」ボタンをクリック

#### SQL内容:
```sql
ALTER TABLE tournaments 
ADD COLUMN IF NOT EXISTS logo TEXT;

COMMENT ON COLUMN tournaments.logo IS 'ロゴ画像データ（base64エンコード）。管理者がアップロードしたロゴは全ユーザーに表示される。';
```

## 機能の変更

### Before（修正前）
- ロゴはlocalStorageに保存
- アップロードしたブラウザでのみ表示
- 他のユーザーには表示されない

### After（修正後）
- ロゴはデータベースに保存
- **管理者がアップロード→全ユーザーに表示**
- デスクトップ・スマホ両方で表示

## コード変更概要

### 1. `saveLogo()` - ロゴ保存
```javascript
// localStorage → データベースに変更
await client
    .from('tournaments')
    .update({ logo: logoData })
    .eq('id', CURRENT_TOURNAMENT_ID);
```

### 2. `removeLogo()` - ロゴ削除
```javascript
// データベースからも削除
await client
    .from('tournaments')
    .update({ logo: null })
    .eq('id', CURRENT_TOURNAMENT_ID);
```

### 3. `openTournament()` - ロゴ読み込み
```javascript
// 大会情報取得時にロゴも取得
if (CONFIG.logo) {
    const logos = document.querySelectorAll('.logo');
    logos.forEach(logo => {
        logo.src = CONFIG.logo;
        logo.classList.add('visible');
    });
}
```

## テスト手順

1. **マイグレーション実行**
   - Supabase SQLエディタで`add_logo_column.sql`を実行

2. **管理者でログイン**
   - 大会を作成または既存大会に管理者としてログイン

3. **ロゴをアップロード**
   - 設定タブ → ロゴ管理 → ロゴ画像を選択 → 💾 保存

4. **他のデバイスで確認**
   - 別のブラウザ・スマホで同じ大会にアクセス
   - ヘッダーにロゴが表示されることを確認

## 注意事項

- ロゴファイルサイズはbase64エンコード後、数百KB以内を推奨
- 大きすぎる画像はページ読み込みが遅くなる可能性あり
- 推奨サイズ: 横200px × 縦80px以内
- 形式: PNG、JPG、SVG等

## ロールバック

もし問題が発生した場合、以下のSQLでカラムを削除できます：
```sql
ALTER TABLE tournaments DROP COLUMN IF EXISTS logo;
```
