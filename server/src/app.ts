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
import HttpException from '@exceptions/HttpException';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import { dbConnection } from '@databases';
import { Routes } from '@interfaces/routes.interface';
import errorMiddleware from '@middlewares/error.middleware';
// Non-blocking auth (parses token but does not enforce)
import authMiddleware from '@middlewares/auth.middleware';
// Blocking auth (requires valid user)
import authRequiredMiddleware from '@middlewares/authRequired.middleware';
import { logger, stream } from '@utils/logger';
import allRoutes from '@routes/index';
// Import your Stripe webhook route directly for raw body handling
import { webhookRoute } from '@routes/index'; // <-- Adjust this import path as needed

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
    this.initializeRoutes(allRoutes);
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

    // Mount Stripe webhook BEFORE body parsing to capture raw body
    if (webhookRoute && webhookRoute.path && webhookRoute.router) {
      this.app.use('/api' + webhookRoute.path, webhookRoute.router);
    } else {
      console.warn('Webhook route not found or incorrectly defined, skipping.');
    }

    // Standard body parsers for JSON and URL-encoded
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Parse cookies and attach to req.cookies
    this.app.use(cookieParser());

    // Non-blocking auth: sets req.user if token valid, but does not reject
    this.app.use(authMiddleware);
  }

  /**
   * Mount application routes under /api,
   * applying authRequiredMiddleware to routes flagged with needsAuth
   */
  private initializeRoutes(routes: (Routes & { needsAuth?: boolean })[]) {
    routes.forEach(route => {
      const routeMiddlewares: express.RequestHandler[] = [];

      if (route.needsAuth) {
        routeMiddlewares.push(authRequiredMiddleware);
      }

      // Avoid re-mounting the webhook route
      if (route !== webhookRoute) {
        this.app.use('/api' + (route.path || '/'), ...routeMiddlewares, route.router);
      }
    });

    // 404 for unmatched /api routes
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
