"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSrvContent = generateSrvContent;
exports.splitIpAndPort = splitIpAndPort;
exports.generateMinecraftSrvName = generateMinecraftSrvName;
exports.extractErrorMessage = extractErrorMessage;
/**
 * CloudFlare SRVレコード用のコンテンツを生成する
 * @param priority 優先度
 * @param weight 重み
 * @param port ポート
 * @param target ターゲット
 * @returns SRVレコードのコンテンツ文字列
 */
function generateSrvContent(priority, weight, port, target) {
    return `${priority} ${weight} ${port} ${target}`;
}
/**
 * IPアドレスとポートを分割する
 * @param ipWithPort "192.168.1.1:25565" 形式の文字列
 * @returns [ip, port] の配列
 */
function splitIpAndPort(ipWithPort) {
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
function generateMinecraftSrvName(domain) {
    return `_minecraft._tcp.${domain}`;
}
/**
 * エラーメッセージを抽出する
 * @param error エラーオブジェクト
 * @returns エラーメッセージ
 */
function extractErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}
