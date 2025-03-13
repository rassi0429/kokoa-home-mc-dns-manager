import { Express } from 'express';
import { setupServerRoutes } from './servers';
import { setupHealthRoutes } from './health';
import { logger } from '../utils/logger';

/**
 * Setup all routes for the Express application
 * @param app Express application
 */
export function setupRoutes(app: Express): void {
  // Setup health check routes
  setupHealthRoutes(app);
  
  // Setup server management routes
  setupServerRoutes(app);
  
  logger.info('ルートを設定しました');
}
