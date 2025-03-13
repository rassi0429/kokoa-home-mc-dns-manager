import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createConnection, ConnectionOptions } from 'typeorm';
import { setupRoutes } from './routes';
import { setupMiddleware } from './middleware';
import { setupMetricsServer } from './services/metrics';
import { MinecraftMonitoringService } from './services/minecraft';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001; // Use port 3001 for backend to avoid conflict with frontend

// Helper function to get database connection options
function getDatabaseConfig(): ConnectionOptions {
  const dbUrl = process.env.DATABASE_URL;
  let dbConfig: any = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'minecraft_dns',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production',
    entities: [__dirname + '/entities/**/*.{js,ts}'],
    migrations: [__dirname + '/migrations/**/*.{js,ts}'],
    subscribers: [__dirname + '/subscribers/**/*.{js,ts}'],
  };

  // If DATABASE_URL is provided, parse it and override the individual settings
  if (dbUrl) {
    try {
      const url = new URL(dbUrl);
      // In development mode and not in Docker, use localhost instead of db
      const hostname = (process.env.NODE_ENV === 'development' && !process.env.DOCKER_ENV && url.hostname === 'db') 
        ? 'localhost' 
        : url.hostname;
      
      dbConfig = {
        ...dbConfig,
        host: hostname,
        port: parseInt(url.port || '5432', 10),
        username: url.username,
        password: url.password,
        database: url.pathname.substring(1), // Remove leading slash
      };
      
      console.log(`Using database configuration: ${hostname}:${dbConfig.port}/${dbConfig.database}`);
    } catch (error) {
      console.error('Failed to parse DATABASE_URL:', error);
    }
  }

  return dbConfig as ConnectionOptions;
}

async function startServer() {
  try {
    // Setup database connection
    console.log('Attempting to connect to database...');
    const dbConfig = getDatabaseConfig();
    await createConnection(dbConfig);
    logger.info('Database connection established');

    // Setup middleware
    setupMiddleware(app);

    // Setup CORS
    app.use(cors());
    app.use(express.json());

    // Setup routes
    setupRoutes(app);

    // Start the server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    // Setup metrics server
    setupMetricsServer();

    // Start Minecraft server monitoring
    const monitoringService = new MinecraftMonitoringService();
    await monitoringService.startMonitoring();
    logger.info('Minecraft server monitoring started');
  } catch (error) {
    console.error('Database connection error:', error);
    logger.error('Failed to start server', { 
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error 
    });
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
  process.exit(1);
});

// Start the server
startServer();
