import axios from 'axios';
import { CloudFlareSrvRecord } from '@kokoa-home-mc-dns-manager/shared';
import { generateMinecraftSrvName, generateSrvContent } from '@kokoa-home-mc-dns-manager/shared';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

/**
 * CloudFlare APIとの連携を行うサービス
 */
export class CloudFlareService {
  private apiKey: string;
  private email: string;
  private zoneId: string;
  private baseUrl: string;

  constructor() {
    dotenv.config();

    this.apiKey = process.env.CLOUDFLARE_API_KEY || '';
    this.email = process.env.CLOUDFLARE_EMAIL || '';
    this.zoneId = process.env.CLOUDFLARE_ZONE_ID || '';
    this.baseUrl = `https://api.cloudflare.com/client/v4/zones/${this.zoneId}/dns_records`;

    if (!this.apiKey || !this.email || !this.zoneId) {
      logger.warn('CloudFlare APIの設定が不完全です');
    }
  }

  /**
   * CloudFlare APIのリクエストヘッダーを取得する
   * @returns リクエストヘッダー
   */
  private getHeaders() {
    return {
      'X-Auth-Email': this.email,
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * マインクラフト用のSRVレコードを作成する
   * @param domain ドメイン名
   * @param targetHostname ターゲットホスト名
   * @param targetPort ターゲットポート
   * @returns レコードID
   */
  async createMinecraftSrvRecord(domain: string, targetHostname: string, targetPort: number): Promise<string> {
    try {
      const name = generateMinecraftSrvName(domain);
      const content = generateSrvContent(1, 1, targetPort, targetHostname);

      const data: CloudFlareSrvRecord = {
        type: 'SRV',
        name,
        content,
        //ttl: 1, // Auto TTL
        //priority: 1,
        data: {
          service: '_minecraft',
          proto: '_tcp',
          name: domain,
          priority: 1,
          weight: 1,
          port: targetPort,
          target: targetHostname,
        },
      };

      const response = await axios.post(this.baseUrl, data, {
        headers: this.getHeaders(),
      });

      if (!response.data.success) {
        console.log(response.data);
        throw new Error(`CloudFlare API error: ${JSON.stringify(response.data.errors)}`);
      }

      return response.data.result.id;
    } catch (error) {
      logger.error('CloudFlare SRVレコードの作成に失敗しました', { error });
      throw error;
    }
  }

  /**
   * マインクラフト用のSRVレコードを更新する
   * @param recordId レコードID
   * @param domain ドメイン名
   * @param targetHostname ターゲットホスト名
   * @param targetPort ターゲットポート
   */
  async updateMinecraftSrvRecord(recordId: string, domain: string, targetHostname: string, targetPort: number): Promise<void> {
    try {
      const name = generateMinecraftSrvName(domain);
      const content = generateSrvContent(1, 1, targetPort, targetHostname);

      const data: CloudFlareSrvRecord = {
        type: 'SRV',
        name,
        content,
        data: {
          service: '_minecraft',
          proto: '_tcp',
          name: domain,
          priority: 1,
          weight: 1,
          port: targetPort,
          target: targetHostname,
        },
      };

      const response = await axios.put(`${this.baseUrl}/${recordId}`, data, {
        headers: this.getHeaders(),
      });

      if (!response.data.success) {
        throw new Error(`CloudFlare API error: ${JSON.stringify(response.data.errors)}`);
      }
    } catch (error) {
      logger.error('CloudFlare SRVレコードの更新に失敗しました', { error, recordId });
      throw error;
    }
  }

  /**
   * CloudFlareのDNSレコードを削除する
   * @param recordId レコードID
   */
  async deleteRecord(recordId: string): Promise<void> {
    try {
      const response = await axios.delete(`${this.baseUrl}/${recordId}`, {
        headers: this.getHeaders(),
      });

      if (!response.data.success) {
        throw new Error(`CloudFlare API error: ${JSON.stringify(response.data.errors)}`);
      }
    } catch (error) {
      logger.error('CloudFlare DNSレコードの削除に失敗しました', { error, recordId });
      throw error;
    }
  }
}
