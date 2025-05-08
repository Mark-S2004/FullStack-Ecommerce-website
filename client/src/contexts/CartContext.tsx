// client/src/contexts/CartContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
// Correct import for Product interface (using the client-side definition now)
import { Product } from '@/types/product.types'
import { useAuth } from './AuthContext';
// Removed unused import
// import { CartTotal } from '../contexts/CartContext'; // This was the original error, already fixed

// --- Define Interfaces (EXPORTED) ---
// Interface for a cart item after the product reference has been populated AND serialized
// This should represent the plain JavaScript object received by the client
// REMOVED `extends Document` because the client receives plain objects, not Mongoose Documents.
export interface PopulatedCartItem {
  _id: string; // Subdocument ID string (frontend uses string)
  product: Product; // Populated Product object (as a plain object)
  quantity: number;
  size?: string; // Optional size
  price: number; // Price stored in the cart item (price at time of add)
}

export interface CartTotals { // This interface needs to be EXPORTED
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

// Define the Context Type (EXPORTED)
export interface CartContextType { // This interface needs to be EXPORTED
  items: PopulatedCartItem[]; // Use the populated interface
  total: CartTotals;
  isLoading: boolean;
  addItem: (productId: string, quantity: number, size: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>; // Added clearCart to type
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize with the populated interface type
  const [items, setItems] = useState<PopulatedCartItem[]>([]);
  const [total, setTotal] = useState<CartTotals>({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

   // Import useAuth hook here inside the component
   const { user } = useAuth();

  // Define the structure expected from the API response for getCart
  interface ApiCartResponse {
      data: {
          items: PopulatedCartItem[]; // Use the plain object interface here
          total: CartTotals;
      };
      message?: string; // Assuming message is also in the response
  }


  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      // Only fetch cart if user is logged in
      if (token && user) { // Explicitly check for user existence too
        // Expect the backend to return { data: { items: [...], total: { ... } }, message: '...' }
        // Corrected type annotation for axios response
        const { data: responseData } = await api.get<ApiCartResponse>('/cart'); // Expect the specified data structure
        // Map backend items (with string _id from response) to frontend PopulatedCartItem (which expects string _id)
        setItems(responseData.data?.items || []); // Access data.data.items with optional chaining
        setTotal(responseData.data?.total || { // Access data.data.total
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


  // Updated addItem signature
  const addItem = async (productId: string, quantity: number, size: string) => {
    try {
      // Backend now expects size and quantity
      // Backend is expected to return the *updated* cart and totals.
      // The fetchCart call after the API call will get the latest state.
      // No need to await api.post here if fetchCart is called right after.
      // Await the post to catch backend errors before refetching
      await api.post('/cart', { productId, quantity, size }); // Pass quantity and size
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
       // Ensure quantity is a valid number
       if (typeof quantity !== 'number' || !Number.isInteger(quantity) || quantity < 1) {
           console.error('Invalid quantity provided:', quantity);
           toast.error('Invalid quantity');
           return; // Exit early if quantity is invalid
       }
       // Backend expects item ID in path and new quantity in body
       // Backend is expected to return the *updated* cart and totals.
       // The fetchCart call after the API call will get the latest state.
      await api.put(`/cart/${itemId}`, { quantity }); // Use PUT and item ID in path, pass quantity in body
      // No toast success here, as the fetch will update the UI and it might look janky
      fetchCart(); // Refetch to update UI
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update quantity');
       console.error("Update quantity error:", error);
       // Optionally refetch cart on error to revert UI to server state
       // fetchCart();
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
       // Optionally refetch cart on error to revert UI to server state
       // fetchCart();
    }
  };

   // clearCart implementation
  const clearCart = async () => {
    try {
      // Assuming backend has a DELETE /cart route for clearing
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