import express from 'express';
import * as promClient from 'prom-client';
import { getRepository } from 'typeorm';
import { ServerEntity } from '../entities/ServerEntity';
import { ServerStatusEntity } from '../entities/ServerStatusEntity';
import { logger } from '../utils/logger';

// Prometheusレジストリの作成
const register = new promClient.Registry();

// デフォルトのメトリクスを登録
promClient.collectDefaultMetrics({ register });

// マインクラフトサーバーのオンラインステータスメトリクス
const serverOnlineGauge = new promClient.Gauge({
  name: 'minecraft_server_online',
  help: 'Minecraft server online status (1=online, 0=offline)',
  labelNames: ['server_name', 'dns_record', 'server_id'],
  registers: [register],
});

// マインクラフトサーバーのプレイヤー数メトリクス
const playerCountGauge = new promClient.Gauge({
  name: 'minecraft_server_player_count',
  help: 'Number of players currently online',
  labelNames: ['server_name', 'dns_record', 'server_id'],
  registers: [register],
});

// マインクラフトサーバーの最大プレイヤー数メトリクス
const maxPlayersGauge = new promClient.Gauge({
  name: 'minecraft_server_max_players',
  help: 'Maximum number of players allowed',
  labelNames: ['server_name', 'dns_record', 'server_id'],
  registers: [register],
});

/**
 * メトリクスサーバーを設定する
 */
export function setupMetricsServer(): void {
  const app = express();
  const metricsPort = parseInt(process.env.METRICS_PORT || '9090', 10);

  // Basic認証の設定
  const username = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASS;

  if (username && password) {
    app.use((req, res, next) => {
      const auth = req.headers.authorization;
      
      if (!auth) {
        res.setHeader('WWW-Authenticate', 'Basic');
        return res.status(401).send('認証が必要です');
      }
      
      const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
      const authUsername = credentials[0];
      const authPassword = credentials[1];
      
      if (authUsername === username && authPassword === password) {
        return next();
      }
      
      res.setHeader('WWW-Authenticate', 'Basic');
      return res.status(401).send('認証に失敗しました');
    });
    
    logger.info('メトリクスエンドポイントにBasic認証を設定しました');
  }

  // メトリクスエンドポイント
  app.get('/metrics', async (req, res) => {
    try {
      // メトリクスを更新
      await updateMetrics();
      
      // メトリクスを返す
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (error) {
      logger.error('メトリクスの生成に失敗しました', { error });
      res.status(500).send('メトリクスの生成に失敗しました');
    }
  });

  // サーバーを起動
  app.listen(metricsPort, () => {
    logger.info(`Prometheusメトリクスサーバーを起動しました: http://localhost:${metricsPort}/metrics`);
  });
}

/**
 * メトリクスを更新する
 */
async function updateMetrics(): Promise<void> {
  try {
    const serverRepository = getRepository(ServerEntity);
    const statusRepository = getRepository(ServerStatusEntity);
    
    // 全サーバーを取得
    const servers = await serverRepository.find();
    
    for (const server of servers) {
      // 最新のステータスを取得
      const latestStatus = await statusRepository.findOne({
        where: { serverId: server.id },
        order: { lastCheckedAt: 'DESC' },
      });
      
      if (latestStatus) {
        // メトリクスを更新
        serverOnlineGauge.set(
          { server_name: server.name, dns_record: server.dnsRecord, server_id: server.id },
          latestStatus.isOnline ? 1 : 0
        );
        
        playerCountGauge.set(
          { server_name: server.name, dns_record: server.dnsRecord, server_id: server.id },
          latestStatus.playerCount
        );
        
        maxPlayersGauge.set(
          { server_name: server.name, dns_record: server.dnsRecord, server_id: server.id },
          latestStatus.maxPlayers
        );
      }
    }
  } catch (error) {
    logger.error('メトリクスの更新に失敗しました', { error });
  }
}
