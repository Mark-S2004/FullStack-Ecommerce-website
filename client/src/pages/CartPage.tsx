import { useCart } from '../context/CartContext';
import { Box, Container, Typography, Button, IconButton, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (productId: string, change: number) => {
    const item = cartItems.find(item => item.id === productId);
    if (item) {
      const newQuantity = item.qty + change;
      if (newQuantity > 0) {
        updateQuantity(productId, newQuantity);
      }
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.qty), 0);
  };

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box textAlign="center">
          <Typography variant="h5" gutterBottom>
            Your cart is empty
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/customer/products')}
          >
            Continue Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: '1 1 auto', width: { xs: '100%', md: '66.666%' } }}>
          {cartItems.map((item) => (
            <Box key={item.id} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center' }}>
                <Box sx={{ flex: '0 0 auto', width: { xs: '100%', sm: '25%' } }}>
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </Box>
                <Box sx={{ flex: '0 0 auto', width: { xs: '100%', sm: '25%' } }}>
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography color="textSecondary">${item.price}</Typography>
                </Box>
                <Box sx={{ flex: '0 0 auto', width: { xs: '100%', sm: '25%' }, display: 'flex', alignItems: 'center' }}>
                  <Box display="flex" alignItems="center">
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(item.id, -1)}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ mx: 2 }}>{item.qty}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityChange(item.id, 1)}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Box sx={{ flex: '0 0 auto', width: { xs: '100%', sm: '25%' }, textAlign: 'right' }}>
                  <Typography variant="h6">
                    ${(item.price * item.qty).toFixed(2)}
                  </Typography>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))}
        </Box>
        
        <Box sx={{ flex: '0 0 auto', width: { xs: '100%', md: '33.333%' } }}>
          <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography>
                Subtotal: ${calculateTotal().toFixed(2)}
              </Typography>
              <Typography>
                Shipping: $0.00
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                Total: ${calculateTotal().toFixed(2)}
              </Typography>
            </Box>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => navigate('/customer/checkout')}
            >
              Proceed to Checkout
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default CartPage; 