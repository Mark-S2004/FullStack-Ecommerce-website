// server/src/routes/index.ts
import { Routes } from '@interfaces/routes.interface';

// Import the route configuration objects directly
// import indexRouteConfig from './index.route'; // Removed, as it likely doesn't exist
import authRouteConfig from './auth.route';
import usersRouteConfig from './users.route';
import productRouteConfig from './products.route';
import orderRouteConfig from './order.route';
import cartRouteConfig from './cart.route';
import reviewRouteConfig from './review.route'; // Admin review route
import reviewsRouteConfig from './reviews.route'; // Customer review route (likely POST under products)
import webhookRouteConfig from './webhook.route';
import discountRouteConfig from './discount.route'; // Import discount route

// Define the array of routes for generic mounting in app.ts
const routes: (Routes & { needsAuth?: boolean })[] = [
  // Public routes
  // { ...indexRouteConfig, needsAuth: false }, // Removed
  { ...authRouteConfig, needsAuth: false },
  { ...productRouteConfig, needsAuth: false }, // GET is public, others need checks internally
  { ...webhookRouteConfig, needsAuth: false }, // Special handling in app.ts

  // Authenticated routes
  { ...usersRouteConfig, needsAuth: true }, // Admin check likely internal
  { ...orderRouteConfig, needsAuth: true },
  { ...cartRouteConfig, needsAuth: true },
  { ...reviewsRouteConfig, needsAuth: true }, // Customer POST review
  { ...reviewRouteConfig, needsAuth: true }, // Admin GET/DELETE reviews (admin check internal)
  { ...discountRouteConfig, needsAuth: true }, // Admin discount routes (admin check internal)
];

// Filter out the webhook route as it's mounted separately in app.ts
const filteredRoutes = routes.filter(route => route.path !== webhookRouteConfig.path);

// Default export contains all routes EXCEPT the webhook route
export default filteredRoutes;

// Export the webhook route config object for app.ts special handling
export const webhookRoute = webhookRouteConfig;

// NOTE: Ensure app.ts uses `import routes from '@routes/index'` for the main array
// and `import { webhookRoute } from '@routes/index'` for the webhook.
// The check in app.ts should be against `webhookRoute`.