import { Express, Request, Response } from 'express';
import { logger } from '../utils/logger';

/**
 * ヘルスチェックルートを設定する
 * @param app Express application
 */
export function setupHealthRoutes(app: Express): void {
  // ヘルスチェックエンドポイント
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // 詳細なヘルスチェックエンドポイント
  app.get('/health/details', (req: Request, res: Response) => {
    const memoryUsage = process.memoryUsage();
    
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(memoryUsage.external / 1024 / 1024)} MB`,
      },
      environment: process.env.NODE_ENV || 'development',
    });
  });

  logger.info('ヘルスチェックルートを設定しました');
}
