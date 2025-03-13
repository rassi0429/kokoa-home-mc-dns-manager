import { Express } from 'express';
import { setupBasicAuth } from './basicAuth';

/**
 * Setup all middleware for the Express application
 * @param app Express application
 */
export function setupMiddleware(app: Express): void {
  // Setup basic authentication
  setupBasicAuth(app);
}
