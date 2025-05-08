// client/src/pages/HomePage.tsx
import { useState, Fragment } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { Transition } from '@headlessui/react'; // Kept only Transition
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { Helmet } from 'react-helmet-async';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Imported MagnifyingGlassIcon
import { StarIcon as StarIconSolid } from '@heroicons/react/20/solid';


import { Product } from '@/types/product.types'
import { calculateAverageRating } from '@/utils/productUtils';


const productCategories = ['Shirts', 'Pants', 'Shoes', 'Accessories', 'Dresses'];
const productGenders = ['Men', 'Women', 'Unisex'];


export default function HomePage(): JSX.Element {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedGender = searchParams.get('gender') || '';

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const { data: productsResponse, isLoading, error, isError } = useQuery<{ data: { products: Product[] }, message?: string }>({
    queryKey: ['products', searchQuery, selectedCategory, selectedGender],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedGender) params.append('gender', selectedGender);

      console.log('Fetching products with params:', params.toString());
      try {
        const { data } = await api.get<{ data: { products: Product[] }, message?: string }>(`/products?${params.toString()}`);
        console.log('API response:', data);
        if (!data || !data.data || !Array.isArray(data.data.products)) {
          console.error('Invalid API response format:', data);
          throw new Error("Invalid data format from API: Expected an array of products under data.data.products");
        }
        return data;
      } catch (error) {
        console.error('Failed to fetch products:', error);
        throw error;
      }
    },
  });

  const products = productsResponse?.data?.products;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      newSearchParams.set('search', e.target.value);
    } else {
      newSearchParams.delete('search');
    }
    setSearchParams(newSearchParams, { replace: true });
  };

  const handleCategoryChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (value && value.toLowerCase() !== 'all categories') {
      newSearchParams.set('category', value.toLowerCase());
    } else {
      newSearchParams.delete('category');
    }
    setSearchParams(newSearchParams, { replace: true });
  };

  const handleGenderChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (value && value.toLowerCase() !== 'all genders') {
      newSearchParams.set('gender', value.toLowerCase());
    } else {
      newSearchParams.delete('gender');
    }
    setSearchParams(newSearchParams, { replace: true });
  };


  const { addItem: addToCartContext } = useCart();

  const handleAddToCart = async (product: Product): Promise<void> => {
    if (!product) {
       toast.error('Product data is not available.');
       return;
    }

    const sizeToAdd = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'default';
    const selectedQuantity = 1;


    if (product.stock <= 0) {
       toast.error(`"${product.name}" is out of stock.`);
       return;
    }
     if (product.stock < selectedQuantity) {
        toast.error(`Not enough stock available for "${product.name}". Only ${product.stock} left.`);
        return;
     }


    if (!product._id) {
       toast.error('Product ID is missing.');
       return;
    }


    try {
      await addToCartContext(product._id.toString(), selectedQuantity, sizeToAdd);
    } catch (err: any) {
      console.error('Failed to add item from HomePage:', err);
    }
  };


  return (
    <>
      <Helmet>
        <title>{productsResponse?.data?.products?.[0]?.name || 'Home'} | Fashion Store</title>
        <meta name="description" content="Browse our latest fashion products" />
      </Helmet>

      <div className="bg-white max-w-[100vw] overflow-x-hidden">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12 lg:max-w-7xl lg:px-8">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-lg mb-8 max-h-[500px]">
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1974&q=80"
                alt="Fashion collection"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 to-gray-900/30"></div>
            </div>
            <div className="relative z-[1] px-4 py-8 sm:px-6 sm:py-12">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Summer Collection 2023
              </h1>
              <p className="mt-4 max-w-lg text-base text-gray-200">
                Discover our new arrivals and trending styles for the season
              </p>
              <div className="mt-6">
                <button
                   type="button"
                  className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
                  onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}
                >
                  Shop Now
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Our Products</h2>

            {/* Mobile filter toggle */}
            <button
              type="button"
              className="flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 md:hidden"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              Filters
              <svg className="ml-1 h-5 w-5 transition-transform duration-200 ease-in-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isFiltersOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
              </svg>
            </button>

            {/* Search and Filters for larger screens */}
            <div className="hidden md:flex md:flex-row md:items-center md:gap-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="block w-full rounded-md border-0 px-4 py-2 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2 h-5 w-5 text-gray-400" />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="">All Categories</option>
                {productCategories.map((category) => (
                  <option key={category} value={category.toLowerCase()}>
                    {category}
                  </option>
                ))}
              </select>

              {/* Gender Filter */}
              <select
                value={selectedGender}
                onChange={(e) => handleGenderChange(e.target.value)}
                className="block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              >
                <option value="">All Genders</option>
                {productGenders.map((gender) => (
                  <option key={gender} value={gender.toLowerCase()}>
                    {gender}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile filters */}
          <Transition
            show={isFiltersOpen}
            as={Fragment}
            enter="transition-all duration-300 ease-out"
            enterFrom="transform scale-95 opacity-0 max-h-0"
            enterTo="transform scale-100 opacity-100 max-h-screen"
            leave="transition-all duration-200 ease-out"
            leaveFrom="transform scale-100 opacity-100 max-h-screen"
            leaveTo="transform scale-95 opacity-0 max-h-0"
          >
             {/* Added className here */}
            <div className="md:hidden overflow-hidden mt-4 space-y-4 border-t border-b border-gray-200 py-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="block w-full rounded-md border-0 px-4 py-2 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-2 h-5 w-5 text-gray-400" />
              </div>

              {/* Category Filter - Radio Buttons */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">Categories</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="category-all-mobile"
                      name="category-mobile"
                      type="radio"
                      checked={selectedCategory === ''}
                      onChange={() => handleCategoryChange('')}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label htmlFor="category-all-mobile" className="ml-3 text-sm text-gray-600">
                      All Categories
                    </label>
                  </div>
                  {productCategories.map((category) => (
                    <div key={`mobile-${category}`} className="flex items-center">
                      <input
                        id={`category-mobile-${category}`}
                        name="category-mobile"
                        type="radio"
                        checked={selectedCategory === category.toLowerCase()}
                        onChange={() => handleCategoryChange(category.toLowerCase())}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <label htmlFor={`category-mobile-${category}`} className="ml-3 text-sm text-gray-600">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender Filter - Radio Buttons */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-900">Gender</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                     <input
                       id="gender-all-mobile"
                       name="gender-mobile"
                       type="radio"
                       checked={selectedGender === ''}
                       onChange={() => handleGenderChange('')}
                       className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                     />
                     <label htmlFor="gender-all-mobile" className="ml-3 text-sm text-gray-600">
                       All Genders
                     </label>
                   </div>
                  {productGenders.map((gender) => (
                    <div key={`mobile-${gender}`} className="flex items-center">
                      <input
                        id={`gender-mobile-${gender}`}
                        name="gender-mobile"
                        type="radio"
                        checked={selectedGender === gender.toLowerCase()}
                        onChange={() => handleGenderChange(gender.toLowerCase())}
                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <label htmlFor={`gender-mobile-${gender}`} className="ml-3 text-sm text-gray-600">
                        {gender}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Transition>


          {/* Loading State */}
          {isLoading && (
            <div className="mt-12 grid place-items-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
          )}

          {/* Product Grid */}
          {/* Only render grid if products array exists and is not loading */}
          {!isLoading && products && products.length > 0 ? (
             <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
               {products.map((product: Product) => {
                  const averageRating = calculateAverageRating(product.reviews || []);
                  const reviewCount = product.reviews?.length || 0;
                 return (
                 <div key={product._id?.toString()} className="group relative border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                   <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-200 lg:aspect-none lg:h-[180px]">
                     <img
                       src={product.images?.[0]}
                       alt={product.name}
                       className="h-full w-full object-cover object-center"
                     />
                   </div>
                   <div className="p-4">
                     <div className="mb-2">
                       <h3 className="text-sm font-medium text-gray-900">
                         <Link to={`/product/${product._id?.toString()}`}>
                           <span aria-hidden="true" className="absolute inset-0" />
                           {product.name}
                         </Link>
                       </h3>
                       <p className="mt-1 text-xs text-gray-500">{product.category}</p>
                         {/* Reviews summary */}
                        {reviewCount > 0 && (
                            <div className="flex items-center mt-1">
                                {/* Render stars based on average rating */}
                                {[0, 1, 2, 3, 4].map((star) => (
                                <StarIconSolid
                                    key={star}
                                    className={clsx(
                                    averageRating > star ? 'text-yellow-400' : 'text-gray-300',
                                    'h-4 w-4 flex-shrink-0'
                                    )}
                                    aria-hidden="true"
                                />
                                ))}
                                <span className="ml-1 text-xs text-gray-500">
                                ({reviewCount})
                                </span>
                            </div>
                        )}
                     </div>
                     <p className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</p>
                   </div>
                   {product.stock <= 0 ? (
                     <span className="absolute right-2 top-2 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                       Out of stock
                     </span>
                   ) : (
                     <button
                       onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         handleAddToCart(product);
                       }}
                       className="absolute bottom-2 right-2 rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus:outline-none"
                     >
                       <span className="sr-only">Add to cart</span>
                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                       </svg>
                     </button>
                   )}
                 </div>
                );
               })}
             </div>
           ) : !isLoading && isError ? (
              /* Error State */
              <div className="mt-12 p-4 border border-red-300 bg-red-50 rounded text-center">
                <h3 className="text-lg font-semibold text-red-700">Error Loading Products</h3>
                <p className="mt-1 text-red-500">
                  {error instanceof Error ? error.message : 'Failed to load products. Please try again.'}
                </p>
                <button
                  className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
           ) : !isLoading && products?.length === 0 ? (
             /* Empty State */
             <div className="mt-12 text-center">
               <h3 className="text-lg font-semibold text-gray-900">No products found</h3>
               <p className="mt-1 text-gray-500">Try adjusting your search or filters</p>
             </div>
           ) : null
           }


          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 gap-y-10 gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Free Shipping</h3>
              <p className="mt-2 text-base text-gray-500">Free shipping on all orders over $50</p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Secure Payments</h3>
              <p className="mt-2 text-base text-gray-500">We use secure payment methods</p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">Easy Returns</h3>
              <p className="mt-2 text-base text-gray-500">30-day money-back guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}