# 📋 引き継ぎチェックリスト

このドキュメントは、次のAIエージェント（または人間の開発者）がプロジェクトを引き継ぐ際に、最初に確認すべき項目をリストアップしたものです。

---

## ✅ 最初にやること

### 1. ドキュメントを読む（15分）
- [ ] `docs/HANDOVER.md` を読む（最重要！）
- [ ] `docs/FEATURES.md` を読む（機能の理解）
- [ ] `docs/ARCHITECTURE.md` を読む（システム設計の理解）
- [ ] `docs/DEPLOYMENT.md` を読む（デプロイ方法の理解）

### 2. 環境を確認する（5分）
```bash
cd /home/user/webapp
pwd                      # /home/user/webapp であることを確認
ls -la                   # ファイル一覧を確認
git status               # Gitの状態を確認
git log --oneline -10    # 最近のコミットを確認
```

### 3. プロジェクトをビルドする（2分）
```bash
cd /home/user/webapp
npm install              # 依存関係をインストール
npm run build            # ビルドが成功するか確認
```

### 4. 本番環境を確認する（1分）
- [ ] https://taikai-kensundoudekka.pages.dev にアクセス
- [ ] 正常に表示されることを確認
- [ ] ブラウザのコンソールでエラーがないか確認

---

## 📂 重要なファイル一覧

### 絶対に読むべきファイル
| ファイル名 | 重要度 | 説明 |
|-----------|--------|------|
| `docs/HANDOVER.md` | ⭐⭐⭐⭐⭐ | 引き継ぎドキュメント（最重要） |
| `main.js` | ⭐⭐⭐⭐⭐ | アプリケーションロジック（約1600行） |
| `index.html` | ⭐⭐⭐⭐ | HTMLテンプレート |
| `package.json` | ⭐⭐⭐ | 依存関係 |
| `vite.config.js` | ⭐⭐ | ビルド設定 |

### 参考資料
| ファイル名 | 重要度 | 説明 |
|-----------|--------|------|
| `docs/FEATURES.md` | ⭐⭐⭐⭐ | 機能詳細 |
| `docs/ARCHITECTURE.md` | ⭐⭐⭐⭐ | システム設計 |
| `docs/DEPLOYMENT.md` | ⭐⭐⭐⭐ | デプロイ手順 |
| `migrations/README_logo_migration.md` | ⭐⭐⭐ | データベースマイグレーション |

---

## 🔍 よくある最初の質問

### Q1: このプロジェクトは何をするもの？
**A**: 釣り大会の管理システムです。参加者の登録、釣果の記録、リアルタイムランキング表示、表彰式用のトップページ表示を提供します。

### Q2: どの技術が使われている？
**A**: 
- フロントエンド: バニラJavaScript（フレームワークなし）
- ビルド: Vite
- データベース: Supabase PostgreSQL
- ホスティング: Cloudflare Pages

### Q3: デプロイはどうやる？
**A**: GitHubの `main` ブランチにプッシュすると、Cloudflare Pagesが自動的にビルド&デプロイします。詳細は `docs/DEPLOYMENT.md` を参照。

### Q4: ユーザー権限はどうなってる？
**A**: 3段階の権限レベルがあります:
- レベル0 (ゲスト): 閲覧のみ
- レベル1 (スタッフ): 釣果の登録・編集・削除
- レベル2 (管理者): 全機能（大会作成、ロゴアップロード、テーマ変更）

### Q5: データベースはどこにある？
**A**: Supabase（PostgreSQL）。接続情報は `main.js` にハードコードされています。

### Q6: ロゴ機能を使うには？
**A**: データベースマイグレーションが必要です。`migrations/add_logo_column.sql` を Supabase SQL Editor で実行してください。

### Q7: 最新のコミットは何？
**A**: 
```bash
git log -1 --oneline
# eec6c19 feat: 編集・削除ボタンのUI改善とカスタム削除確認モーダル追加
```

---

## 🚨 重要な制約・注意事項

### 絶対に守るべきこと
1. **ディレクトリ制約**: 全ての作業は `/home/user/webapp` 内で行う
2. **Bashツールの仕様**: `cd /home/user/webapp && command` の形式で実行する
3. **コミット必須**: コード変更後は必ずコミットする
4. **ビルド必須**: デプロイ前に `npm run build` を実行して成功を確認する
5. **dist/ フォルダ**: コミットに含める（Cloudflare Pagesが使用）

### やってはいけないこと
- ❌ `/home/user/webapp` 外にファイルを作成する
- ❌ ビルドせずにデプロイする
- ❌ コミットせずにファイルを残す
- ❌ `main.js` の Supabase 接続情報を削除する
- ❌ データベーステーブルを直接削除する（必ずマイグレーションを作成）

---

## 🎯 最近の実装内容（2026-07-04）

### 完了した機能
1. **カスタム削除確認モーダル** - ブラウザネイティブの confirm() を置き換え
2. **編集・削除ボタンのUI改善** - 絵文字とテキストの適切な配置
3. **スタッフ権限で編集・削除可能** - AUTH_LEVEL >= 1 に変更
4. **モバイルランキングレイアウト修正** - 順位とメダルの折り返し防止
5. **ロゴのデータベース保存** - localStorage → DB に移行
6. **テーマカラーシステム統一** - 全UI要素で一貫性を確保
7. **トップページUI強化** - 境界線とシャドウ追加
8. **登録履歴のテキスト強調** - 名前とゼッケン番号を太字化

### 最新のコミット情報
```
コミットハッシュ: eec6c19
コミットメッセージ: feat: 編集・削除ボタンのUI改善とカスタム削除確認モーダル追加
ブランチ: main
プッシュ済み: ✅ はい
デプロイ済み: ✅ はい
```

---

## 📌 未完了タスク

### ユーザーが実施する必要があるタスク
1. **データベースマイグレーション実行**
   - ファイル: `migrations/add_logo_column.sql`
   - 実行場所: Supabase SQL Editor
   - 目的: ロゴアップロード機能を有効化
   - 状態: ❌ 未実行（ユーザー待ち）

### 将来的な拡張候補（優先度順）
1. **Supabase Auth統合** - 本格的な認証システムの実装
2. **Row Level Security (RLS)** - データベースレベルの権限管理
3. **リアルタイム更新** - Supabase Realtimeを使用した自動更新
4. **CSV エクスポート** - ランキングデータのエクスポート機能
5. **画像最適化** - ロゴをWebP形式で保存してサイズ削減
6. **PWA対応** - オフライン機能とホーム画面追加
7. **プッシュ通知** - 新しい釣果が登録されたときの通知

---

## 🔧 開発ワークフロー（テンプレート）

### 新機能を追加する場合

#### 1. ブランチを作成（推奨）
```bash
cd /home/user/webapp
git checkout -b feature/new-feature
```

#### 2. コードを変更
- `main.js` や `index.html` を編集
- 必要に応じて新しいファイルを作成

#### 3. ローカルでテスト
```bash
cd /home/user/webapp
npm run build
# 開発サーバーでテスト（オプション）
npm run dev
```

#### 4. コミット
```bash
cd /home/user/webapp
git add .
git commit -m "feat: 新機能の説明"
```

#### 5. mainブランチにマージ
```bash
git checkout main
git merge feature/new-feature
```

#### 6. プッシュ（自動デプロイ）
```bash
git push origin main
```

#### 7. 本番環境で確認
- https://taikai-kensundoudekka.pages.dev にアクセス
- 動作確認

---

## 🐛 バグ修正のワークフロー

### 1. バグを再現する
- ブラウザのコンソールでエラーメッセージを確認
- どのような操作で発生するかを特定

### 2. 原因を特定する
- `main.js` の該当箇所を探す
- `console.log()` でデバッグ

### 3. 修正する
- コードを修正
- ローカルでテスト

### 4. コミット&デプロイ
```bash
cd /home/user/webapp
git add .
git commit -m "fix: バグの説明"
git push origin main
```

---

## 📞 困ったときの対処法

### コードの意味がわからない
1. `docs/HANDOVER.md` で該当箇所を検索
2. `main.js` のコメントを確認
3. Git履歴で変更理由を確認: `git log -p -- main.js`

### ビルドが失敗する
1. エラーメッセージを確認: `npm run build`
2. `package.json` の依存関係を確認
3. Node.jsのバージョンを確認: `node -v`

### デプロイが失敗する
1. Cloudflare Pagesのログを確認
2. `docs/DEPLOYMENT.md` のトラブルシューティングを参照
3. ロールバックを検討

### データベースエラーが出る
1. Supabase ダッシュボードで接続を確認
2. テーブル構造を確認: `docs/ARCHITECTURE.md` 参照
3. マイグレーションが実行済みか確認

---

## 🎓 学習リソース

### 使用技術の公式ドキュメント
- JavaScript (MDN): https://developer.mozilla.org/ja/docs/Web/JavaScript
- Vite: https://ja.vitejs.dev/
- Supabase: https://supabase.com/docs
- Cloudflare Pages: https://developers.cloudflare.com/pages/

### プロジェクト特有の知識
- CSS変数の使い方: `index.html` の `:root` セクションを参照
- テーマカラーの適用: `main.js` の `applyThemeColors()` 関数を参照
- ランキング計算ロジック: `main.js` の `updateRankings()` 関数を参照

---

## ✍️ 引き継ぎ完了の確認

引き継ぎが完了したら、以下を確認してください:

- [ ] 全てのドキュメントを読んだ
- [ ] ローカルでビルドが成功した
- [ ] 本番環境にアクセスできた
- [ ] Git の状態を確認した
- [ ] 最近のコミット内容を理解した
- [ ] 未完了タスクを把握した
- [ ] 開発ワークフローを理解した
- [ ] 主要なファイルの場所を把握した

---

## 🎉 準備完了！

このチェックリストを完了したら、次のAIエージェントまたは開発者は、すぐに開発を継続できる状態になっています。

何か不明な点があれば、以下を確認してください:
1. `docs/HANDOVER.md` - 総合的な引き継ぎ情報
2. `docs/FEATURES.md` - 機能の詳細
3. `docs/ARCHITECTURE.md` - システム設計
4. `docs/DEPLOYMENT.md` - デプロイ手順
5. Git コミット履歴 - 変更の経緯

**次のAIエージェントへ**: この資料を活用して、素晴らしい機能を追加してください！📣

---

**作成日**: 2026-07-04  
**作成者**: Claude (Anthropic AIエージェント)  
**最終更新**: 2026-07-04
