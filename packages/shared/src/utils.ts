/**
 * CloudFlare SRVレコード用のコンテンツを生成する
 * @param priority 優先度
 * @param weight 重み
 * @param port ポート
 * @param target ターゲット
 * @returns SRVレコードのコンテンツ文字列
 */
export function generateSrvContent(
  priority: number,
  weight: number,
  port: number,
  target: string
): string {
  return `${priority} ${weight} ${port} ${target}`;
}

/**
 * IPアドレスとポートを分割する
 * @param ipWithPort "192.168.1.1:25565" 形式の文字列
 * @returns [ip, port] の配列
 */
export function splitIpAndPort(ipWithPort: string): [string, number] {
  const parts = ipWithPort.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid IP:Port format. Expected format: "192.168.1.1:25565"');
  }
  
  const ip = parts[0];
  const port = parseInt(parts[1], 10);
  
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error('Invalid port number. Port must be between 1 and 65535');
  }
  
  return [ip, port];
}

/**
 * マインクラフト用のSRVレコード名を生成する
 * @param domain ドメイン名 (例: "example.com")
 * @returns SRVレコード名 (例: "_minecraft._tcp.example.com")
 */
export function generateMinecraftSrvName(domain: string): string {
  return `_minecraft._tcp.${domain}`;
}

/**
 * エラーメッセージを抽出する
 * @param error エラーオブジェクト
 * @returns エラーメッセージ
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
