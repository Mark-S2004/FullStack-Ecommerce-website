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
                      renderAccessDenied(); return;
                  }
                  throw new Error(`Failed to fetch orders: ${response.statusText}`);
              }
            const data = await response.json();
            const orders = data.data;

            const orderListDiv = document.getElementById('adminOrderList');
            orderListDiv.innerHTML = '';

            if (orders && orders.length > 0) {
                let ordersHtml = `
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer ID</th> <!-- Enhance later -->
                                <th>Total</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                 ordersHtml += orders.map(order => `
                      <tr>
                          <td>${order._id}</td>
                           <td>${order.user}</td>
                           <td>$${order.total.toFixed(2)}</td>
                          <td>
                                <select class="form-select order-status-select" data-order-id="${order._id}">
                                    <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                    <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                                    <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                                    <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                                    <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                </select>
                            </td>
                            <td>
                                 <button class="btn btn-sm btn-info" onclick="AdminOrders.handleViewDetails('${order._id}')">Details</button>
                            </td>
                       </tr>
                  `).join('');
                ordersHtml += '</tbody></table>';
                orderListDiv.innerHTML = ordersHtml;

                // Add event listeners after HTML is added to the DOM
                document.querySelectorAll('.order-status-select').forEach(select => {
                    select.addEventListener('change', this.handleUpdateStatus);
                });

            } else {
                orderListDiv.innerHTML = '<p>No orders found.</p>';
            }

        } catch (error) {
            console.error('Error fetching orders for admin:', error);
            container.innerHTML = '<p class="text-danger">Failed to load orders.</p>';
        }
    },

    // --- Action Handlers ---

    // Handles changing the status dropdown for an order
    async handleUpdateStatus(event) {
        // `this` inside event listener refers to the element (select), not AdminOrders
        // We need to call AdminOrders explicitly
        const orderId = event.target.dataset.orderId;
        const newStatus = event.target.value;
        const selectElement = event.target;

        if (!confirm(`Change status for Order #${orderId} to "${newStatus}"?`)) {
             // Re-render to reset the select value if cancelled
              AdminOrders.renderList(document.getElementById('adminContent'));
             return;
         }

         try {
              const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: newStatus }),
                   credentials: 'include'
              });

              if (response.ok) {
                  alert('Order status updated successfully!');
                   // No need to re-render explicitly if UI update isn't complex,
                   // but it's safer to ensure consistency
                   AdminOrders.renderList(document.getElementById('adminContent'));
              } else {
                   const errorData = await response.json();
                   alert('Failed to update order status: ' + (errorData.message || 'Unknown error'));
                   AdminOrders.renderList(document.getElementById('adminContent')); // Revert on failure
                   if (response.status === 401 || response.status === 403) renderAccessDenied();
              }
          } catch (error) {
              console.error('Update order status error:', error);
              alert('An error occurred while updating order status.');
              AdminOrders.renderList(document.getElementById('adminContent')); // Revert on error
          }
    },

    // Handles viewing details for a specific order
    async handleViewDetails(orderId) {
        try {
            // Fetch the specific order details
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, { credentials: 'include' });
            if (!response.ok) {
                 if (response.status === 401 || response.status === 403) {
                     renderAccessDenied(); return;
                 }
                 throw new Error('Failed to fetch order details');
             }
             const orderDetails = await response.json();
             const order = orderDetails.data;

             // Construct the details message
             let detailsMessage = `Order ID: ${order._id}\n`;
             detailsMessage += `Customer ID: ${order.user}\n`; // Enhance later with user lookup
             detailsMessage += `Status: ${order.status}\n`;
             detailsMessage += `Date: ${new Date(order.createdAt).toLocaleString()}\n`;
             detailsMessage += `Shipping Address: ${order.shippingAddress}\n`;
             detailsMessage += `Shipping Cost: $${order.shippingCost.toFixed(2)}\n`;
             detailsMessage += `Tax: $${order.tax.toFixed(2)}\n`;
             detailsMessage += `Total: $${order.total.toFixed(2)}\n\nItems:\n`;
             order.items.forEach(item => {
                 detailsMessage += `  - Product ID: ${item.product}, Qty: ${item.qty}, Price: $${item.price.toFixed(2)}\n`;
             });

             // Display details using a simple alert
             alert(detailsMessage);

        } catch (error) {
            console.error('View order details error:', error);
            alert('An error occurred while loading order details.');
        }
    }
}; 