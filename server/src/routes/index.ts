
import IndexRoute from './index.route';
import OrderRoute from './order.route';
import ProductRoute from './product.route';
import CartRoute from './cart.route';
import AuthRoute from './auth.route'; // if you have it too

const routes = [
  new IndexRoute(),
  new OrderRoute(),
  new ProductRoute(),
  new CartRoute(),
  new AuthRoute(), // optional, only if you have auth.routes.ts
];

export default routes;
