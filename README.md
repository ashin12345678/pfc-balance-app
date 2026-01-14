# PFC バランス管理アプリ

AI を活用した食事の PFC（タンパク質・脂質・炭水化物）バランス管理 Web アプリケーション。

## 機能

- **AI 食事解析**: 自然言語で食事を入力すると AI が自動で栄養素を解析
- **バーコードスキャン**: JAN コードをスキャンして食品情報を自動取得
- **可視化**: PFC バランスや週間トレンドをグラフで表示
- **目標管理**: 個人の身体情報に基づいた目標カロリー・PFC 計算
- **AI アドバイス**: 1 日の摂取状況に基づいた食事アドバイス

## 技術スタック

- **フロントエンド**: Next.js 14+ (App Router), React, TypeScript
- **スタイリング**: Tailwind CSS, Shadcn UI
- **バックエンド**: Supabase (PostgreSQL, Auth)
- **AI**: Google Gemini (gemini-2.5-flash)
- **状態管理**: Zustand
- **チャート**: Recharts
- **バーコードスキャン**: html5-qrcode

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd appForManagingcal
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.example` を `.env.local` にコピーして設定：

```bash
cp .env.example .env.local
```

以下の環境変数を設定してください：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key
```

### 4. データベースのセットアップ

Supabase ダッシュボードで `database/schema.sql` を実行してください。

### 5. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリにアクセスできます。

## プロジェクト構成

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連ページ
│   ├── (dashboard)/       # メインアプリページ
│   └── api/               # APIルート
├── components/
│   ├── features/          # 機能別コンポーネント
│   ├── layout/            # レイアウトコンポーネント
│   └── ui/                # Shadcn UIコンポーネント
├── lib/
│   ├── ai/                # AI関連機能
│   ├── api/               # 外部API連携
│   ├── supabase/          # Supabaseクライアント
│   └── utils/             # ユーティリティ関数
├── store/                 # Zustandストア
├── types/                 # TypeScript型定義
└── database/              # SQLスキーマ
```

## 使い方

1. **アカウント作成**: 身長・体重・目標などを入力してプロフィールを設定
2. **食事記録**: テキスト入力またはバーコードスキャンで食事を記録
3. **ダッシュボード確認**: PFC バランスやカロリー達成度をチェック
4. **履歴分析**: 週間トレンドを確認して食生活を改善

## ライセンス

MIT
