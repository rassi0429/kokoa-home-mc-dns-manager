import { getRepository } from 'typeorm';
import { ServerEntity } from '../entities/ServerEntity';
import { CloudFlareService } from './cloudflare';
import { logger } from '../utils/logger';

/**
 * CloudFlareからDNSレコードをインポートするサービス
 */
export class DnsImportService {
  private cloudflareService: CloudFlareService;

  constructor() {
    this.cloudflareService = new CloudFlareService();
  }

  /**
   * 指定したドメインのマインクラフトSRVレコードをインポートする
   * @param domain ドメイン名（オプション）。指定しない場合は全てのSRVレコードを取得
   * @returns インポート結果の詳細情報
   */
  async importMinecraftDnsRecords(domain?: string): Promise<{
    importedCount: number;
    totalRecords: number;
    importedServers: string[];
  }> {
    try {
      logger.info(`CloudFlareからマインクラフトDNSレコードのインポートを開始します${domain ? ` (ドメイン: ${domain}とそのサブドメイン)` : ''}`);
      
      // CloudFlareからSRVレコードを取得
      const records = await this.cloudflareService.getMinecraftSrvRecords(domain);
      
      if (records.length === 0) {
        logger.info('インポート可能なマインクラフトSRVレコードが見つかりませんでした');
        return {
          importedCount: 0,
          totalRecords: 0,
          importedServers: []
        };
      }
      
      logger.info(`${records.length}件のマインクラフトSRVレコードが見つかりました`);
      
      const serverRepository = getRepository(ServerEntity);
      let importedCount = 0;
      const importedServers: string[] = [];
      
      // 各レコードをデータベースに保存
      for (const record of records) {
        // SRVレコードからサーバー情報を抽出
        const serverData = this.cloudflareService.parseSrvRecordToServer(record);
        
        // レコードIDで既存のサーバーを検索
        const existingServer = await serverRepository.findOne({ 
          where: { cloudflareRecordId: record.id } 
        });
        
        if (existingServer) {
          // 既存のサーバーを更新
          logger.debug(`レコードID ${record.id} の既存サーバーを更新します`);
          
          // 更新するフィールド
          if (serverData.targetIp) existingServer.targetIp = serverData.targetIp;
          if (serverData.targetHostname) existingServer.targetHostname = serverData.targetHostname;
          if (serverData.targetPort !== undefined) existingServer.targetPort = serverData.targetPort;
          
          await serverRepository.save(existingServer);
          importedCount++;
          importedServers.push(`${existingServer.dnsRecord} (${existingServer.targetHostname}:${existingServer.targetPort}) - 更新`);
          
          logger.debug(`サーバーを更新しました: ${existingServer.name} (${existingServer.dnsRecord})`);
        } else {
          // 新規サーバーを作成
          // データベースに保存
          // 必須フィールドのデフォルト値を設定
          const server = serverRepository.create({
            name: serverData.name || `Imported: ${record.data.name || 'Unknown'}`,
            dnsRecord: serverData.dnsRecord || record.data.name || 'unknown.domain',
            targetIp: serverData.targetIp || record.data.target || 'unknown',
            targetHostname: serverData.targetHostname || record.data.target || 'unknown',
            targetPort: serverData.targetPort !== undefined ? serverData.targetPort : record.data.port || 25565,
            cloudflareRecordId: record.id
          });
          
          await serverRepository.save(server);
          importedCount++;
          importedServers.push(`${server.dnsRecord} (${server.targetHostname}:${server.targetPort}) - 新規`);
          
          logger.debug(`新規サーバーをインポートしました: ${server.name} (${server.dnsRecord})`);
        }
      }
      
      logger.info(`${importedCount}件のサーバーを正常にインポートしました`);
      return {
        importedCount,
        totalRecords: records.length,
        importedServers
      };
    } catch (error) {
      logger.error('DNSレコードのインポートに失敗しました', { error });
      throw error;
    }
  }
}
