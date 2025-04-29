import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import useDebounce from '../hooks/useDebounce';
import { Box, Container, TextField, Typography, InputAdornment, IconButton, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

// Backend model type
type ProductModel = {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  gender: string;
  imageUrl: string;
  stock: number;
};

// Frontend product type expected by ProductCard
type ProductCardType = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};

const ProductList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data = [], isLoading, error } = useQuery<ProductModel[]>({
    queryKey: ['products', debouncedSearchTerm],
    queryFn: () => fetchProducts(debouncedSearchTerm),
  });

  // Map backend model to frontend type expected by ProductCard
  const products: ProductCardType[] = data.map(product => ({
    id: product._id,
    name: product.name,
    price: product.price,
    imageUrl: product.imageUrl
  }));

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 4 }}
        />

        {isLoading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" align="center">
            Error loading products. Please try again.
          </Typography>
        )}

        {!isLoading && products.length === 0 && (
          <Typography variant="h6" align="center" sx={{ my: 4 }}>
            No products found. Try a different search term.
          </Typography>
        )}

        <Box className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default ProductList;
