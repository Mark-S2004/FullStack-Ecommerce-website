//server/src/app.ts
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { connect, set, disconnect } from 'mongoose';
import swaggerJSDoc from 'swagger-ui-express';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import { dbConnection } from '@databases';
import { Routes } from '@interfaces/routes.interface'; // Assuming Routes interface is correct
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
// Updated import for routes
import routes from './routes/index'; // ⬅️ Import the array of route objects


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
    // Pass the array of imported route objects
    this.initializeRoutes(routes); // <- now it accepts the array directly
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
      logger.info('Disconnected from MongoDB'); // Use logger
    } catch (error) {
      console.error('Error closing database connection:', error);
       logger.error('Error closing database connection:', error); // Use logger
    }
  }

  public getServer() {
    return this.app;
  }

  private async connectToDatabase() {
    if (this.env !== 'production') {
      set('debug', true); // Enable Mongoose debugging in dev
    }
    try {
      await connect(dbConnection.url);
      logger.info('Connected to MongoDB');
    } catch (error) {
      logger.error(`Failed to connect to MongoDB: ${error}`);
      // Consider exiting the process if DB connection fails on startup
      // process.exit(1);
    }
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    // Configure CORS more strictly if needed in production
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    // Use Stripe webhook raw body parsing only for the webhook route
     this.app.use('/api/stripe', express.raw({ type: 'application/json' }), webhookRoute.router); // Handle webhook here first

    this.app.use(express.json()); // Parse JSON body for other routes
    this.app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body

    this.app.use(cookieParser());
    this.app.use(authMiddleware); // Auth middleware after body parsers
  }

  // Updated to accept an array of route objects
  private initializeRoutes(routes: { path?: string; router: Router }[]) {
    routes.forEach(route => {
      // Exclude the webhook route as it's handled separately for raw body
      if (route.path !== '/stripe') {
        this.app.use('/api', route.router);
      }
    });

     // Handle root route separately if needed, otherwise indexRoute might cover it
     // this.app.get('/', (req, res) => res.send('API is running'));
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        openapi: '3.0.0', // Use OpenAPI 3.0.0
        info: {
          title: 'E-commerce REST API', // Updated title
          version: '1.0.0',
          description: 'API documentation for the Full-Stack E-commerce project', // Updated description
        },
         servers: [
           { url: `/api`, description: 'Development server' }, // Base path for routes
         ],
         components: {
           securitySchemes: {
             bearerAuth: { // Define JWT scheme
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
             }
           }
         },
         security: [{
           bearerAuth: [] // Apply JWT globally or per route
         }],
      },
      apis: ['swagger.yaml', 'src/routes/*.ts', 'src/dtos/*.ts', 'src/models/*.ts'], // Point to route files and DTOs
    };
    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;