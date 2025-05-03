import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import useDebounce from '../hooks/useDebounce';
import { Box, Container, TextField, Typography, InputAdornment, IconButton, CircularProgress, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { data: products = [], isLoading, error } = useQuery<ProductModel[]>({
    queryKey: ['products', debouncedSearchTerm, category, gender],
    queryFn: () => fetchProducts(debouncedSearchTerm, category, gender),
  });

  const displayProducts: ProductCardType[] = products.map(product => ({
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

  const handleCategoryChange = (event: any) => {
    setCategory(event.target.value as string);
  };

  const handleGenderChange = (event: any) => {
    setGender(event.target.value as string);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <TextField
          sx={{ flexGrow: 1 }}
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
        />
        <FormControl sx={{ minWidth: { xs: '100%', sm: '120px' } }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            onChange={handleCategoryChange}
            label="Category"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Footwear">Footwear</MenuItem>
            <MenuItem value="Accessories">Accessories</MenuItem>
            <MenuItem value="Clothing">Clothing</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: { xs: '100%', sm: '120px' } }}>
          <InputLabel>Gender</InputLabel>
          <Select
            value={gender}
            onChange={handleGenderChange}
            label="Gender"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Unisex">Unisex</MenuItem>
          </Select>
        </FormControl>
      </Box>

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

      {!isLoading && products.length === 0 && !error && (
        <Typography variant="h6" align="center" sx={{ my: 4 }}>
          No products found matching your criteria.
        </Typography>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
        {displayProducts.map((product) => (
          <Box key={product.id}>
            <ProductCard product={product} />
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default ProductsPage; 