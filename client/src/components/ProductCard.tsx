import { useCart } from '../contexts/CartContext';

type Product = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();

  return (
    <div className="border p-4 rounded">
      <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
      <h2>{product.name}</h2>
      <p>{product.price} EGP</p>
      <button onClick={() => addToCart(product, 1)}>Add to Cart</button>
    </div>
  );
};

export default ProductCard;
