import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState, Fragment } from 'react'; // Import Fragment
import { TrashIcon, PencilSquareIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react'; // Import Dialog and Transition

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean; // Derived from stock > 0 on backend, but useful flag
  stock: number;
}

// Basic Modal Component
function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting // Add a prop for pending state
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
   isDeleting: boolean; // Indicate if deletion is in progress
}) {
  if (!isOpen) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-95 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  {title}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>

                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                    disabled={isDeleting} // Disable while deleting
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onConfirm}
                    disabled={isDeleting} // Disable while deleting
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}


export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Fetch Products
  const { data: productsResponse, isLoading, isError, error } = useQuery<{ products: Product[] }>({ // Expecting { products: [...] }
    queryKey: ['admin-products'],
    queryFn: async () => {
       const { data } = await api.get('/admin/products'); // Assuming admin product listing route is /admin/products
       console.log('Admin Products API response:', data);
        if (!data || !data.data || !data.data.products) {
           console.error('Invalid Admin Products API response format:', data);
           throw new Error("Invalid data format from API");
       }
       return data.data; // Return data.data which contains { products: [...] }
    },
     retry: false,
  });

   // Access the products array from the response data
   const products = productsResponse?.products;

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (productId: string) => {
      return api.delete(`/admin/products/${productId}`); // Use admin delete route
    },
    onSuccess: () => {
      toast.success('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] }); // Refetch product list
       setProductToDelete(null); // Clear the product after deletion
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete product');
       console.error("Delete product error:", error);
       setProductToDelete(null); // Clear the product on error
    },
  });

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete && !deleteMutation.isPending) { // Add pending check
      deleteMutation.mutate(productToDelete._id);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin - Products | Store</title>
      </Helmet>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold leading-6 text-gray-900">Products Management</h1>
            <p className="mt-2 text-sm text-gray-700">Manage your store's products here.</p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            {/* Placeholder link for adding new product */}
            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
               <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
              Add Product
            </Link>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              {isLoading ? (
                <div className="grid place-items-center py-10">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                </div>
              ) : isError || !products ? ( // Handle error state
                 <div className="text-center py-12 text-red-600">
                     Error loading products. {isError ? (error instanceof Error ? error.message : '') : ''}
                 </div>
              ) : products.length > 0 ? ( // Check if products array is not empty
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Stock</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{product.name}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.category}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${product.price?.toFixed(2) || '0.00'}</td> {/* Use optional chaining and toFixed */}
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.stock} ({product.inStock ? 'In Stock' : 'Out'})</td> {/* Use optional chaining */}
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                           {/* Placeholder link for editing */}
                          <Link to={`/admin/products/edit/${product._id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                            <PencilSquareIcon className="h-5 w-5 inline-block"/>
                            <span className="sr-only">, {product.name}</span>
                          </Link>
                          <button
                            onClick={() => handleDeleteClick(product)}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={deleteMutation.isPending} // Disable while any delete is pending
                          >
                            <TrashIcon className="h-5 w-5 inline-block"/>
                            <span className="sr-only">, {product.name}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12"> {/* Empty state */}
                  <p className="text-sm text-gray-500">No products found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        isDeleting={deleteMutation.isPending} // Pass pending state to modal
      />
    </>
  );
}