import authRoute from './auth.route';
import ProductRoute from './product.route';
import IndexRoute from './index.route';
import OrderRoute from './order.route';

const routes = [
  authRoute,
  ProductRoute,
  new IndexRoute(),
  new OrderRoute(),
];

export default routes;