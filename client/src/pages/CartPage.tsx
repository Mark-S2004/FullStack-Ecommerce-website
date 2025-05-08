// client/src/pages/CartPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
// Import the correct types from CartContext
import { useCart, PopulatedCartItem, CartTotals } from '../contexts/CartContext'; // Corrected import name
// Removed direct toast import as it's handled by context
// import toast from 'react-hot-toast';
import clsx from 'clsx'; // Import clsx

// Added return type annotation for the component
export default function CartPage(): JSX.Element {
  // Destructure total from useCart context
  const { items, total, isLoading, updateQuantity, removeItem } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);

  // Added type annotation for the parameter
  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    setIsUpdating(true);
    // Ensure quantity is a positive integer
    const quantity = Math.max(1, parseInt(newQuantity as any, 10)); // Use item ID
    await updateQuantity(itemId, quantity); // Use item ID and validated quantity
    setIsUpdating(false);
  };

  // Added type annotation for the parameter
  const handleRemoveItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      await removeItem(itemId); // Use item ID
    }
  };

  if (isLoading) {
    return (
      <div className="grid min-h-[calc(100vh-12rem)] place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // Check if items array is empty or undefined
  // Use optional chaining for safety, although isLoading check should handle the initial state
  if (!items || items.length === 0) {
    return (
      <div className="grid min-h-[calc(100vh-12rem)] place-items-center px-4 py-16">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">Your cart is empty</h2>
          <p className="mt-1 text-sm text-gray-500">Add some items to your cart to continue shopping.</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-md bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-500"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Shopping Cart
        </h1>

        {/* No form tag needed here if submission is handled via individual item buttons */}
        <div className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16"> {/* Changed from <form> to <div> */}
          <section aria-labelledby="cart-heading" className="lg:col-span-7">
            <h2 id="cart-heading" className="sr-only">
              Items in your shopping cart
            </h2>

            <ul role="list" className="divide-y divide-gray-200 border-b border-t border-gray-200">
              {/* Added type annotation for item */}
              {items.map((item: PopulatedCartItem) => (
                // Use item._id as key as it's unique per item instance in the cart
                <li key={item._id?.toString()} className="flex py-6 sm:py-10"> {/* Added toString() for key safety */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.product?.images?.[0]} // Use optional chaining
                      alt={item.product?.name || 'Product Image'} // Use optional chaining
                      className="h-24 w-24 rounded-md object-cover object-center sm:h-32 sm:w-32"
                    />
                  </div>

                  <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-sm">
                            {/* Link to product page using product._id */}
                            <Link
                              to={`/product/${item.product?._id}`}
                              className="font-medium text-gray-700 hover:text-gray-800"
                            >
                              {item.product?.name}
                            </Link>
                          </h3>
                        </div>
                        <p className="mt-1 text-sm font-medium text-gray-900">
                           ${item.product?.price?.toFixed(2) || '0.00'} {/* Use optional chaining and toFixed */}
                        </p>
                         {item.size && ( // Only display size if it exists
                            <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>
                         )}
                      </div>

                      <div className="mt-4 sm:mt-0 sm:pr-9">
                        <label htmlFor={`quantity-${item._id}`} className="sr-only">
                          Quantity, {item.quantity}
                        </label>
                        <select
                          id={`quantity-${item._id}`}
                          name={`quantity-${item._id}`}
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(item._id?.toString() || '', parseInt(e.target.value, 10)) // Added toString() for itemId, handle undefined
                          }
                           // Disable select while updating
                          className="max-w-full rounded-md border border-gray-300 py-1.5 text-left text-base font-medium leading-5 text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm disabled:opacity-50"
                           disabled={isUpdating}
                        >
                           {/* Generate options up to 10 or available product stock if product.stock is available */}
                           {/* Assuming product.stock is available on the populated item */}
                           {Array.from({ length: Math.min(item.product?.stock || 10, 10) }, (_, i) => i + 1).map((num) => ( // Limit to 10 or product stock
                            <option key={num} value={num}>
                              {num}
                            </option>
                          ))}
                        </select>

                        <div className="absolute right-0 top-0">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item._id?.toString() || '')} // Added toString() for itemId, handle undefined
                            className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500"
                            disabled={isUpdating} // Disable remove button while updating
                          >
                            <span className="sr-only">Remove</span>
                            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Order summary */}
          {/* Wrap summary section inside a div if it's no longer part of the form */}
          <section
            aria-labelledby="summary-heading"
            className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
          >
            <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
              Order summary
            </h2>

            {/* Use totals from context */}
            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Subtotal</dt>
                <dd className="text-sm font-medium text-gray-900">${total.subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-sm text-gray-600">Shipping estimate</dt>
                <dd className="text-sm font-medium text-gray-900">${total.shipping.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-sm text-gray-600">Tax estimate</dt>
                <dd className="text-sm font-medium text-gray-900">${total.tax.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-base font-medium text-gray-900">Order total</dt>
                <dd className="text-base font-medium text-gray-900">${total.total.toFixed(2)}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <Link
                to="/checkout"
                 // Disable checkout if cart is empty or still loading/updating
                className={clsx(
                  "w-full rounded-md border border-transparent px-4 py-3 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 text-center",
                  {
                    "bg-indigo-600 hover:bg-indigo-700": !isLoading && items.length > 0 && !isUpdating,
                    "bg-gray-400 cursor-not-allowed": isLoading || items.length === 0 || isUpdating,
                  }
                )}
                 aria-disabled={isLoading || items.length === 0 || isUpdating}
                 onClick={(e) => {
                    if (isLoading || items.length === 0 || isUpdating) {
                       e.preventDefault(); // Prevent navigation if disabled
                    }
                 }}
              >
                Checkout
              </Link>
            </div>
          </section>
        </div> {/* Closing div for the grid layout */} {/* Added closing div */}
      </div>
    </div>
  );
} 