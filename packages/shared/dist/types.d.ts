import { z } from 'zod';
export declare const ServerStatusSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    serverId: z.ZodString;
    isOnline: z.ZodBoolean;
    playerCount: z.ZodNumber;
    maxPlayers: z.ZodNumber;
    motd: z.ZodOptional<z.ZodString>;
    version: z.ZodOptional<z.ZodString>;
    lastCheckedAt: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    serverId: string;
    isOnline: boolean;
    playerCount: number;
    maxPlayers: number;
    lastCheckedAt: Date;
    id?: string | undefined;
    motd?: string | undefined;
    version?: string | undefined;
}, {
    serverId: string;
    isOnline: boolean;
    playerCount: number;
    maxPlayers: number;
    lastCheckedAt: Date;
    id?: string | undefined;
    motd?: string | undefined;
    version?: string | undefined;
}>;
export type ServerStatus = z.infer<typeof ServerStatusSchema>;
export declare const MinecraftServerSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    dnsRecord: z.ZodString;
    targetIp: z.ZodString;
    targetHostname: z.ZodString;
    targetPort: z.ZodNumber;
    cloudflareRecordId: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodOptional<z.ZodDate>;
    updatedAt: z.ZodOptional<z.ZodDate>;
    statuses: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        serverId: z.ZodString;
        isOnline: z.ZodBoolean;
        playerCount: z.ZodNumber;
        maxPlayers: z.ZodNumber;
        motd: z.ZodOptional<z.ZodString>;
        version: z.ZodOptional<z.ZodString>;
        lastCheckedAt: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        serverId: string;
        isOnline: boolean;
        playerCount: number;
        maxPlayers: number;
        lastCheckedAt: Date;
        id?: string | undefined;
        motd?: string | undefined;
        version?: string | undefined;
    }, {
        serverId: string;
        isOnline: boolean;
        playerCount: number;
        maxPlayers: number;
        lastCheckedAt: Date;
        id?: string | undefined;
        motd?: string | undefined;
        version?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    dnsRecord: string;
    targetIp: string;
    targetHostname: string;
    targetPort: number;
    id?: string | undefined;
    cloudflareRecordId?: string | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    statuses?: {
        serverId: string;
        isOnline: boolean;
        playerCount: number;
        maxPlayers: number;
        lastCheckedAt: Date;
        id?: string | undefined;
        motd?: string | undefined;
        version?: string | undefined;
    }[] | undefined;
}, {
    name: string;
    dnsRecord: string;
    targetIp: string;
    targetHostname: string;
    targetPort: number;
    id?: string | undefined;
    cloudflareRecordId?: string | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    statuses?: {
        serverId: string;
        isOnline: boolean;
        playerCount: number;
        maxPlayers: number;
        lastCheckedAt: Date;
        id?: string | undefined;
        motd?: string | undefined;
        version?: string | undefined;
    }[] | undefined;
}>;
export type MinecraftServer = z.infer<typeof MinecraftServerSchema>;
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
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
