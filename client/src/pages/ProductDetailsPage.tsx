import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductById } from '../api/products';
import { useCart } from '../context/CartContext';
import { Typography, Button, CircularProgress, Box, Grid, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = React.useState('');

  const { data: product, isLoading, error } = useQuery(
    ['product', id],
    () => getProductById(id || ''),
    { enabled: !!id }
  );

  const handleAddToCart = () => {
    if (product && selectedSize) {
      addToCart({ ...product, size: selectedSize, quantity: 1 });
      alert('Added to cart!');
    } else {
      alert('Please select a size.');
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Error fetching product: {(error as Error).message}</Typography>;
  if (!product) return <Typography>Product not found.</Typography>;

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <img src={product.imageUrl} alt={product.name} style={{ width: '100%', maxHeight: '500px', objectFit: 'cover' }} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" gutterBottom>{product.name}</Typography>
          <Typography variant="h6" color="text.secondary">${product.price.toFixed(2)}</Typography>
          <Typography variant="body1" paragraph>{product.description}</Typography>
          <Typography variant="body2">Category: {product.category}</Typography>
          <Typography variant="body2">Gender: {product.gender}</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Size</InputLabel>
            <Select value={selectedSize} onChange={(e) => setSelectedSize(e.target.value as string)}>
              <MenuItem value="">Select Size</MenuItem>
              {product.sizes.map((size: string) => (
                <MenuItem key={size} value={size}>{size}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleAddToCart}>
            Add to Cart
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetailsPage; 