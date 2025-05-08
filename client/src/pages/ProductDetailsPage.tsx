// client/src/pages/ProductDetailsPage.tsx
import { useState, useEffect, Fragment } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { RadioGroup, Disclosure, Transition, Tab } from '@headlessui/react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { Helmet } from 'react-helmet-async';
import { ChevronUpIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/20/solid';

// Import Product interface from shared types
import { Product } from '@/types/product.types';

// Import the calculation utility
import { calculateAverageRating } from '@/utils/productUtils'; // Using the shared utility

export default function ProductDetailsPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addItem } = useCart();

  const { data: productResponse, isLoading, isError, error } = useQuery<{ data: { product: Product }, message?: string }>({
    queryKey: ['product', id],
    queryFn: async () => {
       if (!id) throw new Error("Product ID is missing");
       const { data } = await api.get<{ data: { product: Product }, message?: string }>(`/products/${id}`);
       console.log('Product Details API response:', data);
       if (!data || !data.data || !data.data.product) {
           console.error('Invalid Product Details API response format:', data);
           if (data.message === 'Product not found') {
                throw new Error('Product not found');
           }
           throw new Error("Invalid data format from API");
       }
       return data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

   const product = productResponse?.data?.product;

  const averageRating = product ? calculateAverageRating(product.reviews || []) : 0;
  const reviewCount = product?.reviews?.length || 0;


  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0 && !selectedSize) {
      setSelectedSize(product.sizes[0]);
    }
  }, [product, selectedSize]);

  useEffect(() => {
     if (product) {
       setSelectedImageIndex(0);
     }
  }, [product?._id]);

  const handleAddToCart = async (): Promise<void> => {
    if (!product) {
       toast.error('Product data is not available.');
       return;
    }

    const sizeToUse = (product.sizes && product.sizes.length > 0) ? selectedSize : 'default';

    if (product.sizes && product.sizes.length > 0 && !selectedSize && product.stock > 0) {
      toast.error('Please select a size');
      return;
    }
     if (product.stock <= 0) {
        toast.error(`"${product.name}" is out of stock.`);
        return;
     }
     if (product.stock < quantity) {
        toast.error(`Not enough stock available for "${product.name}". Only ${product.stock} left.`);
        return;
     }

    if (!product._id) {
       toast.error('Product ID is missing.');
       return;
    }

    try {
      await addItem(product._id.toString(), quantity, sizeToUse);
    } catch (err: any) {
      console.error('Failed to add item from details page:', err);
    }
  };

  if (isLoading) {
      return (
        <div className="grid min-h-screen place-items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      );
   }

   if (isError || !product) {
      return (
        <div className="grid min-h-screen place-items-center px-4 py-16">
           <div className="text-center">
              <h2 className="text-lg font-semibold text-red-700">Error Loading Product</h2>
              <p className="mt-1 text-gray-500">
                 {isError ? (error?.message === 'Product not found' ? `Product with ID ${id} not found` : (error instanceof Error ? error.message : 'Failed to load product details.')) : `Product with ID ${id} not found.`}
              </p>
               {isError && (
                 <button
                   className="mt-6 inline-block rounded-md bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-500"
                   onClick={() => window.location.reload()}
                 >
                   Retry Loading
                 </button>
               )}
           </div>
        </div>
      );
   }

  return (
    <>
      <Helmet>
        <title>{product?.name || 'Product'} | Fashion Store</title>
        <meta name="description" content={product?.description?.substring(0, 160) || 'Product details'} />
      </Helmet>

      <div className="bg-white max-w-[100vw] overflow-x-hidden">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-16 lg:max-w-7xl lg:gap-x-8 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
              </li>
              <li>
                <span className="text-gray-300">/</span>
              </li>
              {product.category && (
                 <>
                   <li>
                      <Link to={`/?category=${product.category.toLowerCase()}`} className="text-gray-500 hover:text-gray-700">
                         {product.category}
                      </Link>
                   </li>
                   <li>
                      <span className="text-gray-300">/</span>
                   </li>
                 </>
              )}
              <li>
                <span className="text-gray-700 font-medium">{product.name}</span>
              </li>
            </ol>
          </nav>

          <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
            {/* Image gallery */}
            {/* Ensure images array is not empty before rendering Tab.Group */}
            {product.images && product.images.length > 0 ? (
            <Tab.Group as="div" className="flex flex-col-reverse">
                 {/* Thumbnails (Desktop) */}
                 <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
                   <Tab.List className="grid grid-cols-4 gap-6">
                     {product.images.map((image: string, index: number) => (
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


              {/* Main image (Desktop) */}
              <Tab.Panels className="aspect-h-1 aspect-w-1 w-full">
                {product.images?.map((image: string, index: number) => (
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
              <div className="aspect-h-1 aspect-w-1 w-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                  No Image Available
              </div>
             )}

             {/* Mobile image selector */}
            {product.images && product.images.length > 1 && (
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
                   src={product.images[selectedImageIndex]}
                   alt={`${product.name} - Current Image`}
                   className="h-full w-full object-cover object-center rounded-md"
                 />
               </div>
             </div>
             )}

            {/* Product info */}
            <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
              {product.stock <= 0 ? (
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
                <p className="text-3xl tracking-tight text-gray-900">${product.price.toFixed(2)}</p>
              </div>

              {/* Reviews Summary */}
              <div className="mt-3">
                <h3 className="sr-only">Reviews</h3>
                <div className="flex items-center">
                  <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <StarIconSolid
                        key={rating}
                        className={clsx(
                          averageRating > rating ? 'text-yellow-400' : 'text-gray-300',
                          'h-5 w-5 flex-shrink-0'
                        )}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
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
                      {product.sizes.map((size: string) => (
                        <RadioGroup.Option
                          key={size}
                          value={size}
                          className={({ active, checked }) =>
                            clsx(
                              'flex items-center justify-center rounded-md border py-3 px-3 text-sm font-medium uppercase sm:flex-1 cursor-pointer',
                              active ? 'ring-2 ring-indigo-500 ring-offset-2' : '',
                              checked
                                ? 'border-transparent bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
                              (!product.stock || product.stock <= 0) && 'opacity-50 cursor-not-allowed'
                            )
                          }
                          disabled={!product.stock || product.stock <= 0}
                        >
                          <RadioGroup.Label as="span">{size}</RadioGroup.Label>
                        </RadioGroup.Option>
                      ))}
                    </div>
                  </RadioGroup>

                   {/* Show size selection reminder */}
                   <Transition
                     as={Fragment}
                     show={!selectedSize && product.sizes && product.sizes.length > 0 && (product.stock > 0)}
                     enter="transition-opacity duration-150"
                     enterFrom="opacity-0"
                     enterTo="opacity-100"
                     leave="transition-opacity duration-150"
                     leaveFrom="opacity-100"
                     leaveTo="opacity-0"
                   >
                       <div className="mt-2">
                           <p className="text-sm text-red-600">Please select a size to add to cart</p>
                       </div>
                   </Transition>
                </div>
              )}

              <div className="mt-10 flex">
                {/* Quantity Selector - Only show if in stock */}
                {product.stock > 0 && (
                  <div className="mr-4">
                    <label htmlFor="quantity" className="sr-only">Quantity</label>
                    <select
                      id="quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                      className="rounded-md border border-gray-300 py-3 text-center text-base font-medium leading-5 text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                       {Array.from({ length: Math.min(product.stock, 10) }, (_, i) => i + 1).map(q =>
                          <option key={q} value={q}>{q}</option>
                       )}
                    </select>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0 || (product.sizes && product.sizes.length > 0 && !selectedSize)}
                  className={clsx(
                    "flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                    {
                        "opacity-50 cursor-not-allowed": product.stock <= 0 || (product.sizes && product.sizes.length > 0 && !selectedSize),
                    }
                   )}
                >
                  {product.stock <= 0 ? 'Out of stock' : 'Add to cart'}
                </button>
              </div>

              {/* Product details accordions */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                {/* Wrapped Disclosure blocks in {} */}
                <Disclosure as="div" className="border-b border-gray-200 py-2"> 
                  {/* Removed surrounding {} */}
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
                  {/* Removed surrounding {} */}
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
                   {/* Removed surrounding {} */}
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
          <div className="mt-16">
            <h2 className="text-lg font-medium text-gray-900">Recent reviews</h2>

             {/* Only show if there are reviews */}
            {product.reviews && product.reviews.length > 0 ? (
              <div className="mt-6 space-y-10 divide-y divide-gray-200 border-t border-b border-gray-200 pb-10">
                {product.reviews.map((review: Product['reviews'][0]) => ( 
                  <div key={review._id?.toString()} className="pt-10 lg:grid lg:grid-cols-12 lg:gap-x-8">
                    <div className="lg:col-span-8 lg:col-start-5 xl:col-span-9 xl:col-start-4 xl:grid xl:grid-cols-3 xl:items-start xl:gap-x-8">
                      <div className="flex items-center xl:col-span-1">
                        <div className="flex items-center">
                           {/* Render stars for individual review rating */}
                           {/* Use StarIconSolid for filled stars */}
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <StarIconSolid
                              key={rating}
                              className={clsx(
                                review.rating > rating ? 'text-yellow-400' : 'text-gray-300',
                                'h-4 w-4 flex-shrink-0'
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
                       {/* Access user name via optional chaining on the populated user object */}
                      <p className="font-medium text-gray-900">{review.user?.name || 'Anonymous'}</p>
                      <time
                        dateTime={review.createdAt} 
                        className="ml-4 border-l border-gray-200 pl-4 text-gray-500 lg:ml-0 lg:mt-2 lg:border-0 lg:pl-0"
                      >
                        {/* Convert the date string to a Date object for display formatting */}
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
      </div>
    </>
  );
}