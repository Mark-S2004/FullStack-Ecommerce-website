// server/src/app.ts
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { connect, set, disconnect } from 'mongoose';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { HttpException } from '@exceptions/HttpException';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import { dbConnection } from '@databases';
import { Routes } from '@interfaces/routes.interface';
import errorMiddleware from '@middlewares/error.middleware';
// Non-blocking auth (parses token but does not enforce)
import authMiddleware from '@middlewares/auth.middleware';
// Blocking auth (requires valid user)
import authRequiredMiddleware from '@middlewares/authRequired.middleware';
import { logger, stream } from '@utils/logger';
import routeConfigs from '@routes/index';
// DEFAULT import - this IS the instance/object, NOT a class
import webhookRouteInstanceFromFile from '@routes/webhook.route';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor() {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    
    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes(routeConfigs);
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public async closeDatabaseConnection(): Promise<void> {
    try {
      await disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }

  public getServer() {
    return this.app;
  }

  /**
   * Configure global middleware:
   * - Logging, security, CORS, raw webhook, body parsing, cookie parsing, auth
   */
  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());

    // Mount Stripe webhook BEFORE body parsing
    // Assuming webhook.route.ts exports an object { path: string, router: Router }
    if (webhookRouteInstanceFromFile && webhookRouteInstanceFromFile.path && webhookRouteInstanceFromFile.router) {
      this.app.use('/api' + webhookRouteInstanceFromFile.path, webhookRouteInstanceFromFile.router);
      logger.info(`Stripe Webhook explicitly mounted at /api${webhookRouteInstanceFromFile.path}`);
    } else {
      logger.warn('Stripe Webhook route instance (from webhook.route.ts) is not correctly defined or not found.');
    }

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
    this.app.use(authMiddleware); // Non-blocking auth for all routes after this
  }

  /**
   * Mount application routes under /api,
   * applying authRequiredMiddleware to routes flagged with needsAuth
   */
  private initializeRoutes(configs: any[]) {
    configs.forEach(config => {
      // Skip the webhook here as it's handled in initializeMiddlewares
      if (config.isWebhook) return;

      let routeInstance: Routes;
      if (config.routeClass) {
        routeInstance = new config.routeClass(); // Instantiate if it's a class config
      } else if (config.route) {
        routeInstance = config.route; // Use directly if it's an object instance
      } else {
        logger.warn('Invalid route configuration:', config);
        return;
      }

      const routePath = '/api' + (routeInstance.path || '/');
      const routeMiddlewares: express.RequestHandler[] = [];
      
      if (config.needsAuth) {
        routeMiddlewares.push(authRequiredMiddleware); // Add blocking auth if flag is true
      }
      
      this.app.use(routePath, ...routeMiddlewares, routeInstance.router);
      logger.info(`Mounted route: ${routePath} with needsAuth: ${!!config.needsAuth}`);
    });

    this.app.use('/api', (req, res, next) => {
      next(new HttpException(404, `API endpoint not found: ${req.method} ${req.originalUrl}`));
    });
  }

  /**
   * Swagger setup at /api-docs
   */
  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
        securitySchemes: {
          cookieAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'Authorization',
          },
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      apis: ['swagger.yaml'],
    };
    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  /**
   * Global error handler
   */
  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  /**
   * Connect to MongoDB via Mongoose
   */
  private async connectToDatabase() {
    if (this.env !== 'production') {
      set('debug', true);
    }

    try {
      await connect(dbConnection.url);
      logger.info('Database connected');
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      // In production, you might exit the process here
      // process.exit(1);
    }
  }
}

export default App;
