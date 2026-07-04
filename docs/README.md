# 📚 ドキュメント一覧

このフォルダには、釣り大会管理システムのプロジェクト引き継ぎに関するドキュメントが含まれています。

---

## 🎯 まず最初に読むべきドキュメント

### 1. [AI_HANDOVER_CHECKLIST.md](./AI_HANDOVER_CHECKLIST.md) ⭐⭐⭐⭐⭐
**次のAIエージェントが最初に読むべきチェックリスト**

- 最初にやること（環境確認、ビルド確認）
- 重要なファイル一覧
- よくある最初の質問（Q&A）
- 最近の実装内容
- 未完了タスク
- 開発ワークフロー
- トラブルシューティング

**推奨読了時間**: 10分

---

## 📖 詳細ドキュメント

### 2. [HANDOVER.md](./HANDOVER.md) ⭐⭐⭐⭐⭐
**包括的な引き継ぎドキュメント**

- プロジェクト概要
- 技術スタック
- 開発環境セットアップ
- 実装済み機能一覧
- 最近の変更履歴
- ファイル構成
- 重要な実装詳細
- 未完了タスク
- デプロイ手順
- トラブルシューティング

**推奨読了時間**: 30分

---

### 3. [FEATURES.md](./FEATURES.md) ⭐⭐⭐⭐
**機能詳細ドキュメント**

各機能の詳細な説明:
- 大会管理機能
- 参加者管理機能
- 釣果登録機能
- ランキング表示機能
- トップページ機能
- UI/UXカスタマイズ機能
- 権限管理機能

**推奨読了時間**: 20分

---

### 4. [ARCHITECTURE.md](./ARCHITECTURE.md) ⭐⭐⭐⭐
**システム設計ドキュメント**

システムの設計に関する詳細:
- システムアーキテクチャ
- データベース設計（ERダイアグラム、テーブル定義）
- フロントエンド設計
- データフロー
- セキュリティ設計
- パフォーマンス最適化

**推奨読了時間**: 25分

---

### 5. [DEPLOYMENT.md](./DEPLOYMENT.md) ⭐⭐⭐⭐
**デプロイメントガイド**

デプロイに関する全情報:
- デプロイ環境（Cloudflare Pages、Supabase）
- 初回セットアップ
- デプロイ手順
- ロールバック手順
- 環境変数管理
- データベースマイグレーション
- トラブルシューティング

**推奨読了時間**: 20分

---

## 📋 読む順番の推奨

### 初めて引き継ぐ場合
1. **AI_HANDOVER_CHECKLIST.md** - 全体像を把握（10分）
2. **HANDOVER.md** - 詳細な引き継ぎ情報（30分）
3. **FEATURES.md** - 機能の理解（20分）
4. **ARCHITECTURE.md** - システム設計の理解（25分）
5. **DEPLOYMENT.md** - デプロイ方法の理解（20分）

**合計**: 約105分（1時間45分）

### 特定のタスクに取り組む場合

#### 新機能を追加する
1. **FEATURES.md** - 既存機能を確認
2. **ARCHITECTURE.md** - システム設計を理解
3. **HANDOVER.md** - 実装パターンを確認

#### バグを修正する
1. **HANDOVER.md** - 最近の変更履歴を確認
2. **FEATURES.md** - 該当機能の仕様を確認
3. **AI_HANDOVER_CHECKLIST.md** - トラブルシューティングを参照

#### デプロイする
1. **DEPLOYMENT.md** - デプロイ手順を確認
2. **AI_HANDOVER_CHECKLIST.md** - デプロイチェックリストを使用

#### データベースを変更する
1. **ARCHITECTURE.md** - データベース設計を確認
2. **DEPLOYMENT.md** - マイグレーション手順を確認

---

## 🔍 キーワード検索ガイド

特定のトピックを探している場合、以下のキーワードで検索してください:

| キーワード | 関連ドキュメント |
|-----------|----------------|
| テーマカラー | HANDOVER.md, FEATURES.md |
| ロゴアップロード | HANDOVER.md, FEATURES.md, DEPLOYMENT.md |
| 権限管理 | FEATURES.md, ARCHITECTURE.md |
| ランキング計算 | FEATURES.md, ARCHITECTURE.md |
| モバイル対応 | HANDOVER.md, FEATURES.md |
| カスタムモーダル | HANDOVER.md, FEATURES.md |
| データベーススキーマ | ARCHITECTURE.md |
| Supabase設定 | ARCHITECTURE.md, DEPLOYMENT.md |
| Cloudflare Pages | DEPLOYMENT.md |
| Vite ビルド | DEPLOYMENT.md |
| Git ワークフロー | AI_HANDOVER_CHECKLIST.md, DEPLOYMENT.md |
| セキュリティ | ARCHITECTURE.md |
| パフォーマンス | ARCHITECTURE.md |
| トラブルシューティング | 全てのドキュメント |

---

## 📁 ドキュメントファイル構成

```
docs/
├── README.md                      # 本ファイル（ドキュメント一覧）
├── AI_HANDOVER_CHECKLIST.md      # 引き継ぎチェックリスト（最優先）
├── HANDOVER.md                    # 包括的な引き継ぎドキュメント
├── FEATURES.md                    # 機能詳細ドキュメント
├── ARCHITECTURE.md                # システム設計ドキュメント
└── DEPLOYMENT.md                  # デプロイメントガイド
```

---

## ⚙️ ドキュメントの更新方法

### 新しい機能を追加したとき
1. **FEATURES.md** に機能の説明を追加
2. **HANDOVER.md** の「実装済み機能一覧」を更新
3. 必要に応じて **ARCHITECTURE.md** の設計を更新

### データベーススキーマを変更したとき
1. **ARCHITECTURE.md** のテーブル定義を更新
2. **DEPLOYMENT.md** にマイグレーション手順を追加
3. `migrations/` フォルダに SQLファイルを追加

### デプロイ手順が変わったとき
1. **DEPLOYMENT.md** を更新
2. **AI_HANDOVER_CHECKLIST.md** のワークフローを更新

### バグ修正をしたとき
1. **HANDOVER.md** の「最近の変更履歴」を更新
2. 必要に応じて **AI_HANDOVER_CHECKLIST.md** のトラブルシューティングに追加

---

## 🎓 ドキュメント作成のポイント

これらのドキュメントは、以下の原則に基づいて作成されています:

1. **わかりやすさ**: 専門用語を避け、具体例を多用
2. **網羅性**: 必要な情報を全て含める
3. **実用性**: 実際の作業手順を明確に記載
4. **最新性**: コードと常に同期
5. **検索性**: 目次とキーワードで素早く情報にアクセス

---

## 📞 サポート

ドキュメントに不明点や誤りがある場合:
1. Git履歴を確認: `git log --oneline`
2. コード内のコメントを確認: `main.js`
3. 実際のコードを読む（コードが最も正確な情報源）

---

## 🎉 ドキュメントの使い方

### 初回引き継ぎ時
```bash
# ドキュメントフォルダに移動
cd /home/user/webapp/docs

# チェックリストを確認
cat AI_HANDOVER_CHECKLIST.md

# 詳細なドキュメントを順番に読む
cat HANDOVER.md
cat FEATURES.md
cat ARCHITECTURE.md
cat DEPLOYMENT.md
```

### 特定の情報を探すとき
```bash
# 全ドキュメントからキーワード検索
cd /home/user/webapp/docs
grep -r "テーマカラー" .

# 特定のドキュメント内を検索
grep "ロゴアップロード" FEATURES.md
```

---

**作成日**: 2026-07-04  
**作成者**: Claude (Anthropic AIエージェント)  
**最終更新**: 2026-07-04

---

次のAIエージェントへ: これらのドキュメントを活用して、素晴らしい開発を続けてください！🚀
