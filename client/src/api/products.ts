// Product type definition
type Product = {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  gender: string;
  imageUrl: string;
  stock: number;
};

// Product creation/update type
type ProductInput = Omit<Product, '_id'>;

export const fetchProducts = (search?: string) => {
  const url = search 
    ? `/api/products?search=${encodeURIComponent(search)}` 
    : '/api/products';
  return fetch(url).then(res => res.json());
};

export const createProduct = (data: ProductInput) => fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
}).then(res => res.json());

export const updateProduct = (id: string, data: Partial<ProductInput>) => fetch(`/api/products/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
}).then(res => res.json());

export const deleteProduct = (id: string) => fetch(`/api/products/${id}`, {
  method: 'DELETE',
});

export const getProductById = (id: string) => fetch(`/api/products/${id}`).then(res => res.json());
