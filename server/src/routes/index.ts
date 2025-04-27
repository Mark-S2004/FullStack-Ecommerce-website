
import IndexRoute from './index.route';
import OrderRoute from './order.route';
import ProductRoute from './product.route';
import CartRoute from './cart.route';
import AuthRoute from './auth.route'; // if you have it too
import authRoute from './auth.route';
import ProductRoute from './product.route';
import IndexRoute from './index.route';
import OrderRoute from './order.route';

const routes = [
  new IndexRoute(),
  new OrderRoute(),
  new ProductRoute(),
  new CartRoute(),
  new AuthRoute(), // optional, only if you have auth.routes.ts
];
const routes = [
  authRoute,
  ProductRoute,
  new IndexRoute(),
  new OrderRoute(),
];

export default routes;