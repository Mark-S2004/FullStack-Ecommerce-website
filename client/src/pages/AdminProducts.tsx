import { useState, useEffect } from 'react';
import { fetchProducts, deleteProduct } from '../api/products';
import ProductForm from '../components/ProductForm';

type Product = {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  gender: string;
  imageUrl: string;
  stock: number;
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  const handleDelete = (id: string) => {
    deleteProduct(id).then(() => {
      setProducts(products.filter((p) => p._id !== id));
    });
  };

  const handleFormSubmit = (data: Omit<Product, '_id'>) => {
    console.log('Form submitted:', data);
    // Add logic to create or update a product
  };

  return (
    <div>
      <h1>Admin: Products</h1>
      <ProductForm onSubmit={handleFormSubmit} />
      <ul>
        {products.map((product) => (
          <li key={product._id}>
            {product.name} - {product.price} EGP
            <button onClick={() => handleDelete(product._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminProducts;
