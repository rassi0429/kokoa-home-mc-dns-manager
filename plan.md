# Minecraft DNS Manager サービス設計プラン

## プロジェクト概要

このプロジェクトは、CloudFlare DNSを使用してマインクラフトサーバーのSRVレコードを管理するWebサービスです。主な機能は以下の通りです：

- CloudFlare APIを使用したマインクラフトサーバー用SRVレコードの作成・管理
- マインクラフトサーバーのMOTDとオンラインステータスの監視
- Prometheusで収集可能なメトリクスエンドポイントの提供

## 前提条件

- CloudFlare APIキーが用意されている
- 管理対象のマインクラフトサーバーは約10台
- サービスはマインクラフトサーバーがローカルIPで見える場所に配置
- ユーザー認証はBasic認証を使用

## アーキテクチャ

```mermaid
graph TD
    subgraph "フロントエンド (Next.js)"
        A[ユーザーインターフェース] --> B[サーバー管理画面]
        B --> C[サーバーモニタリング画面]
    end
    
    subgraph "バックエンド (Express)"
        D[API Gateway] --> D1[Basic認証ミドルウェア]
        D1 --> E[CloudFlare API クライアント]
        D1 --> F[Minecraft サーバー監視サービス]
        D1 --> G[メトリクスエクスポーター]
    end
    
    subgraph "データベース"
        H[(PostgreSQL)]
    end
    
    subgraph "外部サービス"
        I[CloudFlare API]
        J[Minecraft サーバー]
        K[Prometheus]
    end
    
    A <--> D
    E <--> I
    F <--> J
    G <--> K
    D1 <--> H
```

## 技術スタック

### フロントエンド
- **Next.js**: Reactベースのフレームワーク
- **TypeScript**: 型安全なコード開発
- **TailwindCSS**: UIスタイリング
- **SWR/React Query**: データフェッチングとキャッシュ管理

### バックエンド
- **Express**: APIサーバー
- **TypeScript**: 型安全なコード開発
- **node-minecraft-protocol**: マインクラフトサーバーとの通信
- **cloudflare API Client**: CloudFlare APIとの連携
- **Prometheus Client**: メトリクスエクスポート

### データベース
- **PostgreSQL**: サーバー情報の永続化
- **Prisma/TypeORM**: ORMツール

### インフラ
- **Docker**: コンテナ化
- **Docker Compose**: 開発・本番環境の構築

## データモデル

```mermaid
erDiagram
    MinecraftServer {
        id UUID PK
        name String
        dnsRecord String
        targetIp String
        targetPort Int
        createdAt DateTime
        updatedAt DateTime
    }
    
    ServerStatus {
        id UUID PK
        serverId UUID FK
        isOnline Boolean
        playerCount Int
        maxPlayers Int
        motd String
        version String
        lastCheckedAt DateTime
    }
    
    MinecraftServer ||--o{ ServerStatus : "has"
```

## 主要コンポーネント

### 1. CloudFlare DNS管理モジュール
- CloudFlare APIを使用してSRVレコードを作成・更新・削除
- DNSレコードの検証と正規化
- APIキー管理と認証

### 2. Minecraftサーバー監視モジュール
- サーバーステータスの定期的なポーリング（1分間隔）
- MOTDとプレイヤー情報の取得
- 接続エラー処理とリトライロジック
- ローカルネットワーク内での接続を前提とした最適化

### 3. Prometheusメトリクスエクスポーター
- サーバーステータスメトリクスの公開
- カスタムメトリクスの定義
- Basic認証によるエンドポイント保護（オプション）

### 4. ユーザーインターフェース
- サーバー管理ダッシュボード
- サーバーステータス表示
- レスポンシブデザイン

## 認証システム

Basic認証をExpressミドルウェアとして実装します：

```typescript
// Basic認証ミドルウェアの例
const basicAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).send('認証が必要です');
  }
  
  const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  const username = credentials[0];
  const password = credentials[1];
  
  if (username === process.env.BASIC_AUTH_USER && password === process.env.BASIC_AUTH_PASS) {
    return next();
  }
  
  res.setHeader('WWW-Authenticate', 'Basic');
  return res.status(401).send('認証に失敗しました');
};

app.use(basicAuth);
```

## CloudFlare API連携

APIキーを環境変数として安全に管理し、SRVレコード操作に特化したラッパー関数を実装します：

```typescript
// CloudFlare APIクライアントの例
class CloudFlareClient {
  private apiKey: string;
  private email: string;
  private zoneId: string;
  
  constructor() {
    this.apiKey = process.env.CLOUDFLARE_API_KEY;
    this.email = process.env.CLOUDFLARE_EMAIL;
    this.zoneId = process.env.CLOUDFLARE_ZONE_ID;
  }
  
  async createMinecraftSrvRecord(name: string, target: string, port: number): Promise<any> {
    // SRVレコードの作成ロジック
    // _minecraft._tcp.{name} SRV 1 1 {port} {target}
  }
  
  // その他のメソッド
}
```

## Minecraftサーバー監視

10台程度のサーバーに最適化された監視間隔の設定と、ローカルネットワーク内での接続を前提とした設定を行います：

```typescript
// Minecraftサーバー監視サービスの例
class MinecraftMonitoringService {
  private servers: MinecraftServer[];
  private pollingInterval: number = 60000; // 1分ごとに監視
  
  constructor(servers: MinecraftServer[]) {
    this.servers = servers;
  }
  
  async startMonitoring(): Promise<void> {
    setInterval(async () => {
      await Promise.all(this.servers.map(server => this.checkServerStatus(server)));
    }, this.pollingInterval);
  }
  
  private async checkServerStatus(server: MinecraftServer): Promise<void> {
    // Minecraftサーバーのステータスチェックロジック
    // タイムアウトは短めに設定（ローカルネットワーク前提）
  }
}
```

## Prometheusエクスポーター

10台程度のサーバーメトリクスに最適化し、Basic認証オプションを追加します：

```typescript
// Prometheusエクスポーターの例
import * as promClient from 'prom-client';

class MinecraftMetricsExporter {
  private registry: promClient.Registry;
  private onlineGauge: promClient.Gauge;
  private playerCountGauge: promClient.Gauge;
  
  constructor() {
    this.registry = new promClient.Registry();
    
    this.onlineGauge = new promClient.Gauge({
      name: 'minecraft_server_online',
      help: 'Minecraft server online status (1=online, 0=offline)',
      labelNames: ['server_name', 'dns_record']
    });
    
    this.playerCountGauge = new promClient.Gauge({
      name: 'minecraft_server_player_count',
      help: 'Number of players currently online',
      labelNames: ['server_name', 'dns_record']
    });
    
    this.registry.registerMetric(this.onlineGauge);
    this.registry.registerMetric(this.playerCountGauge);
  }
  
  // メトリクス更新メソッド
}
```

## ディレクトリ構造

```
kokoa-home-mc-dns-manager/
├── docker-compose.yml
├── Dockerfile
├── package.json
├── README.md
├── packages/
│   ├── frontend/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── backend/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   │   ├── cloudflare/
│   │   │   │   ├── minecraft/
│   │   │   │   └── metrics/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared/
│       ├── src/
│       │   ├── types/
│       │   └── utils/
│       ├── package.json
│       └── tsconfig.json
│
└── .github/
    └── workflows/
```

## 環境変数設定

```
# 認証
BASIC_AUTH_USER=admin
BASIC_AUTH_PASS=secure_password

# CloudFlare API
CLOUDFLARE_API_KEY=your_api_key
CLOUDFLARE_EMAIL=your_email
CLOUDFLARE_ZONE_ID=your_zone_id

# データベース
DATABASE_URL=postgresql://user:password@localhost:5432/minecraft_dns

# アプリケーション
PORT=3000
NODE_ENV=production
MINECRAFT_POLLING_INTERVAL=60000
```

## Docker Compose設定

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/minecraft_dns
      - BASIC_AUTH_USER=${BASIC_AUTH_USER}
      - BASIC_AUTH_PASS=${BASIC_AUTH_PASS}
      - CLOUDFLARE_API_KEY=${CLOUDFLARE_API_KEY}
      - CLOUDFLARE_EMAIL=${CLOUDFLARE_EMAIL}
      - CLOUDFLARE_ZONE_ID=${CLOUDFLARE_ZONE_ID}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:14
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=minecraft_dns
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

## 開発・デプロイフロー

### ローカル開発

```bash
# 開発環境の起動
docker-compose -f docker-compose.dev.yml up
```

### 本番デプロイ

```bash
# 環境変数ファイルの準備
cp .env.example .env
# 環境変数の編集
nano .env
# コンテナのビルドと起動
docker-compose up -d
```

## 実装計画

### フェーズ1: 基本設定とインフラ
1. モノレポ構造のセットアップ
2. Docker環境の構築
3. CI/CDパイプラインの設定

### フェーズ2: バックエンド開発
1. CloudFlare API連携の実装
2. Minecraftサーバー監視機能の実装
3. データベースモデルとマイグレーションの作成
4. RESTful APIエンドポイントの実装

### フェーズ3: フロントエンド開発
1. UIコンポーネントの設計と実装
2. APIとの連携
3. リアルタイム更新機能の実装

### フェーズ4: モニタリングと運用
1. Prometheusエクスポーターの実装
2. ロギングとエラー処理の強化
3. パフォーマンス最適化

## 技術的な考慮事項

1. **CloudFlare API認証**: APIキーの安全な管理と認証フロー
2. **Minecraftサーバー監視の効率化**: 
   - 複数サーバーの並列監視
   - 接続タイムアウトとリトライ戦略
3. **データベースパフォーマンス**:
   - インデックス最適化
   - 履歴データの効率的な保存
4. **セキュリティ考慮事項**:
   - API認証
   - 入力検証
   - レート制限
   - 安全な環境変数管理
