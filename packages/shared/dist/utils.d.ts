/**
 * CloudFlare SRVレコード用のコンテンツを生成する
 * @param priority 優先度
 * @param weight 重み
 * @param port ポート
 * @param target ターゲット
 * @returns SRVレコードのコンテンツ文字列
 */
export declare function generateSrvContent(priority: number, weight: number, port: number, target: string): string;
/**
 * IPアドレスとポートを分割する
 * @param ipWithPort "192.168.1.1:25565" 形式の文字列
 * @returns [ip, port] の配列
 */
export declare function splitIpAndPort(ipWithPort: string): [string, number];
/**
 * マインクラフト用のSRVレコード名を生成する
 * @param domain ドメイン名 (例: "example.com")
 * @returns SRVレコード名 (例: "_minecraft._tcp.example.com")
 */
export declare function generateMinecraftSrvName(domain: string): string;
/**
 * エラーメッセージを抽出する
 * @param error エラーオブジェクト
 * @returns エラーメッセージ
 */
export declare function extractErrorMessage(error: unknown): string;
