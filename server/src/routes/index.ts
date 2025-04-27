
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
<<<<<<< HEAD
=======
];
const routes = [
  authRoute,
  ProductRoute,
  new IndexRoute(),
  new OrderRoute(),
>>>>>>> f13b33164e3385d01bcf949bf458c831ae0d5f28
];

export default routes;
