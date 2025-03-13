# kokoa-home-mc-dns-manager

マインクラフトサーバー用のDNSレコード管理とモニタリングWebサービス

## 概要

このプロジェクトは、CloudFlare DNSを使用してマインクラフトサーバーのSRVレコードを管理するWebサービスです。サーバーのステータス監視機能とPrometheusメトリクスエクスポート機能も備えています。

### 主な機能

- CloudFlare APIを使用したマインクラフトサーバー用SRVレコードの作成・管理
- マインクラフトサーバーのMOTDとオンラインステータスの監視
- Prometheusで収集可能なメトリクスエンドポイントの提供

## 技術スタック

### フロントエンド
- Next.js
- React
- TypeScript
- TailwindCSS

### バックエンド
- Express
- TypeScript
- PostgreSQL (Docker)

## 前提条件

- Node.js 18以上
- Docker および Docker Compose
- CloudFlare APIキー

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/kokoa-home-mc-dns-manager.git
cd kokoa-home-mc-dns-manager
```

### 2. 依存関係のインストール

```bash
# ルートディレクトリで実行
npm install
```

### 3. 環境変数の設定

`.env.example`ファイルを`.env`にコピーし、必要な環境変数を設定します：

```bash
cp .env.example .env
```

以下の環境変数を設定してください：

```
# 認証
BASIC_AUTH_USER=admin
BASIC_AUTH_PASS=secure_password

# CloudFlare API
CLOUDFLARE_API_KEY=your_api_key
CLOUDFLARE_EMAIL=your_email
CLOUDFLARE_ZONE_ID=your_zone_id

# データベース
DATABASE_URL=postgresql://postgres:postgres@db:5432/minecraft_dns

# アプリケーション
PORT=3000
NODE_ENV=production
MINECRAFT_POLLING_INTERVAL=60000
```

### 4. CloudFlare APIキーの取得方法

1. CloudFlareにログインします
2. 右上のプロファイルアイコンをクリックし、「APIトークン」を選択
3. 「APIキー」セクションで「グローバルAPIキー」の「表示」をクリック
4. APIキーをコピーして`.env`ファイルの`CLOUDFLARE_API_KEY`に設定
5. CloudFlareアカウントのメールアドレスを`CLOUDFLARE_EMAIL`に設定
6. 対象のドメインのゾーンIDを`CLOUDFLARE_ZONE_ID`に設定（ドメイン管理画面の右下に表示されています）

### 5. 開発環境の起動

```bash
# 開発環境の起動
docker-compose -f docker-compose.dev.yml up
```

フロントエンドは http://localhost:3000 でアクセスできます。
バックエンドAPIは http://localhost:3000/api でアクセスできます。

### 6. 本番環境の起動

```bash
# コンテナのビルドと起動
docker-compose up -d
```

## 使用方法

### サーバーの追加

1. Webインターフェースにアクセス（デフォルト: http://localhost:3000）
2. Basic認証でログイン（デフォルト: admin/secure_password、または`.env`で設定した値）
3. 「サーバー新規作成」ボタンをクリック
4. DNSレコード名（例: `mc-instance1.kokoa.dev`）を入力
5. 宛先IPとポート（例: `192.168.10.92:25567`）を入力
6. 「作成」ボタンをクリック

### サーバーの監視

- ダッシュボードでは、登録されたすべてのサーバーのステータスが表示されます
- 各サーバーのMOTD、オンラインプレイヤー数、バージョンなどの情報が確認できます
- ステータス情報は1分ごとに自動更新されます

### Prometheusメトリクス

Prometheusメトリクスは以下のエンドポイントで利用可能です：

```
http://localhost:9090/metrics
```

Prometheusの設定例：

```yaml
scrape_configs:
  - job_name: 'minecraft-dns-manager'
    scrape_interval: 15s
    basic_auth:
      username: 'admin'  # .envで設定したBASIC_AUTH_USER
      password: 'secure_password'  # .envで設定したBASIC_AUTH_PASS
    static_configs:
      - targets: ['localhost:9090']
```

## 開発ガイド

### プロジェクト構造

```
kokoa-home-mc-dns-manager/
├── docker-compose.yml      # 本番環境用Docker構成
├── docker-compose.dev.yml  # 開発環境用Docker構成
├── Dockerfile              # 本番環境用Dockerイメージ構築
├── Dockerfile.dev          # 開発環境用Dockerイメージ構築
├── package.json            # ルートパッケージ設定
├── README.md               # このファイル
├── packages/               # モノレポパッケージ
│   ├── frontend/           # Next.jsフロントエンド
│   ├── backend/            # Expressバックエンド
│   └── shared/             # 共有コード
└── scripts/                # スクリプト
```

### ビルド方法

```bash
# 全パッケージをビルド
npm run build

# 個別パッケージをビルド
npm run build:shared
npm run build:backend
npm run build:frontend
```

### テスト方法

```bash
# 全パッケージをテスト
npm test

# 個別パッケージをテスト
npm run test --workspace=packages/shared
npm run test --workspace=packages/backend
npm run test --workspace=packages/frontend
```

## トラブルシューティング

### データベース接続エラー

データベース接続エラーが発生した場合は、以下を確認してください：

1. PostgreSQLコンテナが起動しているか
2. `.env`ファイルのデータベース接続情報が正しいか
3. ネットワーク設定が正しいか

### CloudFlare API接続エラー

CloudFlare API接続エラーが発生した場合は、以下を確認してください：

1. APIキーが正しいか
2. メールアドレスが正しいか
3. ゾーンIDが正しいか
4. インターネット接続が利用可能か

## 詳細情報

詳細なプロジェクト構造と設計については[plan.md](plan.md)を参照してください。

## ライセンス

[MIT](LICENSE)
