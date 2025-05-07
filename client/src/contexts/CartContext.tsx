import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/axios';
import toast from 'react-hot-toast';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
  size: string;
}

interface CartTotal {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

interface CartContextType {
  items: CartItem[];
  total: CartTotal;
  isLoading: boolean;
  addItem: (productId: string, quantity: number, size: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState<CartTotal>({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const { data } = await api.get('/cart');
      setItems(data.items);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addItem = async (productId: string, quantity: number, size: string) => {
    try {
      await api.post('/cart', { productId, quantity, size });
      toast.success('Added to cart');
      fetchCart();
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      await api.patch(`/cart/${itemId}`, { quantity });
      fetchCart();
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await api.delete(`/cart/${itemId}`);
      toast.success('Item removed from cart');
      fetchCart();
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setItems([]);
      setTotal({
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
      });
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  const value = {
    items,
    total,
    isLoading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 