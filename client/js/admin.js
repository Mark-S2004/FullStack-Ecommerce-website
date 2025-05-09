// client/js/admin.js

// Use the API_BASE_URL from the main script
// If it's not available, default to the local development URL
const ADMIN_API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';

// Admin User Management
const AdminUsers = {
    renderList: async function(containerDiv) {
        containerDiv.innerHTML = `<h3>User Management</h3><div id="usersList">Loading users...</div>`;
        
        try {
            const response = await fetch(`${ADMIN_API_BASE_URL}/users`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch users: ${response.statusText}`);
            }
            
            const data = await response.json();
            const users = data.data;
            
            const usersListDiv = document.getElementById('usersList');
            
            if (users && users.length > 0) {
                let tableHtml = `
                    <table class="table table-striped mt-3">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                users.forEach(user => {
                    tableHtml += `
                        <tr>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.role}</td>
                            <td>
                                <button class="btn btn-sm btn-warning edit-user-btn" data-user-id="${user._id}">Edit</button>
                                <button class="btn btn-sm btn-danger delete-user-btn" data-user-id="${user._id}">Delete</button>
                            </td>
                        </tr>
                    `;
                });
                
                tableHtml += `</tbody></table>`;
                usersListDiv.innerHTML = tableHtml;
                
                // Add event listeners for buttons
                document.querySelectorAll('.edit-user-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        alert('Edit user functionality will be implemented later.');
                    });
                });
                
                document.querySelectorAll('.delete-user-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        if (confirm('Are you sure you want to delete this user?')) {
                            alert('Delete user functionality will be implemented later.');
                        }
                    });
                });
            } else {
                usersListDiv.innerHTML = '<p>No users found.</p>';
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            containerDiv.innerHTML = `<p class="text-danger">Failed to load users: ${error.message}</p>`;
        }
    }
};

// Admin Product Management
const AdminProducts = {
    renderList: async function(containerDiv) {
        containerDiv.innerHTML = `
            <h3>Product Management</h3>
            <div class="mb-3">
                <a href="#/admin/products/new" class="btn btn-success">Add New Product</a>
            </div>
            <div id="productsList">Loading products...</div>
        `;
        
        try {
            const response = await fetch(`${ADMIN_API_BASE_URL}/products`);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch products: ${response.statusText}`);
            }
            
            const data = await response.json();
            const products = data.data;
            
            const productsListDiv = document.getElementById('productsList');
            
            if (products && products.length > 0) {
                let tableHtml = `
                    <table class="table table-striped mt-3">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                products.forEach(product => {
                    tableHtml += `
                        <tr>
                            <td>${product.name}</td>
                            <td>${product.category}</td>
                            <td>$${product.price.toFixed(2)}</td>
                            <td>${product.stock}</td>
                            <td>
                                <a href="#/admin/products/edit/${encodeURIComponent(product.name)}" class="btn btn-sm btn-warning">Edit</a>
                                <button class="btn btn-sm btn-danger delete-product-btn" data-product-name="${product.name}">Delete</button>
                            </td>
                        </tr>
                    `;
                });
                
                tableHtml += `</tbody></table>`;
                productsListDiv.innerHTML = tableHtml;
                
                // Add event listeners for delete buttons
                document.querySelectorAll('.delete-product-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const productName = this.getAttribute('data-product-name');
                        if (confirm(`Are you sure you want to delete "${productName}"?`)) {
                            AdminProducts.deleteProduct(productName);
                        }
                    });
                });
            } else {
                productsListDiv.innerHTML = '<p>No products found.</p>';
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            containerDiv.innerHTML = `<p class="text-danger">Failed to load products: ${error.message}</p>`;
        }
    },
    
    renderAddForm: function(containerDiv) {
        containerDiv.innerHTML = `
            <h3>Add New Product</h3>
            <form id="addProductForm">
                <div class="mb-3">
                    <label for="productName" class="form-label">Product Name</label>
                    <input type="text" class="form-control" id="productName" required>
                </div>
                <div class="mb-3">
                    <label for="productDescription" class="form-label">Description</label>
                    <textarea class="form-control" id="productDescription" rows="3" required></textarea>
                </div>
                <div class="mb-3">
                    <label for="productCategory" class="form-label">Category</label>
                    <input type="text" class="form-control" id="productCategory" required>
                </div>
                <div class="mb-3">
                    <label for="productPrice" class="form-label">Price</label>
                    <input type="number" class="form-control" id="productPrice" step="0.01" min="0" required>
                </div>
                <div class="mb-3">
                    <label for="productStock" class="form-label">Stock</label>
                    <input type="number" class="form-control" id="productStock" min="0" required>
                </div>
                <div class="mb-3">
                    <label for="productImageUrl" class="form-label">Image URL</label>
                    <input type="url" class="form-control" id="productImageUrl">
                </div>
                <button type="submit" class="btn btn-primary">Add Product</button>
                <a href="#/admin/products" class="btn btn-secondary">Cancel</a>
            </form>
        `;
        
        // Add event listener for form submission
        document.getElementById('addProductForm').addEventListener('submit', function(e) {
            e.preventDefault();
            AdminProducts.addProduct();
        });
    },
    
    renderEditForm: async function(containerDiv, productName) {
        containerDiv.innerHTML = `<h3>Edit Product</h3><div id="editProductForm">Loading product details...</div>`;
        
        try {
            const response = await fetch(`${ADMIN_API_BASE_URL}/products/${encodeURIComponent(productName)}`);
            
            if (!response.ok) {
                throw new Error('Product not found');
            }
            
            const data = await response.json();
            const product = data.data;
            
            const formDiv = document.getElementById('editProductForm');
            formDiv.innerHTML = `
                <form id="updateProductForm">
                    <input type="hidden" id="productId" value="${product._id}">
                    <div class="mb-3">
                        <label for="productName" class="form-label">Product Name</label>
                        <input type="text" class="form-control" id="productName" value="${product.name}" required>
                    </div>
                    <div class="mb-3">
                        <label for="productDescription" class="form-label">Description</label>
                        <textarea class="form-control" id="productDescription" rows="3" required>${product.description}</textarea>
                    </div>
                    <div class="mb-3">
                        <label for="productCategory" class="form-label">Category</label>
                        <input type="text" class="form-control" id="productCategory" value="${product.category}" required>
                    </div>
                    <div class="mb-3">
                        <label for="productPrice" class="form-label">Price</label>
                        <input type="number" class="form-control" id="productPrice" step="0.01" min="0" value="${product.price}" required>
                    </div>
                    <div class="mb-3">
                        <label for="productStock" class="form-label">Stock</label>
                        <input type="number" class="form-control" id="productStock" min="0" value="${product.stock}" required>
                    </div>
                    <div class="mb-3">
                        <label for="productImageUrl" class="form-label">Image URL</label>
                        <input type="url" class="form-control" id="productImageUrl" value="${product.imageUrl || ''}">
                    </div>
                    <button type="submit" class="btn btn-primary">Update Product</button>
                    <a href="#/admin/products" class="btn btn-secondary">Cancel</a>
                </form>
            `;
            
            // Add event listener for form submission
            document.getElementById('updateProductForm').addEventListener('submit', function(e) {
                e.preventDefault();
                AdminProducts.updateProduct(productName);
            });
        } catch (error) {
            console.error('Error fetching product details:', error);
            containerDiv.innerHTML = `<p class="text-danger">Failed to load product details: ${error.message}</p>`;
        }
    },
    
    addProduct: async function() {
        const productData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value, 10),
            imageUrl: document.getElementById('productImageUrl').value || undefined
        };
        
        try {
            const response = await fetch(`${ADMIN_API_BASE_URL}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Product added successfully!');
                window.location.hash = '#/admin/products';
            } else {
                alert(`Failed to add product: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error adding product:', error);
            alert('An error occurred while adding the product.');
        }
    },
    
    updateProduct: async function(originalName) {
        const productData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value, 10),
            imageUrl: document.getElementById('productImageUrl').value || undefined
        };
        
        try {
            const response = await fetch(`${ADMIN_API_BASE_URL}/products/${encodeURIComponent(originalName)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Product updated successfully!');
                window.location.hash = '#/admin/products';
            } else {
                alert(`Failed to update product: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating product:', error);
            alert('An error occurred while updating the product.');
        }
    },
    
    deleteProduct: async function(productName) {
        try {
            const response = await fetch(`${ADMIN_API_BASE_URL}/products/${encodeURIComponent(productName)}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (response.ok) {
                alert('Product deleted successfully!');
                // Re-render the products list
                AdminProducts.renderList(document.getElementById('adminContent'));
            } else {
                const errorData = await response.json();
                alert(`Failed to delete product: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('An error occurred while deleting the product.');
        }
    }
};

// Admin Order Management
const AdminOrders = {
    renderList: async function(containerDiv) {
        containerDiv.innerHTML = `<h3>Order Management</h3><div id="ordersList">Loading orders...</div>`;
        
        try {
            const response = await fetch(`${ADMIN_API_BASE_URL}/orders`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch orders: ${response.statusText}`);
            }
            
            const data = await response.json();
            const orders = data.data;
            
            const ordersListDiv = document.getElementById('ordersList');
            
            if (orders && orders.length > 0) {
                let tableHtml = `
                    <table class="table table-striped mt-3">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Status</th>
                                <th>Total</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                orders.forEach(order => {
                    tableHtml += `
                        <tr>
                            <td>${order._id}</td>
                            <td>${order.user}</td>
                            <td>${order.status}</td>
                            <td>$${order.total.toFixed(2)}</td>
                            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>
                                <button class="btn btn-sm btn-info view-order-btn" data-order-id="${order._id}">View</button>
                                <button class="btn btn-sm btn-warning update-status-btn" data-order-id="${order._id}">Update Status</button>
                            </td>
                        </tr>
                    `;
                });
                
                tableHtml += `</tbody></table>`;
                ordersListDiv.innerHTML = tableHtml;
                
                // Add event listeners for buttons
                document.querySelectorAll('.view-order-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const orderId = this.getAttribute('data-order-id');
                        AdminOrders.viewOrderDetails(orderId, ordersListDiv);
                    });
                });
                
                document.querySelectorAll('.update-status-btn').forEach(button => {
                    button.addEventListener('click', function() {
                        const orderId = this.getAttribute('data-order-id');
                        const newStatus = prompt('Enter new status (Pending, Processing, Shipped, Delivered, Cancelled):');
                        if (newStatus) {
                            AdminOrders.updateOrderStatus(orderId, newStatus);
                        }
                    });
                });
            } else {
                ordersListDiv.innerHTML = '<p>No orders found.</p>';
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            containerDiv.innerHTML = `<p class="text-danger">Failed to load orders: ${error.message}</p>`;
        }
    },
    
    viewOrderDetails: async function(orderId, containerDiv) {
        try {
            const response = await fetch(`${ADMIN_API_BASE_URL}/orders/${orderId}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Order not found');
            }
            
            const data = await response.json();
            const order = data.data;
            
            // Create a modal for order details
            const modalHtml = `
                <div class="modal fade" id="orderDetailsModal" tabindex="-1" aria-labelledby="orderDetailsModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="orderDetailsModalLabel">Order Details: #${order._id}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p><strong>Customer:</strong> ${order.user}</p>
                                <p><strong>Status:</strong> ${order.status}</p>
                                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                                <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
                                <h6>Items:</h6>
                                <ul class="list-group mb-3">
                                    ${order.items.map(item => `
                                        <li class="list-group-item d-flex justify-content-between align-items-center">
                                            ${item.product} (Quantity: ${item.qty})
                                            <span class="badge bg-primary rounded-pill">$${item.price.toFixed(2)}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                                <p><strong>Subtotal:</strong> $${(order.total - order.shippingCost - order.tax).toFixed(2)}</p>
                                <p><strong>Shipping:</strong> $${order.shippingCost.toFixed(2)}</p>
                                <p><strong>Tax:</strong> $${order.tax.toFixed(2)}</p>
                                <h5><strong>Total:</strong> $${order.total.toFixed(2)}</h5>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Append modal to the body if it doesn't exist
            if (!document.getElementById('orderDetailsModal')) {
                document.body.insertAdjacentHTML('beforeend', modalHtml);
            } else {
                document.getElementById('orderDetailsModal').remove();
                document.body.insertAdjacentHTML('beforeend', modalHtml);
            }
            
            // Show the modal
            const orderModal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
            orderModal.show();
        } catch (error) {
            console.error('Error fetching order details:', error);
            alert(`Failed to load order details: ${error.message}`);
        }
    },
    
    updateOrderStatus: async function(orderId, newStatus) {
        // Validate input
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(newStatus)) {
            alert('Invalid status. Please use one of: ' + validStatuses.join(', '));
            return;
        }
        
        try {
            const response = await fetch(`${ADMIN_API_BASE_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
                credentials: 'include'
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Order status updated successfully!');
                // Re-render the orders list
                AdminOrders.renderList(document.getElementById('adminContent'));
            } else {
                alert(`Failed to update order status: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('An error occurred while updating the order status.');
        }
    }
};

// Export admin modules to global scope for use in main script
window.AdminUsers = AdminUsers;
window.AdminProducts = AdminProducts; 
window.AdminOrders = AdminOrders;

console.log('Admin module loaded'); 