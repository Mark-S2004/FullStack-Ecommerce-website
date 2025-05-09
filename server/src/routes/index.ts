// server/src/routes/index.ts (Updated)
import authRoute from './auth.route';
import usersRoute from './users.route';
import orderRoute from './order.route';
import webhookRoute from './webhook.route';
import productsRoute from './products.route'; // This will be public for GET
import cartRoute from './cart.route';
import reviewsRoute from './reviews.route';
import { Routes } from '@interfaces/routes.interface';

// Define an array of route objects with their path, router, and authentication requirement
const routes: (Routes & { needsAuth?: boolean })[] = [
    // Routes that do NOT require authentication
    { path: authRoute.path, router: authRoute.router, needsAuth: false },
    { path: webhookRoute.path, router: webhookRoute.router, needsAuth: false },
    { path: productsRoute.path, router: productsRoute.router, needsAuth: false }, // Make products public

    // Routes that DO require authentication
    // Note: Specific methods within a router might still require auth if middleware is applied inside the router file
    // But applying authRequiredMiddleware here means *all* methods on this route need auth
    { path: usersRoute.path, router: usersRoute.router, needsAuth: true }, // Users (likely admin)
    { path: orderRoute.path, router: orderRoute.router, needsAuth: true }, // Orders (customer/admin)
    { path: cartRoute.path, router: cartRoute.router, needsAuth: true }, // Cart (customer)
    { path: reviewsRoute.path, router: reviewsRoute.router, needsAuth: true }, // Reviews (customer)
];

// Filter out the webhook route here as it's mounted separately in app.ts
export default routes.filter(route => route !== webhookRoute);