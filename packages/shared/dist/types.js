"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerStatusSchema = exports.MinecraftServerSchema = void 0;
const zod_1 = require("zod");
// Minecraft Server Schema
exports.MinecraftServerSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    name: zod_1.z.string().min(1, 'サーバー名は必須です'),
    dnsRecord: zod_1.z.string().min(1, 'DNSレコードは必須です'),
    targetIp: zod_1.z.string().min(1, 'ターゲットIPは必須です'),
    targetHostname: zod_1.z.string().min(1, 'ターゲットホスト名は必須です'),
    targetPort: zod_1.z.number().int().min(1, 'ポート番号は1以上である必要があります').max(65535, 'ポート番号は65535以下である必要があります'),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional(),
});
// Server Status Schema
exports.ServerStatusSchema = zod_1.z.object({
    id: zod_1.z.string().uuid().optional(),
    serverId: zod_1.z.string().uuid(),
    isOnline: zod_1.z.boolean(),
    playerCount: zod_1.z.number().int().min(0),
    maxPlayers: zod_1.z.number().int().min(0),
    motd: zod_1.z.string().optional(),
    version: zod_1.z.string().optional(),
    lastCheckedAt: zod_1.z.date(),
});
