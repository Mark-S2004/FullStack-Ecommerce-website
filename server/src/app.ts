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
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS, DB_URI } from './config';
import { Routes } from './interfaces/routes.interface';
import errorMiddleware from './middlewares/error.middleware';
import { logger, stream } from './utils/logger';
import routes from './routes/index';
import adminRoute from './routes/admin.route';

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
    this.initializeRoutes(routes);
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

  private async connectToDatabase() {
    if (this.env !== 'production') {
      set('debug', true);
    }
    if (!DB_URI) {
        throw new Error('DB_URI environment variable is not set.');
    }
    await connect(DB_URI);
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT || 'dev', { stream }));
    this.app.use(cors({ origin: ORIGIN || true, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routeModules: Routes[]) {
    routeModules.forEach(route => {
        if (route.router) {
             this.app.use('/api', route.router);
        }
    });
    this.app.use('/api/admin', adminRoute);
  }

  private initializeSwagger() {
    try {
        const options = {
          swaggerDefinition: {
            info: {
              title: 'REST API',
              version: '1.0.0',
              description: 'Example docs',
            },
          },
          apis: ['swagger.yaml'],
        };
        const specs = swaggerJSDoc(options);
        this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
    } catch (err) {
        logger.error('Failed to initialize Swagger: ', err);
    }
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
