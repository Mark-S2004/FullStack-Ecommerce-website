import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
// Correct import for Product interface
import { Product } from '@/pages/HomePage'; // Assuming Product is exported directly from HomePage

// Import useAuth hook
import { useAuth } from './AuthContext';
// Import clsx (although not used in this specific file, might be needed by the bundler/linter)
import clsx from 'clsx';


interface CartItem {
  _id: string; // Item ID (Mongoose subdocument ID)
  // Refined product type to match what the backend *should* populate
  product: {
      _id: string;
      name: string;
      price: number;
      images: string[];
      // Add other properties like size, colors if needed client-side
  };
  quantity: number;
  size?: string; // Optional size
}

interface CartTotal {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

interface CartResponse {
    items: CartItem[];
    total: CartTotal;
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

   // Import useAuth hook here inside the component
   const { user } = useAuth();


  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      // Only fetch cart if user is logged in
      if (token && user) { // Explicitly check for user existence too
        // Expect the backend to return { data: { items: [...], total: { ... } }, message: '...' }
        const { data } = await api.get('/cart');
        setItems(data.data?.items || []); // Access data.data.items with optional chaining
        setTotal(data.data?.total || { // Access data.data.total
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0,
        });
      } else {
        // Reset cart for non-authenticated users
        setItems([]);
        setTotal({
          subtotal: 0,
          tax: 0,
          shipping: 0,
          total: 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      // Reset cart on error or failed auth
      setItems([]);
      setTotal({
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
      });
       // If it's a 401, the axios interceptor will handle the redirect, so no need to toast here
       // Correct the comparison logic: Check if error.response.status exists and is not 401
      if ((error as any)?.response?.status && (error as any).response.status !== 401) {
         toast.error('Failed to load cart');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
   // Fetch cart when user changes (login/logout) or on initial load if user is already logged in
    fetchCart();
   }, [user?._id]); // Dependency array: refetch when user ID changes


  const addItem = async (productId: string, quantity: number, size: string) => {
    try {
      // Backend now expects size
      // Backend is expected to return the *updated* cart and totals.
      // The fetchCart call after the API call will get the latest state.
      // No need to await api.post here if fetchCart is called right after.
      // Await the post to catch backend errors before refetching
      await api.post('/cart', { productId, quantity, size });
      toast.success('Added to cart');
      fetchCart(); // Refetch to update UI
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to add item to cart');
       console.error("Add item error:", error);
    }
  };

  // Updated updateQuantity to use itemId (Mongoose subdocument ID)
  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
       // Backend expects item ID in path and new quantity in body
      await api.put(`/cart/${itemId}`, { quantity }); // Use PUT and item ID in path
      // No toast success here, as the fetch will update the UI and it might look janky
      fetchCart(); // Refetch to update UI
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update quantity');
       console.error("Update quantity error:", error);
    }
  };

  // Updated removeItem to use itemId (Mongoose subdocument ID)
  const removeItem = async (itemId: string) => {
    try {
       // Backend expects item ID in params
      await api.delete(`/cart/${itemId}`); // Use DELETE and item ID in path
      toast.success('Item removed from cart');
      fetchCart(); // Refetch to update UI
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to remove item');
       console.error("Remove item error:", error);
    }
  };

   // clearCart implementation
  const clearCart = async () => {
    try {
      await api.delete('/cart'); // Backend endpoint to clear cart
      setItems([]); // Clear client state immediately
      setTotal({ subtotal: 0, tax: 0, shipping: 0, total: 0 }); // Reset totals immediately
      toast.success('Cart cleared');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to clear cart');
       console.error("Clear cart error:", error);
      // Optionally refetch cart state from server on error
      // fetchCart();
    }
  };


  const value = {
    items,
    total, // Include total in context value
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