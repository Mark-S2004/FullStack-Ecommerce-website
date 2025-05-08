import { useNavigate } from 'react-router-dom';
// Correct useQuery import for v4/v5
import { useQuery, useMutation, UseQueryResult, UseMutationResult, QueryClient, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import clsx from 'clsx'; // Import clsx

const shippingSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'), // Basic phone validation
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'), // Use more general term
  postalCode: z.string().min(3, 'Postal code is required'), // Basic validation, adjust min length as needed
  country: z.string().min(1, 'Country is required'),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

// Define interfaces matching backend response for Cart
interface CartItem {
  _id: string; // Item ID
  product: {
    _id: string; // Product ID
    name: string;
    price: number;
    images: string[];
  };
  quantity: number; // Qty is now 'quantity' in client context
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

export default function CheckoutPage(): JSX.Element { // Added return type annotation
  const navigate = useNavigate();
   const queryClient = useQueryClient(); // Get query client for invalidation

  const {
    register,
    handleSubmit,
    formState: { errors },
     setError // Import setError to set specific errors - Keeping this import even if not used directly, might be intended
  } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
  });

   // Fetch cart data using React Query
   // Correct the type parameter to match the expected data structure { data: { items: [], total: {} } }
   // Remove invalid options `cacheTime` and `keepPreviousData`
   // Access data correctly from response -> response.data.data
  const { data: cartResponse, isLoading: isLoadingCart, isError: isCartError, error: cartError } = useQuery<{ data: CartResponse }>({ // Expecting { data: { items: [], total: {} } }
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await api.get('/cart');
       // Access data.data as per backend structure
        if (!data || !data.data) {
             throw new Error("Invalid data format for cart from API");
        }
      return data; // Return the full response data object
    },
     staleTime: 1000 * 60 * 5, // Use global default or set specifically
  });

   // Access cart data safely
   const cart = cartResponse?.data;


  const placeOrderMutation = useMutation({
    mutationFn: async (shippingData: ShippingFormData) => {
       // Backend expects shippingAddress object in the request body
      const { data } = await api.post('/orders', {
        shippingAddress: shippingData,
      });
      return data; // Backend returns { orderId, sessionUrl, message }
    },
    onSuccess: (data) => {
      toast.success('Order placed successfully! Redirecting to payment...');
      // Invalidate cart query to clear cart state on client after order
       queryClient.invalidateQueries({ queryKey: ['cart'] });
       // Redirect to Stripe checkout session URL
       if (data.sessionUrl) {
           // Use window.location.replace to prevent the user from navigating back to checkout with an empty cart
           window.location.replace(data.sessionUrl);
       } else {
            // Handle case where sessionUrl is missing (shouldn't happen if backend is correct)
           console.error('Stripe session URL missing from backend response');
           toast.error('Payment failed, please try again. No session URL received.');
           // Optionally navigate to profile page to see if order was created with Pending status
           // navigate('/profile');
       }
    },
    onError: (error: any) => {
       console.error('Place Order Error:', error); // Log the error
       const errorMessage = error?.response?.data?.message || 'Failed to place order';
      toast.error(errorMessage);
      // Invalidate cart state on error in case of stock issues etc.
      queryClient.invalidateQueries({ queryKey: ['cart'] });
       // Optionally set form error if the error is related to validation/data
       // setError('root.serverError', { message: errorMessage });
    },
  });

  const onSubmit = (data: ShippingFormData) => {
     // Check if cart is empty before attempting to place order
     if (!cart || !cart.items || cart.items.length === 0) { // Added safety check for cart.items
         toast.error('Your cart is empty.');
         navigate('/cart', { replace: true }); // Redirect back to cart and replace history entry
         return;
     }
     // Trigger the mutation
    placeOrderMutation.mutate(data);
  };

  if (isLoadingCart) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // Redirect if cart is empty after loading or if there was an error loading cart
  if (!cart || !cart.items || cart.items.length === 0) { // Added safety check for cart.items
    // Only redirect if there wasn't a specific cart loading error that we want to display
    if (!isCartError) {
       // Use navigate replace to avoid loop if user hits back
       navigate('/cart', { replace: true });
    } else {
      // Handle cart error case - maybe show an error message instead of just redirecting
      return (
         <div className="grid min-h-screen place-items-center px-4 py-16">
            <div className="text-center text-red-600">
                Error loading cart: {cartError instanceof Error ? cartError.message : 'Unknown error'}
            </div>
            <button
              className="mt-6 inline-block rounded-md bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-500"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['cart'] })} // Retry fetching cart
            >
               Reload Cart
            </button>
         </div>
      );
    }
    return null; // Don't render anything while redirecting or showing error
  }

  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Checkout</h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16"
        >
          <div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">Shipping information</h2>

              <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="firstName"
                      {...register('firstName')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="lastName"
                      {...register('lastName')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      type="email"
                      id="email"
                      {...register('email')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <div className="mt-1">
                    <input
                      type="tel"
                      id="phone"
                      {...register('phone')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="address"
                      {...register('address')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="city"
                      {...register('city')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                    State / Province
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="state"
                      {...register('state')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
                    Postal code
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="postalCode"
                      {...register('postalCode')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.postalCode.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <div className="mt-1">
                    <select
                      id="country"
                      {...register('country')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="">Select a country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="MX">Mexico</option>
                       {/* Add more countries as needed */}
                    </select>
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div className="mt-10 lg:mt-0">
            <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

            <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
              <h3 className="sr-only">Items in your cart</h3>
              <ul role="list" className="divide-y divide-gray-200">
                {cart.items.map((item: CartItem) => ( // Added type annotation for item
                   // Use item._id as the key for consistency with cart page and potential future updates
                  <li key={item._id} className="flex px-4 py-6 sm:px-6">
                    <div className="flex-shrink-0">
                      <img
                        src={item.product?.images?.[0]} // Use optional chaining
                        alt={item.product?.name || 'Product Image'}
                        className="w-20 rounded-md object-cover object-center"
                      />
                    </div>

                    <div className="ml-6 flex flex-1 flex-col">
                      <div className="flex">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm">
                            <span className="font-medium text-gray-700 hover:text-gray-800">
                              {item.product?.name}
                            </span>
                          </h4>
                           {item.size && (
                             <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>
                           )}
                        </div>
                      </div>

                      <div className="flex flex-1 items-end justify-between pt-2">
                        <p className="mt-1 text-sm font-medium text-gray-900">
                           ${item.product?.price?.toFixed(2) || '0.00'}
                        </p>

                        <div className="ml-4">
                          <label className="sr-only">Quantity</label>
                           {/* Display quantity as text here, editing happens in cart */}
                          <span className="text-gray-500">Qty {item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

               {/* Use totals from cart data */}
              <dl className="space-y-6 border-t border-gray-200 px-4 py-6 sm:px-6">
                <div className="flex items-center justify-between">
                  <dt className="text-sm">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">${cart.total?.subtotal?.toFixed(2) || '0.00'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm">Shipping</dt>
                  <dd className="text-sm font-medium text-gray-900">${cart.total?.shipping?.toFixed(2) || '0.00'}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-sm">Taxes</dt>
                  <dd className="text-sm font-medium text-gray-900">${cart.total?.tax?.toFixed(2) || '0.00'}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                  <dt className="text-base font-medium">Total</dt>
                  <dd className="text-base font-medium text-gray-900">${cart.total?.total?.toFixed(2) || '0.00'}</dd>
                </div>
              </dl>

              <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                <button
                  type="submit"
                  disabled={placeOrderMutation.isPending || !cart || !cart.items || cart.items.length === 0} // Disable if mutation is pending or cart is empty
                  className={clsx(
                    "w-full rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                    {
                        "opacity-50 cursor-not-allowed": placeOrderMutation.isPending || !cart || !cart.items || cart.items.length === 0,
                    }
                   )}
                >
                  {placeOrderMutation.isPending ? 'Processing...' : 'Place Order'}
                </button>
                 {/* Display server-side form errors if needed */}
                 {errors.root?.serverError && ( // Access root.serverError
                   <p className="mt-2 text-sm text-red-600 text-center">{errors.root.serverError.message}</p>
                 )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}