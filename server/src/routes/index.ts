// server/src/routes/index.ts (Updated)
import authRoute from './auth.route';
import usersRoute from './users.route';
import orderRoute from './order.route';
import webhookRoute from './webhook.route';
import { ProductRoute } from './product.route'; // Exporting the class
import cartRoute from './cart.route';
import reviewsRoute from './reviews.route';
import { Routes } from '@interfaces/routes.interface';

// Define an array of route configurations or direct route objects
// For classes like ProductRoute, we export the class itself or a factory.
// For simple routes (objects with path & router), we use them directly.

const routeConfigs = [
    // Routes that do NOT require authentication
    { route: authRoute, needsAuth: false },
    { route: webhookRoute, needsAuth: false, isWebhook: true }, // Mark webhook for separate handling
    { routeClass: ProductRoute, needsAuth: false }, // Exporting class for instantiation in app.ts

    // Routes that DO require authentication
    // Note: Specific methods within a router might still require auth if middleware is applied inside the router file
    // But applying authRequiredMiddleware here means *all* methods on this route need auth
    { route: usersRoute, needsAuth: true }, // Users (likely admin)
    { route: orderRoute, needsAuth: true }, // Orders (customer/admin)
    { route: cartRoute, needsAuth: true }, // Cart (customer)
    { route: reviewsRoute, needsAuth: true }, // Reviews (customer)
];

export default routeConfigs;