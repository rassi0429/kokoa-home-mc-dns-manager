import { z } from 'zod';

// Minecraft Server Schema
export const MinecraftServerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'サーバー名は必須です'),
  dnsRecord: z.string().min(1, 'DNSレコードは必須です'),
  targetIp: z.string().min(1, 'ターゲットIPは必須です'),
  targetHostname: z.string().min(1, 'ターゲットホスト名は必須です'),
  targetPort: z.number().int().min(1, 'ポート番号は1以上である必要があります').max(65535, 'ポート番号は65535以下である必要があります'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type MinecraftServer = z.infer<typeof MinecraftServerSchema>;

// Server Status Schema
export const ServerStatusSchema = z.object({
  id: z.string().uuid().optional(),
  serverId: z.string().uuid(),
  isOnline: z.boolean(),
  playerCount: z.number().int().min(0),
  maxPlayers: z.number().int().min(0),
  motd: z.string().optional(),
  version: z.string().optional(),
  lastCheckedAt: z.date(),
});

export type ServerStatus = z.infer<typeof ServerStatusSchema>;

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// CloudFlare SRV Record Type
export interface CloudFlareSrvRecord {
  id?: string;
  name: string;
  type: 'SRV';
  content: string;
  ttl?: number;
  priority?: number;
  data: {
    service: string;
    proto: string;
    name: string;
    priority: number;
    weight: number;
    port: number;
    target: string;
  };
}
