import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material';
import { Product } from '../types/product';
import { useCart } from '../context/CartContext';
import StockStatus from './product/StockStatus';
import { showWarning, showSuccess } from './common/ToastContainer';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (product.stock <= 0) {
      showWarning('This product is out of stock');
      return;
    }
    
    // Add the product to cart with quantity 1
    addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      stock: product.stock
    }, 1);
    
    showSuccess(`${product.name} added to cart`);
  };

  return (
    <div className="group relative">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 group-hover:opacity-75">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover object-center lg:h-full lg:w-full"
        />
        
        {/* Stock status indicator - top right corner */}
        <div className="absolute top-2 right-2">
          <StockStatus stock={product.stock} showCount={false} />
        </div>
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            <Link to={`/products/${product._id}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-gray-500">{product.category}</p>
        </div>
        <p className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</p>
      </div>
      
      {/* Quick add button - appears on hover on desktop, always visible on mobile */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleQuickAdd}
          className={`w-full py-2 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            product.stock <= 0 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
          disabled={product.stock <= 0}
        >
          {product.stock <= 0 ? 'Out of Stock' : 'Quick Add'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 