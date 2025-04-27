export const fetchProducts = () => fetch('/api/products').then(res => res.json());
export const createProduct = (data) => fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
}).then(res => res.json());
export const updateProduct = (id, data) => fetch(`/api/products/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
}).then(res => res.json());
export const deleteProduct = (id) => fetch(`/api/products/${id}`, {
  method: 'DELETE',
});
export const getProductById = (id) => fetch(`/api/products/${id}`).then(res => res.json());
