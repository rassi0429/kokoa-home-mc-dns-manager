import axios from 'axios';
import { MinecraftServer, ApiResponse } from '@kokoa-home-mc-dns-manager/shared';

// APIのベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Axiosインスタンスの作成
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * サーバー一覧を取得する
 * @returns サーバー一覧
 */
export async function fetchServers(): Promise<MinecraftServer[]> {
  const response = await api.get<ApiResponse<MinecraftServer[]>>('/servers');
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'サーバー一覧の取得に失敗しました');
  }
  
  return response.data.data || [];
}

/**
 * サーバー詳細を取得する
 * @param id サーバーID
 * @returns サーバー詳細
 */
export async function fetchServer(id: string): Promise<MinecraftServer> {
  const response = await api.get<ApiResponse<MinecraftServer>>(`/servers/${id}`);
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'サーバー詳細の取得に失敗しました');
  }
  
  if (!response.data.data) {
    throw new Error('サーバーが見つかりません');
  }
  
  return response.data.data;
}

/**
 * サーバーを作成する
 * @param server サーバーデータ
 * @returns 作成されたサーバー
 */
export async function createServer(server: MinecraftServer): Promise<MinecraftServer> {
  const response = await api.post<ApiResponse<MinecraftServer>>('/servers', server);
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'サーバーの作成に失敗しました');
  }
  
  if (!response.data.data) {
    throw new Error('サーバーの作成に失敗しました');
  }
  
  return response.data.data;
}

/**
 * サーバーを更新する
 * @param id サーバーID
 * @param server サーバーデータ
 * @returns 更新されたサーバー
 */
export async function updateServer(id: string, server: MinecraftServer): Promise<MinecraftServer> {
  const response = await api.put<ApiResponse<MinecraftServer>>(`/servers/${id}`, server);
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'サーバーの更新に失敗しました');
  }
  
  if (!response.data.data) {
    throw new Error('サーバーの更新に失敗しました');
  }
  
  return response.data.data;
}

/**
 * サーバーを削除する
 * @param id サーバーID
 */
export async function deleteServer(id: string): Promise<void> {
  const response = await api.delete<ApiResponse<void>>(`/servers/${id}`);
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'サーバーの削除に失敗しました');
  }
}

/**
 * CloudFlareからDNSレコードをインポートする
 * @param domain ドメイン名（オプション）
 * @returns インポート結果
 */
export async function importDnsRecords(domain?: string): Promise<{
  importedCount: number;
  totalRecords: number;
  importedServers: string[];
  message: string;
}> {
  const response = await api.post<ApiResponse<{
    importedCount: number;
    totalRecords: number;
    importedServers: string[];
    message: string;
  }>>('/servers/import', { domain });
  
  if (!response.data.success) {
    throw new Error(response.data.error || 'DNSレコードのインポートに失敗しました');
  }
  
  if (!response.data.data) {
    throw new Error('DNSレコードのインポートに失敗しました');
  }
  
  return response.data.data;
}
