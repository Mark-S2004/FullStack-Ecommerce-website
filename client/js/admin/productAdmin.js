window.AdminProducts = {
    // --- Rendering Functions ---

    async renderList(container) {
        container.innerHTML = '<h3>Manage Products</h3><p><a href="#/admin/products/new" class="btn btn-success mb-3">Add New Product</a></p><div id="adminProductsList">Loading products...</div>';
        try {
            const response = await fetch(`${API_BASE_URL}/products`, { credentials: 'include' });
            // ... error handling ...
            const data = await response.json();
            const products = data.data;
            const productListDiv = document.getElementById('adminProductsList');

            if (products && products.length > 0) {
                let productsHtml = `
                    <table class="table table-striped table-bordered table-responsive">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Orig. Price</th>
                                <th>Discount %</th>
                                <th>Curr. Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                productsHtml += products.map(product => `
                    <tr>
                        <td>${product.name}</td>
                        <td>$${(product.originalPrice || product.price).toFixed(2)}</td>
                        <td>${product.discountPercentage || 0}%</td>
                        <td>$${product.price.toFixed(2)}</td>
                        <td>${product.stock}</td>
                        <td>
                            <button class="btn btn-sm btn-primary me-2" onclick="AdminProducts.navigateToEdit('${product.name}')">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="AdminProducts.handleDelete('${product.name}')">Delete</button>
                            <button class="btn btn-sm btn-info ms-2" onclick="AdminProducts.showDiscountModal('${product.name}', ${product.discountPercentage || 0})">Discount</button>
                        </td>
                    </tr>
                `).join('');
                productsHtml += '</tbody></table>';
                productListDiv.innerHTML = productsHtml;
            } else {
                productListDiv.innerHTML = '<p>No products found.</p>';
            }
        } catch (error) {
            // ... error handling ...
        }
    },

    // ... navigateToEdit, handleDelete ...

    async renderEditForm(container, productName) {
        // ... existing form rendering ... fetch product data ...

        // Modify form to include originalPrice (read-only) and discountPercentage
        // For simplicity, discount is managed via the modal, not directly in edit form.
        // Original price is displayed for reference.
        container.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h4 class="card-title">${productName ? 'Edit' : 'Add'} Product</h4>
                    <form id="adminProductForm">
                        <input type="hidden" id="originalProductName" value="${productName || ''}">
                        <div class="mb-3">
                            <label for="productName" class="form-label">Name</label>
                            <input type="text" class="form-control" id="productName" value="${product ? product.name : ''}" required>
                        </div>
                        <div class="mb-3">
                            <label for="productDescription" class="form-label">Description</label>
                            <textarea class="form-control" id="productDescription" rows="3" required>${product ? product.description : ''}</textarea>
                        </div>
                        <div class="mb-3">
                            <label for="productCategory" class="form-label">Category</label>
                            <input type="text" class="form-control" id="productCategory" value="${product ? product.category : ''}" required>
                        </div>
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <label for="productPrice" class="form-label">Current Price ($)</label>
                                <input type="number" class="form-control" id="productPrice" value="${product ? product.price.toFixed(2) : '0.00'}" step="0.01" required>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Original Price ($)</label>
                                <input type="text" class="form-control" value="${product && product.originalPrice ? product.originalPrice.toFixed(2) : (product ? product.price.toFixed(2) : 'N/A')}" readonly>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label class="form-label">Discount (%)</label>
                                <input type="text" class="form-control" value="${product ? (product.discountPercentage || 0) : '0'}" readonly>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="productStock" class="form-label">Stock</label>
                            <input type="number" class="form-control" id="productStock" value="${product ? product.stock : '0'}" required>
                        </div>
                        <div class="mb-3">
                            <label for="productImageUrl" class="form-label">Image URL</label>
                            <input type="url" class="form-control" id="productImageUrl" value="${product ? product.imageUrl : ''}">
                        </div>
                        <button type="submit" class="btn btn-primary me-2">${productName ? 'Save Changes' : 'Create Product'}</button>
                        <a href="#/admin/products" class="btn btn-secondary">Cancel</a>
                    </form>
                </div>
            </div>
        `;
        // ... add form submit listener ...
    },

    // ... handleSubmit ...

    // --- Discount Modal and Handlers ---
    showDiscountModal(productName, currentDiscount) {
        // Simple prompt for discount percentage
        const newDiscount = prompt(`Enter discount percentage for ${productName} (0-100):`, currentDiscount);
        if (newDiscount === null) return; // User cancelled

        const discountPercentage = parseFloat(newDiscount);
        if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
            alert('Invalid discount percentage. Please enter a number between 0 and 100.');
            return;
        }

        if (discountPercentage === 0) {
            AdminProducts.handleRemoveDiscount(productName);
        } else {
            AdminProducts.handleApplyDiscount(productName, discountPercentage);
        }
    },

    async handleApplyDiscount(productName, discountPercentage) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productName)}/discount`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                body: JSON.stringify({ discountPercentage }),
                credentials: 'include'
            });
            if (!response.ok) throw new Error(await response.text());
            alert('Discount applied successfully!');
            AdminProducts.renderList(document.getElementById('app')); // Re-render list
        } catch (error) {
            console.error('Apply discount error:', error);
            alert(`Failed to apply discount: ${error.message}`);
        }
    },

    async handleRemoveDiscount(productName) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productName)}/discount`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
                credentials: 'include'
            });
            if (!response.ok) throw new Error(await response.text());
            alert('Discount removed successfully!');
            AdminProducts.renderList(document.getElementById('app')); // Re-render list
        } catch (error) {
            console.error('Remove discount error:', error);
            alert(`Failed to remove discount: ${error.message}`);
        }
    }
}; 