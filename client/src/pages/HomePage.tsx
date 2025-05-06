import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Product type definition
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: { url: string }[];
  category: string;
  stock: number;
}

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/products');
        
        if (data.success) {
          setProducts(data.products);
        } else {
          setError('Failed to fetch products');
        }
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.response?.data?.message || 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(
      {
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0]?.url || 'https://via.placeholder.com/300',
        stock: product.stock
      },
      1
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg p-8 mb-10">
        <h1 className="text-4xl font-bold mb-4">Welcome to Our E-Commerce Store</h1>
        <p className="text-xl mb-6">Discover amazing products at unbeatable prices</p>
        
        {isAuthenticated ? (
          <div className="mb-4">
            <p>Welcome back, {user?.name}!</p>
          </div>
        ) : (
          <div className="flex space-x-4">
            <Link 
              to="/login" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-2 rounded-md font-semibold transition duration-300"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-transparent border border-white text-white hover:bg-white hover:text-blue-600 px-6 py-2 rounded-md font-semibold transition duration-300"
            >
              Register
            </Link>
          </div>
        )}
      </div>
      
      {/* Products section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Featured Products</h2>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-600">
            No products available at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="w-full h-64 overflow-hidden">
                  <img 
                    src={product.images[0]?.url || 'https://via.placeholder.com/300'} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
                    <div className="flex space-x-2">
                      <Link 
                        to={`/products/${product._id}`}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm font-medium"
                      >
                        Details
                      </Link>
                      {product.stock > 0 ? (
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium"
                        >
                          Add to Cart
                        </button>
                      ) : (
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm font-medium">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage; 