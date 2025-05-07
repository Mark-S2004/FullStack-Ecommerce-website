//server/src/routes/index.ts
import authRoute from './auth.route';
import usersRoute from './users.route';
import orderRoute from './order.route';
import webhookRoute from './webhook.route';
import ProductsRoute from './products.route';
import cartRoute from './cart.route';
import reviewsRoute from './reviews.route';

const routes = [
  authRoute,
  usersRoute,
  orderRoute,
  webhookRoute,
  new ProductsRoute(),
  cartRoute,
  reviewsRoute
];

export default routes;
