import { Express, Request, Response } from 'express';
import { MinecraftServerSchema } from '@kokoa-home-mc-dns-manager/shared';
import { logger } from '../utils/logger';
import { createServer, deleteServer, getServer, getServers, updateServer } from '../controllers/servers';
import { extractErrorMessage } from '@kokoa-home-mc-dns-manager/shared';

/**
 * サーバー管理ルートを設定する
 * @param app Express application
 */
export function setupServerRoutes(app: Express): void {
  // サーバー一覧を取得
  app.get('/api/servers', async (req: Request, res: Response) => {
    try {
      const servers = await getServers();
      res.status(200).json({
        success: true,
        data: servers,
      });
    } catch (error) {
      logger.error('サーバー一覧の取得に失敗しました', { error });
      res.status(500).json({
        success: false,
        error: extractErrorMessage(error),
      });
    }
  });

  // サーバー詳細を取得
  app.get('/api/servers/:id', async (req: Request, res: Response) => {
    try {
      const server = await getServer(req.params.id);
      
      if (!server) {
        return res.status(404).json({
          success: false,
          error: 'サーバーが見つかりません',
        });
      }
      
      res.status(200).json({
        success: true,
        data: server,
      });
    } catch (error) {
      logger.error('サーバー詳細の取得に失敗しました', { error, id: req.params.id });
      res.status(500).json({
        success: false,
        error: extractErrorMessage(error),
      });
    }
  });

  // サーバーを作成
  app.post('/api/servers', async (req: Request, res: Response) => {
    try {
        console.log(req.body);
      const validationResult = MinecraftServerSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: '入力データが不正です',
          details: validationResult.error.format(),
        });
      }
      
      const server = await createServer(validationResult.data);
      
      res.status(201).json({
        success: true,
        data: server,
      });
    } catch (error) {
      logger.error('サーバーの作成に失敗しました', { error, data: req.body });
      res.status(500).json({
        success: false,
        error: extractErrorMessage(error),
      });
    }
  });

  // サーバーを更新
  app.put('/api/servers/:id', async (req: Request, res: Response) => {
    try {
      const validationResult = MinecraftServerSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: '入力データが不正です',
          details: validationResult.error.format(),
        });
      }
      
      const server = await updateServer(req.params.id, validationResult.data);
      
      if (!server) {
        return res.status(404).json({
          success: false,
          error: 'サーバーが見つかりません',
        });
      }
      
      res.status(200).json({
        success: true,
        data: server,
      });
    } catch (error) {
      logger.error('サーバーの更新に失敗しました', { error, id: req.params.id, data: req.body });
      res.status(500).json({
        success: false,
        error: extractErrorMessage(error),
      });
    }
  });

  // サーバーを削除
  app.delete('/api/servers/:id', async (req: Request, res: Response) => {
    try {
      const success = await deleteServer(req.params.id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'サーバーが見つかりません',
        });
      }
      
      res.status(200).json({
        success: true,
      });
    } catch (error) {
      logger.error('サーバーの削除に失敗しました', { error, id: req.params.id });
      res.status(500).json({
        success: false,
        error: extractErrorMessage(error),
      });
    }
  });

  logger.info('サーバー管理ルートを設定しました');
}
