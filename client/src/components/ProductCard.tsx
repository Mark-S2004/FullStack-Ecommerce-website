import { useCart } from '../context/CartContext';

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl, // mapping image correctly
      qty: 1,                  // always adding 1 initially
    });
  };

  return (
    <div className="border p-4 rounded">
      <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
      <h2>{product.name}</h2>
      <p>{product.price} EGP</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
};

export default ProductCard;