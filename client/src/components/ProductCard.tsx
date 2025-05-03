import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl,
      qty: 1,
    });
  };

  const handleNavigate = () => {
    navigate(`/customer/products/${product.id}`);
  };

  return (
    <div 
      className="border p-4 rounded cursor-pointer hover:shadow-lg transition-shadow duration-200 flex flex-col h-full" 
      onClick={handleNavigate}
    >
      <img 
        src={product.imageUrl || 'https://via.placeholder.com/150?text=No+Image'}
        alt={product.name} 
        className="w-full h-48 object-contain mb-2"
      />
      <h2 className="text-lg font-semibold flex-grow">{product.name}</h2>
      <p className="text-gray-700 my-1">{product.price.toFixed(2)} EGP</p>
      <button 
        onClick={handleAddToCart} 
        className="mt-2 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;