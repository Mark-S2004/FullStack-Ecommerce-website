// Check if the file exists

window.AdminProducts = {
    // --- Rendering Functions ---

    async renderList(container) {
        container.innerHTML = '<h3>Manage Products</h3><p><a href="#/admin/products/new" class="btn btn-success mb-3">Add New Product</a></p><div id="adminProductsList">Loading products...</div>';
        try {
            const response = await fetch(`${API_BASE_URL}/products`, { credentials: 'include' });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    renderAccessDenied(); 
                    return;
                }
                throw new Error(`Failed to fetch products: ${response.statusText}`);
            }
            const data = await response.json();
            const products = data.data;

            const productListDiv = document.getElementById('adminProductsList');
            if (products && products.length > 0) {
                let productsHtml = `
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Original Price</th>
                                <th>Discount</th>
                                <th>Final Price</th>
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
            console.error('Error fetching products for admin:', error);
            container.innerHTML = '<p class="text-danger">Failed to load products.</p>';
        }
    },

    navigateToEdit(productName) {
        window.location.hash = `#/admin/products/edit/${encodeURIComponent(productName)}`;
    },

    async renderEditForm(container, productName) {
        container.innerHTML = '<h3>' + (productName ? 'Edit' : 'Add New') + ' Product</h3><div id="productFormContainer">Loading...</div>';
        
        let product = null;
        if (productName) {
            try {
                const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productName)}`, { 
                    credentials: 'include' 
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch product details');
                }
                const data = await response.json();
                product = data.data;
            } catch (error) {
                console.error('Error fetching product:', error);
                container.innerHTML = `<p class="text-danger">Failed to load product: ${error.message}</p>`;
                return;
            }
        }

        // Get categories for dropdown
        let categories = [];
        try {
            const catResponse = await fetch(`${API_BASE_URL}/products/meta/categories`, { 
                credentials: 'include' 
            });
            if (catResponse.ok) {
                const catData = await catResponse.json();
                categories = catData.data || [];
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Continue with empty categories
        }

        // Create options for category dropdown
        const categoryOptions = categories.map(cat => 
            `<option value="${cat}" ${product && product.category === cat ? 'selected' : ''}>${cat}</option>`
        ).join('');
        
        const formContainer = document.getElementById('productFormContainer');
        formContainer.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <form id="productForm" class="row g-3">
                        <input type="hidden" id="originalProductName" value="${product ? product.name : ''}">
                        
                        <div class="col-md-6">
                            <label for="productName" class="form-label">Product Name</label>
                            <input type="text" class="form-control" id="productName" value="${product ? product.name : ''}" required>
                        </div>
                        
                        <div class="col-md-6">
                            <label for="productCategory" class="form-label">Category</label>
                            ${categories.length > 0 ?
                                `<select class="form-select" id="productCategory" required>
                                    <option value="">Select Category</option>
                                    ${categoryOptions}
                                    <option value="new">+ Add New Category</option>
                                </select>
                                <input type="text" class="form-control mt-2 ${!product || categories.includes(product.category) ? 'd-none' : ''}" id="newCategoryInput" placeholder="Enter new category name">` :
                                `<input type="text" class="form-control" id="productCategory" value="${product ? product.category : ''}" required>`
                            }
                        </div>
                        
                        <div class="col-12">
                            <label for="productDescription" class="form-label">Description</label>
                            <textarea class="form-control" id="productDescription" rows="4" required>${product ? product.description : ''}</textarea>
                        </div>
                        
                        <div class="col-md-4">
                            <label for="productPrice" class="form-label">Price ($)</label>
                            <input type="number" class="form-control" id="productPrice" min="0" step="0.01" value="${product ? product.price : ''}" required>
                        </div>
                        
                        <div class="col-md-4">
                            <label for="productStock" class="form-label">Stock</label>
                            <input type="number" class="form-control" id="productStock" min="0" step="1" value="${product ? product.stock : '0'}" required>
                        </div>
                        
                        <div class="col-md-4">
                            <label for="productDiscount" class="form-label">Discount (%)</label>
                            <input type="number" class="form-control" id="productDiscount" min="0" max="100" step="1" value="${product ? (product.discountPercentage || 0) : 0}">
                        </div>
                        
                        <div class="col-12">
                            <label for="productImageUrl" class="form-label">Image URL</label>
                            <input type="url" class="form-control" id="productImageUrl" value="${product ? (product.imageUrl || '') : ''}">
                            <div class="form-text">Enter URL to product image (leave empty for default placeholder)</div>
                        </div>
                        
                        ${product && product.imageUrl ? `
                        <div class="col-12 mt-2">
                            <div class="card">
                                <div class="card-body text-center">
                                    <p>Current Image Preview:</p>
                                    <img src="${product.imageUrl}" alt="${product.name}" class="img-thumbnail" style="max-height: 150px;">
                                </div>
                            </div>
                        </div>` : ''}
                        
                        <div class="col-12 mt-3">
                            <button type="submit" class="btn btn-primary me-2">${productName ? 'Update Product' : 'Create Product'}</button>
                            <a href="#/admin/products" class="btn btn-secondary">Cancel</a>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Add event listeners for category dropdown
        const categorySelect = document.getElementById('productCategory');
        const newCategoryInput = document.getElementById('newCategoryInput');
        
        if (categorySelect && categorySelect.tagName === 'SELECT') {
            categorySelect.addEventListener('change', function() {
                if (this.value === 'new') {
                    newCategoryInput.classList.remove('d-none');
                    newCategoryInput.required = true;
                    newCategoryInput.focus();
                } else {
                    newCategoryInput.classList.add('d-none');
                    newCategoryInput.required = false;
                }
            });
        }
        
        // Add form submit handler
        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(product);
        });
    },

    async handleSubmit(existingProduct) {
        try {
            // Get form values
            const name = document.getElementById('productName').value;
            const originalName = document.getElementById('originalProductName').value;
            
            // Handle category (could be select or input)
            let category;
            const categorySelect = document.getElementById('productCategory');
            if (categorySelect.tagName === 'SELECT') {
                category = categorySelect.value === 'new' 
                    ? document.getElementById('newCategoryInput').value 
                    : categorySelect.value;
            } else {
                category = categorySelect.value;
            }
            
            const productData = {
                name: name,
                description: document.getElementById('productDescription').value,
                category: category,
                price: parseFloat(document.getElementById('productPrice').value),
                stock: parseInt(document.getElementById('productStock').value, 10),
                discountPercentage: parseFloat(document.getElementById('productDiscount').value || '0'),
                imageUrl: document.getElementById('productImageUrl').value || undefined
            };
            
            // If discount is applied, add original price
            if (productData.discountPercentage > 0) {
                // Calculate what the original price should be
                const discountFactor = 1 - (productData.discountPercentage / 100);
                productData.originalPrice = productData.price / discountFactor;
            }
            
            let url, method;
            if (existingProduct) {
                url = `${API_BASE_URL}/products/${encodeURIComponent(originalName)}`;
                method = 'PUT';
            } else {
                url = `${API_BASE_URL}/products`;
                method = 'POST';
            }
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(productData),
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save product');
            }
            
            alert(`Product ${existingProduct ? 'updated' : 'created'} successfully!`);
            window.location.hash = '#/admin/products';
            
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product: ' + error.message);
        }
    },

    // --- Other handler functions (delete, discount) ---
    async handleDelete(productName) {
        if (!confirm(`Are you sure you want to delete the product "${productName}"? This action cannot be undone.`)) {
            return;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productName)}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete product');
            }
            
            alert('Product deleted successfully!');
            // Refresh the product list
            this.renderList(document.getElementById('adminContent'));
            
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product: ' + error.message);
        }
    },

    // --- Discount Modal and Handlers ---
    showDiscountModal(productName, currentDiscount) {
        // Create a modal for discount management
        const modalId = 'discountModal';
        let modalDiv = document.getElementById(modalId);
        
        // Create the modal if it doesn't exist
        if (!modalDiv) {
            modalDiv = document.createElement('div');
            modalDiv.id = modalId;
            modalDiv.className = 'modal fade';
            modalDiv.tabIndex = '-1';
            modalDiv.setAttribute('aria-labelledby', 'discountModalLabel');
            modalDiv.setAttribute('aria-hidden', 'true');
            document.body.appendChild(modalDiv);
        }
        
        // Populate the modal
        modalDiv.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="discountModalLabel">Manage Discount for "${productName}"</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="discountForm">
                            <div class="mb-3">
                                <label for="discountPercentage" class="form-label">Discount Percentage (%)</label>
                                <input type="number" class="form-control" id="discountPercentage" min="0" max="100" step="1" value="${currentDiscount}" required>
                                <div class="form-text">Enter a value between 0 and 100. Enter 0 to remove the discount.</div>
                            </div>
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle"></i> Setting a discount will automatically calculate the new price from the original price.
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" id="removeDiscountBtn">Remove Discount</button>
                        <button type="button" class="btn btn-primary" id="applyDiscountBtn">Apply Discount</button>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize and show the modal
        const modal = new bootstrap.Modal(modalDiv);
        modal.show();
        
        // Add event listeners for the buttons
        document.getElementById('applyDiscountBtn').addEventListener('click', () => {
            const discountInput = document.getElementById('discountPercentage');
            const discountPercentage = parseFloat(discountInput.value);
            
            if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
                alert('Please enter a valid discount percentage between 0 and 100.');
                return;
            }
            
            if (discountPercentage === 0) {
                this.handleRemoveDiscount(productName, modal);
            } else {
                this.handleApplyDiscount(productName, discountPercentage, modal);
            }
        });
        
        document.getElementById('removeDiscountBtn').addEventListener('click', () => {
            this.handleRemoveDiscount(productName, modal);
        });
    },
    
    async handleApplyDiscount(productName, discountPercentage, modal) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productName)}/discount`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ discountPercentage }),
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to apply discount');
            }
            
            // Close the modal
            modal.hide();
            
            alert('Discount applied successfully!');
            // Refresh the product list
            this.renderList(document.getElementById('adminContent'));
            
        } catch (error) {
            console.error('Error applying discount:', error);
            alert('Failed to apply discount: ' + error.message);
        }
    },
    
    async handleRemoveDiscount(productName, modal) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productName)}/discount`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to remove discount');
            }
            
            // Close the modal
            modal.hide();
            
            alert('Discount removed successfully!');
            // Refresh the product list
            this.renderList(document.getElementById('adminContent'));
            
        } catch (error) {
            console.error('Error removing discount:', error);
            alert('Failed to remove discount: ' + error.message);
        }
    }
}; 