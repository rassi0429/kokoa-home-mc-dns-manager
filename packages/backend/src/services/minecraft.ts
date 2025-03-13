import * as mc from 'minecraft-protocol';
import { getRepository } from 'typeorm';
import { ServerEntity } from '../entities/ServerEntity';
import { ServerStatusEntity } from '../entities/ServerStatusEntity';
import { logger } from '../utils/logger';

/**
 * マインクラフトサーバーの監視を行うサービス
 */
export class MinecraftMonitoringService {
  private pollingInterval: number;

  constructor() {
    this.pollingInterval = parseInt(process.env.MINECRAFT_POLLING_INTERVAL || '60000', 10);
  }

  /**
   * 監視を開始する
   */
  async startMonitoring(): Promise<void> {
    logger.info(`マインクラフトサーバー監視を開始します (間隔: ${this.pollingInterval}ms)`);
    
    // 定期的にサーバーステータスをチェック
    setInterval(async () => {
      await this.checkAllServers();
    }, this.pollingInterval);
    
    // 初回実行
    await this.checkAllServers();
  }

  /**
   * 全サーバーのステータスをチェックする
   */
  private async checkAllServers(): Promise<void> {
    try {
      const serverRepository = getRepository(ServerEntity);
      const servers = await serverRepository.find();
      
      logger.debug(`${servers.length}台のサーバーをチェックします`);
      
      // 並列でサーバーステータスをチェック
      await Promise.all(servers.map(server => this.checkServerStatus(server)));
    } catch (error) {
      logger.error('サーバーステータスのチェックに失敗しました', { error });
    }
  }

  /**
   * 単一サーバーのステータスをチェックする
   * @param server サーバーエンティティ
   */
  private async checkServerStatus(server: ServerEntity): Promise<void> {
    const statusRepository = getRepository(ServerStatusEntity);
    const status = new ServerStatusEntity();
    status.serverId = server.id;
    status.isOnline = false;
    status.playerCount = 0;
    status.maxPlayers = 0;
    
    try {
      logger.debug(`サーバーをチェック中: ${server.name} (${server.targetIp}:${server.targetPort})`);
      
      // マインクラフトサーバーにping
      const pingResult = await this.pingServer(server.targetIp, server.targetPort);
      
      // ステータス情報を更新
      status.isOnline = true;
      status.playerCount = pingResult.players.online;
      status.maxPlayers = pingResult.players.max;
      status.motd = pingResult.description.text || pingResult.description;
      status.version = pingResult.version.name;
      
      logger.debug(`サーバーはオンラインです: ${server.name}`, {
        players: `${status.playerCount}/${status.maxPlayers}`,
        version: status.version,
      });
    } catch (error) {
      logger.warn(`サーバーはオフラインです: ${server.name}`, { error });
    }
    
    // ステータスをデータベースに保存
    await statusRepository.save(status);
  }

  /**
   * マインクラフトサーバーにpingを送信する
   * @param host ホスト
   * @param port ポート
   * @returns pingの結果
   */
  private pingServer(host: string, port: number): Promise<any> {
    return new Promise((resolve, reject) => {
      mc.ping({
        host,
        port,
      }, (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result);
      });
    });
  }
}
