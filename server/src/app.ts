//server/src/app.ts
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Router } from 'express'; // Import Router from express
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { connect, set, disconnect } from 'mongoose';
import swaggerJSDoc from 'swagger-jsdoc';
// Correct import for swaggerUi
import * as swaggerUi from 'swagger-ui-express'; // Import as namespace

import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import { dbConnection } from '@databases';
import { Routes } from '@interfaces/routes.interface'; // Assuming Routes interface is correct
import errorMiddleware from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
// Updated import for routes array
import routes from './routes/index'; // ⬅️ Import the array of route objects
// Import auth middleware
import authMiddleware from './middlewares/auth.middleware';
// Import webhook route object
import webhookRoute from './routes/webhook.route';


class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor() {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.connectToDatabase(); // Call the method
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
     // Mount the webhook route with raw body parser specifically
     // This middleware should come before express.json() or express.urlencoded()
     if (webhookRoute?.path && webhookRoute?.router) {
        this.app.use(webhookRoute.path, express.raw({ type: 'application/json' }), webhookRoute.router);
     } else {
        logger.warn('Stripe webhook route is not defined or does not export path/router.');
     }


    this.app.use(express.json()); // Parse JSON body for other routes
    this.app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body

    this.app.use(cookieParser());
    // Mount auth middleware after cookie-parser and body parsers
    if (authMiddleware) { // Check if authMiddleware is imported correctly
        this.app.use(authMiddleware); // Auth middleware after body parsers
    } else {
         logger.error('Auth middleware is undefined.');
    }
  }

  // Updated to accept an array of route objects
  private initializeRoutes(routes: { path?: string; router: Router }[]) {
    routes.forEach(route => {
      // Exclude the webhook route as it's handled separately with raw body parser
      // Check if route is valid and not the webhook route
      if (route?.router && route?.path !== webhookRoute.path) {
        // If path is defined, use it. Otherwise, assume it should be mounted at /api
        this.app.use('/api', route.router);
      } else if (route?.router && !route?.path) {
         // Handle routes that don't define a specific path, mount them at /api
         this.app.use('/api', route.router);
      }
       // Log if a route seems invalid or missing router
       else if (!route?.router) {
            logger.warn(`Skipping invalid route entry: ${JSON.stringify(route)}`);
       }
    });

     // Handle root route separately if needed, otherwise indexRoute might cover it
     // this.app.get('/', (req, res) => res.send('API is running')); // This is handled by the client in the fullstack setup
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
       // Point to route files and DTOs - use glob patterns or explicit paths
      apis: ['swagger.yaml', 'src/routes/*.ts', 'src/routes/**/*.ts', 'src/dtos/*.ts', 'src/models/*.ts'],
    };
    const specs = swaggerJSDoc(options);
    // Correct swaggerUi usage
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;