import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProducts } from '../api/products';
import axios from 'axios';
import {
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

// Type for Product matching the backend model
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: 'denim' | 'tshirt' | 'hoodie' | 'accessory';
  gender: 'male' | 'female' | 'unisex';
  sizes: string[];
  stock: number;
}

// Type for the form data
interface ProductFormData {
  name: string;
  description: string;
  price: number | string;
  imageUrl: string;
  category: string;
  gender: string;
  sizes: string;
  stock: number | string;
}

// Type for the data structure expected by the create mutation
type CreateProductInput = Omit<Product, '_id'>;

// Type for the data structure expected by the update mutation
type UpdateProductInput = Product;

const AdminInventoryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    category: '', // Default to empty or a valid enum value
    gender: '',   // Default to empty or a valid enum value
    sizes: '',
    stock: '',
  });

  const { data: products, isLoading, error } = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: () => fetchProducts('', '', ''), // Fetch all products initially
  });

  const createMutation = useMutation<Product, Error, CreateProductInput>({
    mutationFn: (newProduct) =>
      axios.post<{ data: Product }>('/api/admin/products', newProduct).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setOpenDialog(false);
      setFormData({ name: '', description: '', price: '', imageUrl: '', category: '', gender: '', sizes: '', stock: '' });
    },
    onError: (err) => {
      alert(`Failed to create product: ${err.message}`);
    }
  });

  const updateMutation = useMutation<Product, Error, UpdateProductInput>({
    mutationFn: (updatedProduct) =>
      axios.put<{ data: Product }>(`/api/admin/products/${editingProduct?._id}`, updatedProduct).then((res) => res.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setOpenDialog(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', imageUrl: '', category: '', gender: '', sizes: '', stock: '' });
    },
    onError: (err) => {
        alert(`Failed to update product: ${err.message}`);
      }
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id) => axios.delete(`/api/admin/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err) => {
        alert(`Failed to delete product: ${err.message}`);
      }
  });

  const handleOpenDialog = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        gender: product.gender,
        sizes: product.sizes.join(', '),
        stock: product.stock,
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', imageUrl: '', category: '', gender: '', sizes: '', stock: '' });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const name = target.name;
    const value = target.value;

    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Specific handler for MUI Select components
  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
      const name = e.target.name as keyof ProductFormData;
      const value = e.target.value as string;
      if (name) {
          setFormData((prev) => ({ ...prev, [name]: value }));
      }
  };

  const handleSubmit = () => {
    if (!formData.name || formData.price === '' || formData.stock === '' || !formData.sizes || !formData.category || !formData.gender) {
      alert('Please fill in all required fields (Name, Price, Stock, Sizes, Category, Gender).');
      return;
    }
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price as string),
      imageUrl: formData.imageUrl,
      category: formData.category as Product['category'], // Cast to enum type
      gender: formData.gender as Product['gender'],     // Cast to enum type
      sizes: formData.sizes.split(',').map((s) => s.trim()).filter((s) => s !== ''),
      stock: parseInt(formData.stock as string, 10),
    };

    if (isNaN(productData.price) || isNaN(productData.stock)) {
      alert('Price and Stock must be valid numbers.');
      return;
    }

    if (editingProduct) {
      updateMutation.mutate({ ...productData, _id: editingProduct._id });
    } else {
      createMutation.mutate(productData as CreateProductInput);
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">Error fetching products: {error.message}</Typography>;

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>Inventory Management</Typography>
      <Button variant="contained" color="primary" onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>
        Add Product
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Stock</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products && products.map((product: Product) => (
            <TableRow key={product._id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>${product.price.toFixed(2)}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{product.stock}</TableCell>
              <TableCell>
                <Button onClick={() => handleOpenDialog(product)} sx={{ mr: 1 }}>Edit</Button>
                <Button color="error" onClick={() => handleDelete(product._id)} disabled={deleteMutation.isLoading}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Name" name="name" value={formData.name} onChange={handleChange} required />
          <TextField fullWidth margin="dense" label="Description" name="description" value={formData.description} onChange={handleChange} multiline rows={3} />
          <TextField fullWidth margin="dense" label="Price" name="price" type="number" value={formData.price} onChange={handleChange} required inputProps={{ step: '0.01' }} />
          <TextField fullWidth margin="dense" label="Image URL" name="imageUrl" value={formData.imageUrl} onChange={handleChange} />
          <FormControl fullWidth margin="dense" required>
            <InputLabel>Category</InputLabel>
            <Select name="category" value={formData.category} label="Category" onChange={handleSelectChange as any}>
              <MenuItem value="denim">Denim</MenuItem>
              <MenuItem value="tshirt">T-Shirt</MenuItem>
              <MenuItem value="hoodie">Hoodie</MenuItem>
              <MenuItem value="accessory">Accessory</MenuItem>
            </Select>
          </FormControl>
           <FormControl fullWidth margin="dense" required>
            <InputLabel>Gender</InputLabel>
            <Select name="gender" value={formData.gender} label="Gender" onChange={handleSelectChange as any}>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="unisex">Unisex</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth margin="dense" label="Sizes (comma separated)" name="sizes" value={formData.sizes} onChange={handleChange} required />
          <TextField fullWidth margin="dense" label="Stock" name="stock" type="number" value={formData.stock} onChange={handleChange} required />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={createMutation.isLoading || updateMutation.isLoading}>{editingProduct ? 'Update' : 'Add'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminInventoryPage;