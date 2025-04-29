import IndexRoute from './index.route';
import cartRoute from './cart.route';
import productRoute from './product.route';
import authRoute from './auth.route';
import usersRoute from './users.route';
import orderRoute from './order.route';
import webhookRoute from './webhook.route';

const routes = [
  new IndexRoute(),
  cartRoute,
  productRoute,
  authRoute,
  usersRoute,
  orderRoute,
  webhookRoute,
];

export default routes;
