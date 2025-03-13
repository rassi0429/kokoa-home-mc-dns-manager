import { MinecraftServer } from '@kokoa-home-mc-dns-manager/shared';
import { getRepository } from 'typeorm';
import { ServerEntity } from '../entities/ServerEntity';
import { CloudFlareService } from '../services/cloudflare';
import { logger } from '../utils/logger';

const cloudflareService = new CloudFlareService();

/**
 * サーバー一覧を取得する
 * @returns サーバー一覧
 */
export async function getServers(): Promise<MinecraftServer[]> {
  const serverRepository = getRepository(ServerEntity);
  return serverRepository.find();
}

/**
 * サーバー詳細を取得する
 * @param id サーバーID
 * @returns サーバー詳細
 */
export async function getServer(id: string): Promise<MinecraftServer | null> {
  const serverRepository = getRepository(ServerEntity);
  const server = await serverRepository.findOne({ where: { id }, relations: ['statuses'] });
  return server || null;
}

/**
 * サーバーを作成する
 * @param serverData サーバーデータ
 * @returns 作成されたサーバー
 */
export async function createServer(serverData: MinecraftServer): Promise<MinecraftServer> {
  const serverRepository = getRepository(ServerEntity);
  
  // CloudFlareにSRVレコードを作成
  const recordId = await cloudflareService.createMinecraftSrvRecord(
    serverData.dnsRecord,
    serverData.targetHostname,
    serverData.targetPort
  );
  
  logger.info('CloudFlareにSRVレコードを作成しました', { 
    dnsRecord: serverData.dnsRecord, 
    recordId 
  });
  
  // データベースにサーバー情報を保存
  const server = serverRepository.create({
    ...serverData,
    cloudflareRecordId: recordId,
  });
  
  return serverRepository.save(server);
}

/**
 * サーバーを更新する
 * @param id サーバーID
 * @param serverData サーバーデータ
 * @returns 更新されたサーバー
 */
export async function updateServer(id: string, serverData: MinecraftServer): Promise<MinecraftServer | null> {
  const serverRepository = getRepository(ServerEntity);
  const existingServer = await serverRepository.findOne({ where: { id } });
  
  if (!existingServer) {
    return null;
  }
  
  // CloudFlareのSRVレコードを更新
  await cloudflareService.updateMinecraftSrvRecord(
    existingServer.cloudflareRecordId,
    serverData.dnsRecord,
    serverData.targetHostname,
    serverData.targetPort
  );
  
  logger.info('CloudFlareのSRVレコードを更新しました', { 
    dnsRecord: serverData.dnsRecord, 
    recordId: existingServer.cloudflareRecordId 
  });
  
  // データベースのサーバー情報を更新
  const updatedServer = {
    ...existingServer,
    ...serverData,
    id, // IDは変更しない
  };
  
  return serverRepository.save(updatedServer);
}

/**
 * サーバーを削除する
 * @param id サーバーID
 * @returns 削除に成功したかどうか
 */
export async function deleteServer(id: string): Promise<boolean> {
  const serverRepository = getRepository(ServerEntity);
  const server = await serverRepository.findOne({ where: { id } });
  
  if (!server) {
    return false;
  }
  
  // CloudFlareのSRVレコードを削除
  await cloudflareService.deleteRecord(server.cloudflareRecordId);
  
  logger.info('CloudFlareのSRVレコードを削除しました', { 
    dnsRecord: server.dnsRecord, 
    recordId: server.cloudflareRecordId 
  });
  
  // データベースからサーバー情報を削除
  await serverRepository.remove(server);
  
  return true;
}
