# 🚀 PFCバランス管理アプリ デプロイガイド

このガイドでは、アプリを実際のデバイスで使えるように公開する手順を説明します。

## 必要なアカウント

1. **GitHub** - https://github.com/
2. **Supabase** - https://supabase.com/
3. **Vercel** - https://vercel.com/
4. **OpenAI** - https://platform.openai.com/ (AI機能に必要)

---

## Step 1: GitHubリポジトリの作成

1. [GitHub](https://github.com/) にログイン
2. 右上の「+」→「New repository」をクリック
3. リポジトリ名: `pfc-balance-app`
4. 「Create repository」をクリック
5. 表示されるコマンドを実行:

```bash
cd c:\vscode\appForManagingcal
git remote add origin https://github.com/YOUR_USERNAME/pfc-balance-app.git
git branch -M main
git push -u origin main
```

---

## Step 2: Supabaseプロジェクトの設定

### 2.1 プロジェクト作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. 「New Project」をクリック
3. 設定:
   - **Name**: `pfc-balance-app`
   - **Database Password**: 安全なパスワードを設定（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)` を選択
4. 「Create new project」をクリック（数分かかります）

### 2.2 データベーススキーマの実行

1. 左メニューから「SQL Editor」を選択
2. 「New query」をクリック
3. `database/schema.sql` の内容をすべてコピーして貼り付け
4. 「Run」をクリックして実行

### 2.3 認証設定

1. 左メニューから「Authentication」→「Providers」
2. 「Email」が有効になっていることを確認
3. 「Settings」→「URL Configuration」で:
   - **Site URL**: `https://your-app-name.vercel.app` (後で更新)

### 2.4 API キーの取得

1. 左メニューから「Settings」→「API」
2. 以下をメモ:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## Step 3: OpenAI APIキーの取得

1. [OpenAI Platform](https://platform.openai.com/) にログイン
2. 右上のアイコン →「API Keys」
3. 「Create new secret key」をクリック
4. キーをメモ: `sk-...`

⚠️ **注意**: APIキーは一度しか表示されません。必ずコピーして保存してください。

---

## Step 4: Vercelへのデプロイ

### 4.1 Vercelにインポート

1. [Vercel](https://vercel.com/) にGitHubでログイン
2. 「Add New...」→「Project」をクリック
3. 「Import Git Repository」で `pfc-balance-app` を選択
4. 「Import」をクリック

### 4.2 環境変数の設定

「Environment Variables」セクションで以下を追加:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabaseのanon publicキー |
| `OPENAI_API_KEY` | `sk-...` (OpenAIのAPIキー) |

### 4.3 デプロイ

1. 「Deploy」をクリック
2. ビルドが完了するまで待機（2-3分）
3. 成功すると、URLが表示されます（例: `https://pfc-balance-app.vercel.app`）

---

## Step 5: Supabaseの認証設定を更新

1. Supabase Dashboardに戻る
2. 「Authentication」→「URL Configuration」
3. **Site URL** を Vercel のURL に更新:
   - `https://pfc-balance-app.vercel.app`
4. **Redirect URLs** に追加:
   - `https://pfc-balance-app.vercel.app/**`

---

## 🎉 完了！

アプリが公開されました！以下のURLでアクセスできます:

```
https://pfc-balance-app.vercel.app
```

### デバイスでの利用

- **スマートフォン**: ブラウザでURLにアクセス
- **ホーム画面に追加**: ブラウザメニューから「ホーム画面に追加」でアプリのように使えます

---

## トラブルシューティング

### ビルドエラーが発生した場合

Vercelのログを確認し、エラーメッセージに従って修正してください。

### データベース接続エラー

- Supabaseの環境変数が正しく設定されているか確認
- プロジェクトがアクティブか確認（無料プランは7日間非アクティブで一時停止）

### AI機能が動作しない

- OpenAI APIキーが正しいか確認
- OpenAIアカウントにクレジットがあるか確認

---

## 費用について

### 無料枠

- **Supabase**: 500MB データベース、50,000 MAU
- **Vercel**: 100GB 帯域幅/月
- **OpenAI**: 従量課金（GPT-4oは $2.5/1M input tokens）

個人利用であれば、月額数百円程度で運用可能です。
