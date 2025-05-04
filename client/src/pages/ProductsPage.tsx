import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { fetchProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import { Grid, TextField, MenuItem, Select, FormControl, InputLabel, CircularProgress, Typography, Box } from '@mui/material';

// Define Product type based on backend model
interface Product {
  _id: string;
  imageUrl: string;
  name: string;
  price: number;
}

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [gender, setGender] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timerId);
  }, [search]);

  // Corrected useQuery syntax
  const { data: products, isLoading, error } = useQuery<Product[], Error>({
    queryKey: ['products', debouncedSearch, category, gender],
    queryFn: () => fetchProducts(debouncedSearch, category, gender),
  });

  const handleCardClick = (id: string) => {
    navigate(`/customer/products/${id}`);
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Error fetching products: {error.message}</Typography>;

  return (
    <Box sx={{ padding: 2 }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
            <TextField
                label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
            />
        </Grid>
        <Grid item xs={12} md={4}>
             <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select value={category} label="Category" onChange={(e) => setCategory(e.target.value as string)}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="denim">Denim</MenuItem>
                  <MenuItem value="tshirt">T-Shirt</MenuItem>
                  <MenuItem value="hoodie">Hoodie</MenuItem>
                  <MenuItem value="accessory">Accessory</MenuItem>
                </Select>
              </FormControl>
        </Grid>
         <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Gender</InputLabel>
                <Select value={gender} label="Gender" onChange={(e) => setGender(e.target.value as string)}>
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="unisex">Unisex</MenuItem>
                </Select>
              </FormControl>
        </Grid>
      </Grid>
      
      {(!products || products.length === 0) ? (
        <Typography>No products found.</Typography>
      ) : (
         <Grid container spacing={3}>
            {products.map((product: Product) => (
              <Grid item key={product._id} xs={12} sm={6} md={4} lg={3}>
                {/* Pass the whole product object to ProductCard */}
                <ProductCard product={product} /> 
              </Grid>
            ))}
          </Grid>
      )}
    </Box>
  );
};

export default ProductsPage; 