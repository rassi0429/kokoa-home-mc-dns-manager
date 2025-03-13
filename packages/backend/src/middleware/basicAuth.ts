import { Express, Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Basic認証ミドルウェア
 */
export function basicAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic');
    res.status(401).send('認証が必要です');
    return;
  }
  
  try {
    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = credentials[0];
    const password = credentials[1];
    
    const expectedUsername = process.env.BASIC_AUTH_USER;
    const expectedPassword = process.env.BASIC_AUTH_PASS;
    
    if (!expectedUsername || !expectedPassword) {
      logger.warn('Basic認証の環境変数が設定されていません');
      next();
      return;
    }
    
    if (username === expectedUsername && password === expectedPassword) {
      next();
      return;
    }
    
    res.setHeader('WWW-Authenticate', 'Basic');
    res.status(401).send('認証に失敗しました');
  } catch (error) {
    logger.error('Basic認証の処理中にエラーが発生しました', { error });
    res.setHeader('WWW-Authenticate', 'Basic');
    res.status(401).send('認証エラーが発生しました');
  }
}

/**
 * Basic認証をExpressアプリケーションに設定する
 * @param app Express application
 */
export function setupBasicAuth(app: Express): void {
  app.use(basicAuth);
  logger.info('Basic認証ミドルウェアを設定しました');
}
