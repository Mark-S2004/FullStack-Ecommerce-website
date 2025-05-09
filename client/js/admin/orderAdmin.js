// client/js/admin/orderAdmin.js

window.AdminOrders = {
    // --- Rendering Functions ---

    // Renders the order management section for admin
    async renderList(container) {
        container.innerHTML = '<h3>Manage Orders</h3><div id="adminOrderList">Loading orders...</div>';
        try {
            const response = await fetch(`${API_BASE_URL}/orders`, { credentials: 'include' });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    renderAccessDenied(); 
                    return;
                }
                throw new Error(`Failed to fetch orders: ${response.statusText}`);
            }
            const data = await response.json();
            const orders = data.data;

            // First, fetch users for mapping user IDs to names
            const usersResponse = await fetch(`${API_BASE_URL}/users`, { credentials: 'include' });
            let userMap = {};
            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                userMap = usersData.data.reduce((acc, user) => {
                    acc[user._id] = {
                        name: user.name || 'Unknown',
                        email: user.email
                    };
                    return acc;
                }, {});
            }

            const orderListDiv = document.getElementById('adminOrderList');
            orderListDiv.innerHTML = '';

            if (orders && orders.length > 0) {
                // Group orders by user
                const ordersByUser = orders.reduce((groups, order) => {
                    const userId = order.user;
                    if (!groups[userId]) {
                        groups[userId] = [];
                    }
                    groups[userId].push(order);
                    return groups;
                }, {});

                let ordersHtml = `
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="toggleGroupByUser" checked>
                            <label class="form-check-label" for="toggleGroupByUser">
                                Group Orders by User
                            </label>
                        </div>
                    </div>
                    <div id="ordersByUser">
                `;

                // Sort users by name if available
                const sortedUserIds = Object.keys(ordersByUser).sort((a, b) => {
                    const nameA = userMap[a]?.name || '';
                    const nameB = userMap[b]?.name || '';
                    return nameA.localeCompare(nameB);
                });

                // Generate HTML for each user's orders
                sortedUserIds.forEach(userId => {
                    const userOrders = ordersByUser[userId];
                    const user = userMap[userId] || { name: 'Unknown User', email: userId };
                    
                    ordersHtml += `
                        <div class="card mb-4 user-order-group">
                            <div class="card-header bg-light">
                                <h5 class="mb-0">
                                    <span class="text-primary">${user.name}</span>
                                    <small class="text-muted ms-2">${user.email}</small>
                                    <span class="badge bg-info float-end">${userOrders.length} Order(s)</span>
                                </h5>
                            </div>
                            <div class="card-body p-0">
                                <table class="table table-striped table-bordered mb-0">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Date</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                    `;
                    
                    // Sort orders by date (newest first)
                    userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    
                    userOrders.forEach(order => {
                        const orderDate = new Date(order.createdAt);
                        const formattedDate = orderDate.toLocaleDateString();
                        
                        ordersHtml += `
                            <tr>
                                <td>${order._id}</td>
                                <td>${formattedDate}</td>
                                <td>$${order.total.toFixed(2)}</td>
                                <td>
                                    <select class="form-select form-select-sm order-status-select" data-order-id="${order._id}">
                                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                        <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                    </select>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-info view-order-details-btn" data-order-id="${order._id}">Details</button>
                                </td>
                            </tr>
                        `;
                    });
                    
                    ordersHtml += `
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `;
                });
                
                ordersHtml += `</div>`;
                
                // Add alternate view for non-grouped orders
                ordersHtml += `
                    <div id="ordersNonGrouped" style="display: none;">
                        <table class="table table-striped table-bordered">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                `;
                
                // Sort all orders by date (newest first)
                orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                orders.forEach(order => {
                    const user = userMap[order.user] || { name: 'Unknown User', email: order.user };
                    const orderDate = new Date(order.createdAt);
                    const formattedDate = orderDate.toLocaleDateString();
                    
                    ordersHtml += `
                        <tr>
                            <td>${order._id}</td>
                            <td>${user.name}<br><small>${user.email}</small></td>
                            <td>${formattedDate}</td>
                            <td>
                                <select class="form-select form-select-sm order-status-select" data-order-id="${order._id}">
                                    <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                    <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                                    <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                                    <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                                    <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </td>
                            <td>
                                <button class="btn btn-sm btn-info view-order-details-btn" data-order-id="${order._id}">Details</button>
                            </td>
                        </tr>
                    `;
                });
                
                ordersHtml += `
                            </tbody>
                        </table>
                    </div>
                `;
                
                orderListDiv.innerHTML = ordersHtml;
                
                // Add event listeners
                document.querySelectorAll('.order-status-select').forEach(select => {
                    select.addEventListener('change', this.handleUpdateStatus);
                });
                
                document.querySelectorAll('.view-order-details-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        this.handleViewDetails(e.target.dataset.orderId);
                    });
                });
                
                // Toggle between grouped and non-grouped view
                const toggleGroupBy = document.getElementById('toggleGroupByUser');
                toggleGroupBy.addEventListener('change', function() {
                    const groupedView = document.getElementById('ordersByUser');
                    const nonGroupedView = document.getElementById('ordersNonGrouped');
                    
                    if (this.checked) {
                        groupedView.style.display = 'block';
                        nonGroupedView.style.display = 'none';
                    } else {
                        groupedView.style.display = 'none';
                        nonGroupedView.style.display = 'block';
                    }
                });
            } else {
                orderListDiv.innerHTML = '<p>No orders found.</p>';
            }
        } catch (error) {
            console.error('Error fetching orders for admin:', error);
            container.innerHTML = '<p class="text-danger">Failed to load orders: ' + error.message + '</p>';
        }
    },
    
    // Handles updating the status of an order
    async handleUpdateStatus(event) {
        const orderId = event.target.dataset.orderId;
        const newStatus = event.target.value;
        
        try {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus }),
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update order status');
            }
            
            // Show success message (optional)
            // alert('Order status updated successfully!');
            
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status: ' + error.message);
            // Revert to previous status
            event.target.value = event.target.getAttribute('data-prev-status') || 'Pending';
        }
    },
    
    // Handles viewing details for a specific order
    async handleViewDetails(orderId) {
        try {
            console.log('Fetching order details for ID:', orderId);
            
            // Check if orderId is valid
            if (!orderId || typeof orderId !== 'string') {
                throw new Error('Invalid order ID');
            }
            
            // First try the specific order endpoint
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, { 
                credentials: 'include' 
            });
            
            if (!response.ok) {
                // If specific endpoint fails, try to find the order in the full orders list
                console.log('Failed to fetch from specific endpoint, trying to get from all orders');
                const allOrdersResponse = await fetch(`${API_BASE_URL}/orders`, { 
                    credentials: 'include' 
                });
                
                if (!allOrdersResponse.ok) {
                    throw new Error('Failed to fetch orders');
                }
                
                const allOrdersData = await allOrdersResponse.json();
                const allOrders = allOrdersData.data;
                const order = allOrders.find(o => o._id === orderId);
                
                if (!order) {
                    throw new Error('Order not found');
                }
                
                // Continue with found order
                displayOrderDetails(order);
            } else {
                const orderData = await response.json();
                const order = orderData.data;
                displayOrderDetails(order);
            }
            
            // Helper function to display order details
            async function displayOrderDetails(order) {
                // Fetch product details for each item
                const productIds = order.items.map(item => item.product);
                const productDetailsPromises = productIds.map(async (productId) => {
                    try {
                        const productResponse = await fetch(`${API_BASE_URL}/products/id/${productId}`);
                        if (productResponse.ok) {
                            const productData = await productResponse.json();
                            return productData.data;
                        }
                        return null;
                    } catch (error) {
                        console.error(`Error fetching product ${productId}:`, error);
                        return null;
                    }
                });
                
                const productDetails = await Promise.all(productDetailsPromises);
                const productMap = productDetails.reduce((acc, product) => {
                    if (product) {
                        acc[product._id] = product;
                    }
                    return acc;
                }, {});
                
                // Create order details modal
                const modalId = 'orderDetailsModal';
                let modalDiv = document.getElementById(modalId);
                
                if (!modalDiv) {
                    modalDiv = document.createElement('div');
                    modalDiv.id = modalId;
                    modalDiv.className = 'modal fade';
                    modalDiv.tabIndex = '-1';
                    document.body.appendChild(modalDiv);
                }
                
                // Order date formatting
                const orderDate = new Date(order.createdAt);
                const formattedDate = orderDate.toLocaleString();
                
                // Generate modal HTML
                modalDiv.innerHTML = `
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Order Details: #${order._id}</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <p><strong>Date:</strong> ${formattedDate}</p>
                                        <p><strong>Status:</strong> ${order.status}</p>
                                        <p><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
                                    </div>
                                    <div class="col-md-6">
                                        <p><strong>Subtotal:</strong> $${(order.total - order.shippingCost - order.tax).toFixed(2)}</p>
                                        <p><strong>Shipping:</strong> $${order.shippingCost.toFixed(2)}</p>
                                        <p><strong>Tax:</strong> $${order.tax.toFixed(2)}</p>
                                        <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                                    </div>
                                </div>
                                
                                <h6 class="mb-3">Order Items:</h6>
                                <table class="table table-striped table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${order.items.map(item => {
                                            const product = productMap[item.product];
                                            const productName = product ? product.name : `Product ID: ${item.product}`;
                                            return `
                                                <tr>
                                                    <td>${productName}</td>
                                                    <td>${item.qty}</td>
                                                    <td>$${item.price.toFixed(2)}</td>
                                                    <td>$${(item.price * item.qty).toFixed(2)}</td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            </div>
                        </div>
                    </div>
                `;
                
                // Show the modal
                const modal = new bootstrap.Modal(modalDiv);
                modal.show();
            }
            
        } catch (error) {
            console.error('Error viewing order details:', error);
            alert('Failed to load order details: ' + error.message);
        }
    }
} 