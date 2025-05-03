import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductById } from '../api/products';
import { Box, Container, Typography, CircularProgress, Button, Paper, Grid, Chip } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

// Type matching the backend ProductModel
type Product = {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  gender: string;
  imageUrl: string;
  stock: number;
  sizes?: string[]; // Optional sizes array
};

const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading, isError, error } = useQuery<Product, Error>(
    ['product', id], 
    () => getProductById(id!),
    {
      enabled: !!id, // Only run query if ID exists
    }
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color="error" align="center">
          Error loading product details: {error?.message || 'Unknown error'}
        </Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h6" align="center">
          Product not found.
        </Typography>
      </Container>
    );
  }

  const handleAddToCart = () => {
    // TODO: Implement Add to Cart logic using CartContext
    console.log(`Adding product ${product.name} to cart`);
    // Example: cartContext.addItem({ id: product._id, name: product.name, price: product.price, quantity: 1 });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={4}>
          {/* Image Column */}
          <Grid item xs={12} md={6}>
            <Box 
              component="img"
              sx={{
                width: '100%',
                maxHeight: { xs: 300, md: 500 },
                objectFit: 'contain',
                borderRadius: 1, // Optional: adds rounded corners
              }}
              alt={product.name}
              src={product.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image'}
            />
          </Grid>

          {/* Details Column */}
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              {product.name}
            </Typography>
            <Typography variant="h5" color="primary" gutterBottom>
              ${product.price.toFixed(2)}
            </Typography>
            <Typography variant="body1" paragraph sx={{ mt: 2 }}>
              {product.description}
            </Typography>
            <Box sx={{ my: 2 }}>
              <Chip label={`Category: ${product.category}`} sx={{ mr: 1, mb: 1 }} />
              <Chip label={`Gender: ${product.gender}`} sx={{ mr: 1, mb: 1 }} />
              <Chip label={`Stock: ${product.stock > 0 ? product.stock : 'Out of Stock'}`} color={product.stock > 0 ? 'success' : 'error'} sx={{ mb: 1 }} />
            </Box>

            {/* Sizes (if available) */}
            {product.sizes && product.sizes.length > 0 && (
              <Box sx={{ my: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Available Sizes:</Typography>
                {product.sizes.map((size) => (
                  <Chip key={size} label={size} variant="outlined" sx={{ mr: 1, mb: 1 }} />
                ))}
              </Box>
            )}

            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<AddShoppingCartIcon />}
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              sx={{ mt: 3, width: { xs: '100%', sm: 'auto' } }} // Full width on small screens
            >
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProductDetailsPage; 