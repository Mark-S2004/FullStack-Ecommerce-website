import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import Link
// Correct useQuery import for v4/v5
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { StarIcon } from '@heroicons/react/20/solid';
import { RadioGroup, Disclosure, Transition, Tab } from '@headlessui/react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { Helmet } from 'react-helmet-async';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import React, { Fragment } from 'react'; // Import Fragment for Transition


// Re-define Product interface locally or import from a shared location if available
// Keeping it here for now based on the current file structure
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  gender: string;
  images: string[];
  inStock: boolean; // Derived from stock > 0 on backend, but useful flag
   stock: number; // Assuming stock count is available
  sizes: string[];
  colors: string[]; // Added colors based on backend model
  reviews: Array<{
    _id: string;
    rating: number;
    comment: string;
    user: { // Assuming user details are populated for reviews
      _id: string; // User ID
      name: string;
    };
    createdAt: string;
  }>;
}

// Kept calculateAverageRating function as it's useful here
function calculateAverageRating(reviews: Product['reviews']): number { // Added return type annotation
  if (!reviews || reviews.length === 0) return 0; // Handle empty reviews
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  // Calculate average and round to 1 decimal place
  return Math.round((sum / reviews.length) * 10) / 10;
}

export default function ProductDetailsPage(): JSX.Element { // Added return type annotation for the component
  const { id } = useParams<{ id: string }>(); // Get ID from URL params
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // State for current image index
  const { addItem } = useCart();

   // Fetch product by ID
   // Correct the type parameter to match the expected data structure { data: { product: { ... } } }
  const { data: productResponse, isLoading, isError, error } = useQuery<{ data: { product: Product } }>({ // Expecting { data: { product: { ... } } }
    queryKey: ['product', id],
    queryFn: async () => {
       if (!id) throw new Error("Product ID is missing"); // Ensure ID exists
       const { data } = await api.get(`/products/${id}`); // Fetch by ID
       console.log('Product Details API response:', data);
       // Backend returns { data: { product: { ... } }, message: '...' }
       if (!data || !data.data || !data.data.product) {
           console.error('Invalid Product Details API response format:', data);
           throw new Error("Invalid data format from API");
       }
       return data.data; // Return data.data which contains { product: { ... } }
    },
    enabled: !!id, // Only fetch if ID is available
     // Remove invalid options
    staleTime: 1000 * 60 * 5, // Use global default or set specifically
  });

   // Access the product object from the response data
   // Use optional chaining to safely access nested properties
   const product = productResponse?.product;

  useEffect(() => {
    // Set default selected size if product and sizes are available
    if (product && product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product, selectedSize]); // Added selectedSize to dependencies

   // Reset selected image index when product changes
  useEffect(() => {
    setSelectedImageIndex(0);
  }, [product?._id]); // Reset when product ID changes

  const handleAddToCart = async () => {
    if (!product) return;

    const sizeToUse = (product.sizes && product.sizes.length > 0) ? selectedSize : 'default';

    if (!sizeToUse && product.sizes && product.sizes.length > 0 && (product.inStock && product.stock > 0)) { // Check if size selection is applicable and required
      toast.error('Please select a size');
      return;
    }
     // Check stock before adding (backend also checks, but a client-side check provides faster feedback)
     if (!product.inStock || product.stock <= 0) {
        toast.error(`"${product.name}" is out of stock.`);
        return;
     }
     if (product.stock < quantity) { // Check stock against selected quantity
        toast.error(`Not enough stock available for "${product.name}". Only ${product.stock} left.`);
        return;
     }


    if (!product._id) {
        toast.error('Product ID is missing.');
        return;
    }


    try {
       // Call addItem with product ID, quantity, and selected size
      await addItem(product._id, quantity, sizeToUse); // Pass size
       // The addItem context function already shows a success toast and refetches the cart
    } catch (err: any) { // Added type annotation for err
      console.error('Failed to add item from details page:', err);
       // Toast error is handled in the context function
    }
  };

  return ( // Ensure the component returns JSX
    <>
      <Helmet>
        <title>{product.name} | Fashion Store</title>
        <meta name="description" content={product.description.substring(0, 160)} />
      </Helmet>

      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-16 lg:max-w-7xl lg:gap-x-8 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
              </li>
              <li>
                <span className="text-gray-300">/</span>
              </li>
               {/* Link to category page using category query param */}
              <li>
                <Link to={`/?category=${product.category.toLowerCase()}`} className="text-gray-500 hover:text-gray-700">
                  {product.category}
                </Link>
              </li>
              <li>
                <span className="text-gray-300">/</span>
              </li>
              <li>
                <span className="text-gray-700 font-medium">{product.name}</span> {/* Make current page bold */}
              </li>
            </ol>
          </nav>

          <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
            {/* Image gallery */}
            {/* Ensure images array is not empty before rendering Tab.Group */}
            {product.images && product.images.length > 0 ? (
            <Tab.Group as="div" className="flex flex-col-reverse">
              {/* Thumbnails (Desktop) */}
              {product.images && product.images.length > 0 && (
                 <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
                   <Tab.List className="grid grid-cols-4 gap-6">
                     {product.images.map((image: string, index: number) => ( // Added type annotations
                       <Tab
                         key={index}
                         className="relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4"
                       >
                         {({ selected }) => (
                           <>
                             <span className="sr-only">{product.name} image {index + 1}</span>
                             <span className="absolute inset-0 overflow-hidden rounded-md">
                               <img src={image} alt="" className="h-full w-full object-cover object-center" />
                             </span>
                             <span
                               className={clsx(
                                 selected ? 'ring-indigo-500' : 'ring-transparent',
                                 'pointer-events-none absolute inset-0 rounded-md ring-2 ring-offset-2'
                               )}
                               aria-hidden="true"
                             />
                           </>
                         )}
                       </Tab>
                     ))}
                   </Tab.List>
                 </div>
              )}


              {/* Main image (Desktop) */}
              <Tab.Panels className="aspect-h-1 aspect-w-1 w-full">
                {product.images?.map((image: string, index: number) => ( // Added type annotations
                  <Tab.Panel key={index}>
                    <img
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="h-full w-full object-cover object-center sm:rounded-lg"
                    />
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
             ) : (
               // Placeholder or message if no images
              <div className="aspect-h-1 aspect-w-1 w-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                  No Image Available
              </div>
             )}


             {/* Mobile image selector */}
            {product.images && product.images.length > 0 && (
             <div className="mt-6 block sm:hidden">
               <div className="flex items-center justify-between">
                 <button
                   type="button"
                   className="rounded-md bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
                   onClick={() => setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : product.images.length - 1))}
                 >
                   <span className="sr-only">Previous image</span>
                   <ChevronUpIcon className="h-5 w-5 rotate-90" aria-hidden="true" />
                 </button>
                 <span className="text-sm text-gray-500">
                   {selectedImageIndex + 1} / {product.images.length}
                 </span>
                 <button
                   type="button"
                   className="rounded-md bg-gray-100 p-2 text-gray-500 hover:bg-gray-200"
                   onClick={() => setSelectedImageIndex((prev) => (prev < product.images.length - 1 ? prev + 1 : 0))}
                 >
                   <span className="sr-only">Next image</span>
                   <ChevronUpIcon className="h-5 w-5 -rotate-90" aria-hidden="true" />
                 </button>
               </div>
               <div className="mt-2">
                 <img
                   src={product.images[selectedImageIndex]} // Use selectedImageIndex
                   alt={`${product.name} - Current Image`}
                   className="h-full w-full object-cover object-center rounded-md"
                 />
               </div>
             </div>
             )}
            {/* Product info */}
            <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
              {!product.inStock || product.stock <= 0 ? ( // Check stock count
                <div className="mb-4">
                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                    Out of stock
                  </span>
                </div>
              ) : (
                 <div className="mb-4">
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                       In stock ({product.stock})
                    </span>
                 </div>
              )}

              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>

              <div className="mt-3">
                <h2 className="sr-only">Product information</h2>
                <p className="text-3xl tracking-tight text-gray-900">${product.price.toFixed(2)}</p> {/* Use toFixed */}
              </div>

              {/* Reviews Summary */}
              <div className="mt-3">
                <h3 className="sr-only">Reviews</h3>
                <div className="flex items-center">
                  <div className="flex items-center">
                     {/* Render stars based on average rating */}
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <StarIcon
                        key={rating}
                        className={clsx(
                          averageRating > rating ? 'text-yellow-400' : 'text-gray-300',
                          'h-5 w-5 flex-shrink-0'
                        )}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                   {/* Display average rating and count */}
                  <p className="ml-3 text-sm text-gray-500">
                     {averageRating} out of 5 stars ({reviewCount} reviews)
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="sr-only">Description</h3>
                <p className="text-base text-gray-900">{product.description}</p>
              </div>

               {/* Size Selector - Only show if sizes are available */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">Size</h3>
                    <p className="text-sm text-gray-500">Select your size</p>
                  </div>
                  <RadioGroup value={selectedSize} onChange={setSelectedSize} className="mt-2">
                    <RadioGroup.Label className="sr-only">Choose a size</RadioGroup.Label>
                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                      {product.sizes.map((size: string) => ( // Added type annotation
                        <RadioGroup.Option
                          key={size}
                          value={size}
                          className={({ active, checked }) =>
                            clsx(
                              active ? 'ring-2 ring-indigo-500 ring-offset-2' : '',
                              checked
                                ? 'border-transparent bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
                              'flex items-center justify-center rounded-md border py-3 px-3 text-sm font-medium uppercase sm:flex-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                            )
                          }
                          disabled={!product.inStock || product.stock <= 0} // Disable size selection if out of stock
                        >
                          <RadioGroup.Label as="span">{size}</RadioGroup.Label>
                        </RadioGroup.Option>
                      ))}
                    </div>
                  </RadioGroup>
                   {/* Show size selection reminder */}
                   <Transition
                     as="div"
                     show={!selectedSize && product.sizes && product.sizes.length > 0 && (product.inStock && product.stock > 0)} // Show only if size is required but not selected, and in stock
                     enter="transition-opacity duration-150"
                     enterFrom="opacity-0"
                     enterTo="opacity-100"
                     leave="transition-opacity duration-150"
                     leaveFrom="opacity-100"
                     leaveTo="opacity-0"
                     className="mt-2"
                   >
                       <p className="text-sm text-red-600">Please select a size to add to cart</p>
                   </Transition>
                </div>
              )}


              <div className="mt-10 flex">
                {/* Quantity Selector - Only show if in stock */}
                {product.inStock && product.stock > 0 && (
                  <div className="mr-4">
                    <label htmlFor="quantity" className="sr-only">Quantity</label>
                    <select
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                      className="rounded-md border border-gray-300 py-3 text-center text-base font-medium leading-5 text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                       {/* Generate options up to available stock or a reasonable limit */}
                       {[...Array(Math.min(product.stock, 10)).keys()].map(i => i + 1).map(q => // Limit to 10 or stock
                          <option key={q} value={q}>{q}</option>
                       )}
                    </select>
                  </div>
                )}


                <button
                  type="button"
                  onClick={handleAddToCart}
                  // Disable if out of stock OR (sizes are required AND no size is selected)
                  disabled={!product.inStock || product.stock <= 0 || (product.sizes && product.sizes.length > 0 && !selectedSize)}
                  className={clsx(
                    "flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                    {
                        "opacity-50 cursor-not-allowed": !product.inStock || product.stock <= 0 || (product.sizes && product.sizes.length > 0 && !selectedSize),
                    }
                   )}
                >
                  {!product.inStock || product.stock <= 0 ? 'Out of stock' : 'Add to cart'}
                </button>
              </div>


              {/* Product details accordions */}
              {/* Ensure product details sections are rendered even if reviews are empty */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                <Disclosure as="div" className="border-b border-gray-200 py-2">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center justify-between py-2 text-left text-sm font-medium text-gray-900">
                        <span>Features</span>
                        <ChevronUpIcon
                          className={`${
                            open ? 'rotate-180 transform' : ''
                          } h-5 w-5 text-gray-500`}
                          aria-hidden="true"
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-4 pb-2 pt-2 text-sm text-gray-500">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Premium quality material</li>
                          <li>Ethically manufactured</li>
                          <li>Perfect for daily use</li>
                          <li>Modern design</li>
                        </ul>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>

                <Disclosure as="div" className="border-b border-gray-200 py-2">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center justify-between py-2 text-left text-sm font-medium text-gray-900">
                        <span>Care Instructions</span>
                        <ChevronUpIcon
                          className={`${
                            open ? 'rotate-180 transform' : ''
                          } h-5 w-5 text-gray-500`}
                          aria-hidden="true"
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-4 pb-2 pt-2 text-sm text-gray-500">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Machine wash cold</li>
                          <li>Tumble dry low</li>
                          <li>Do not bleach</li>
                          <li>Iron on low heat if needed</li>
                        </ul>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>

                <Disclosure as="div" className="border-b border-gray-200 py-2">
                  {({ open }) => (
                    <>
                      <Disclosure.Button className="flex w-full items-center justify-between py-2 text-left text-sm font-medium text-gray-900">
                        <span>Shipping & Returns</span>
                        <ChevronUpIcon
                          className={`${
                            open ? 'rotate-180 transform' : ''
                          } h-5 w-5 text-gray-500`}
                          aria-hidden="true"
                        />
                      </Disclosure.Button>
                      <Disclosure.Panel className="px-4 pb-2 pt-2 text-sm text-gray-500">
                        <p>Free shipping on orders over $50. Standard delivery takes 3-5 business days.</p>
                        <p className="mt-2">Returns accepted within 30 days of delivery. Item must be unworn and in original packaging.</p>
                      </Disclosure.Panel>
                    </>
                  )}
                </Disclosure>
              </div>
              {/* End of Product details accordions */}

          {/* Reviews section */}
          <div className="mt-16 lg:col-span-2">
            <h2 className="text-lg font-medium text-gray-900">Recent reviews</h2>

             {/* Only show if there are reviews */}
            {product.reviews && product.reviews.length > 0 ? (
              <div className="mt-6 space-y-10 divide-y divide-gray-200 border-t border-b border-gray-200 pb-10">
                {product.reviews.map((review: Product['reviews'][0]) => ( // Added type annotation for review
                   // Use review._id as key
                  <div key={review._id} className="pt-10 lg:grid lg:grid-cols-12 lg:gap-x-8">
                    <div className="lg:col-span-8 lg:col-start-5 xl:col-span-9 xl:col-start-4 xl:grid xl:grid-cols-3 xl:items-start xl:gap-x-8">
                      <div className="flex items-center xl:col-span-1">
                        <div className="flex items-center">
                           {/* Render stars for individual review rating */}
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <StarIcon
                              key={rating}
                              className={clsx(
                                review.rating > rating ? 'text-yellow-400' : 'text-gray-300',
                                'h-5 w-5 flex-shrink-0'
                              )}
                              aria-hidden="true"
                            />
                          ))}
                        </div>
                        <p className="ml-3 text-sm text-gray-500">
                          {review.rating}
                          <span className="sr-only"> out of 5 stars</span>
                        </p>
                      </div>

                      <div className="mt-4 lg:mt-6 xl:col-span-2 xl:mt-0">
                        <p className="text-sm text-gray-500">{review.comment}</p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center text-sm lg:col-span-4 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:flex-col lg:items-start xl:col-span-3">
                      <p className="font-medium text-gray-900">{review.user?.name || 'Anonymous'}</p> {/* Use optional chaining */}
                      <time
                        dateTime={review.createdAt}
                        className="ml-4 border-l border-gray-200 pl-4 text-gray-500 lg:ml-0 lg:mt-2 lg:border-0 lg:pl-0"
                      >
                        {new Date(review.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                ))}
              </div>
             ) : (
              <div className="mt-6 text-center border-t border-gray-200 pt-10">
                <p className="text-sm text-gray-500">No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </>
  );
}