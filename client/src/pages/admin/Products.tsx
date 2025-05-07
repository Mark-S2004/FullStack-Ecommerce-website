import { Helmet } from 'react-helmet-async';

export default function Products() {
  return (
    <>
      <Helmet>
        <title>Admin - Products | Store</title>
      </Helmet>
      <div className="p-4">
        <h1 className="text-2xl font-semibold text-gray-900">Products Management</h1>
        <div className="mt-4">
          <p className="text-gray-600">Manage your store's products here.</p>
        </div>
      </div>
    </>
  );
} 