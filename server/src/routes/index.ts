//server/src/routes/index.ts
// Import route modules (assuming they export objects with { path, router })
// Ensure correct import style (default import)
import authRoute from './auth.route';
import usersRoute from './users.route';
import orderRoute from './order.route';
import webhookRoute from './webhook.route';
import productsRoute from './products.route'; // Import as default
import cartRoute from './cart.route';
import reviewsRoute from './reviews.route';

// Admin routes - assuming you create these files with similar object exports
// Ensure correct import style (default import)
import adminDashboardRoute from './admin/dashboard.route';
import adminProductsRoute from './admin/products.route';
import adminOrdersRoute from './admin/orders.route';
import adminDiscountsRoute from './admin/discounts.route';
import adminReviewsRoute from './admin/reviews.route';


const routes = [
  authRoute,
  usersRoute,
  orderRoute,
  webhookRoute,
  productsRoute, // Use the imported object directly
  cartRoute,
  reviewsRoute,
  // Add admin routes here
   adminDashboardRoute,
   adminProductsRoute,
   adminOrdersRoute,
   adminDiscountsRoute,
   adminReviewsRoute,
];

export default routes; // Export the array of route objects