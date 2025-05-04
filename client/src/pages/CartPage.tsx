import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Box, Grid, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, getTotal } = useCart();
  const navigate = useNavigate();

  const handleRemove = (id: string, size: string) => {
    removeFromCart(id, size);
  };

  const handleQuantityChange = (id: string, size: string, quantity: number) => {
    if (quantity > 0) {
      updateQuantity(id, size, quantity);
    }
  };

  const handleCheckout = () => {
    navigate('/customer/checkout');
  };

  if (cartItems.length === 0) {
    return <Typography variant="h6" align="center">Your cart is empty.</Typography>;
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>Shopping Cart</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Product</TableCell>
            <TableCell>Size</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cartItems.map((item) => (
            <TableRow key={`${item._id}-${item.size}`}>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.size}</TableCell>
              <TableCell>${item.price.toFixed(2)}</TableCell>
              <TableCell>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item._id, item.size, parseInt(e.target.value) || 1)}
                  min="1"
                  style={{ width: '60px' }}
                />
              </TableCell>
              <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
              <TableCell>
                <Button color="error" onClick={() => handleRemove(item._id, item.size)}>Remove</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Typography variant="h6" sx={{ mt: 2 }}>Total: ${getTotal().toFixed(2)}</Typography>
      <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={handleCheckout}>
        Proceed to Checkout
      </Button>
    </Box>
  );
};

export default CartPage; 