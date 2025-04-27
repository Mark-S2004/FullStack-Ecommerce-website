import { useCart } from '../src/CartContext'; // Ensure this path is correct
import { useNavigate } from 'react-router-dom'; // Ensure react-router-dom is installed

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

const CartPage = () => {
  const { items, updateQty, removeFromCart } = useCart();
  const navigate = useNavigate();

  // Ensure TypeScript knows `items` is an array of `CartItem`
  const subtotal = items.reduce((sum: number, i: CartItem) => sum + i.price * i.qty, 0);

  const formattedSubtotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(subtotal);

  return (
    <div>
      <h1>Shopping Cart</h1>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        items.map((item: CartItem) => (
          <div key={item.id}>
            <span>{item.name} x </span>
            <input
              type="number"
              value={item.qty}
              min="1"
              onChange={(e) => updateQty(item.id, parseInt(e.target.value, 10))}
              aria-label={`Update quantity for ${item.name}`}
            />
            <button
              onClick={() => removeFromCart(item.id)}
              aria-label={`Remove ${item.name} from cart`}
            >
              Remove
            </button>
          </div>
        ))
      )}
      <div>Subtotal: {formattedSubtotal}</div>
      <button onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
    </div>
  );
};

export default CartPage;