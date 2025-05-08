// Inside renderAddForm in productAdmin.js
        container.innerHTML = `
            <div class="card">
                <div class="card-header"><h3>Add New Product</h3></div>
                <div class="card-body">
                    <form id="adminAddProductForm">
                        // ... name, description, price, stock fields ...
                        <div class="mb-3">
                            <label for="productCategory" class="form-label">Category</label>
                            <input type="text" class="form-control" id="productCategory">
                        </div>
                        <div class="mb-3">
                            <label for="productGender" class="form-label">Gender (e.g., Men, Women, Unisex)</label>
                            <input type="text" class="form-control" id="productGender">
                        </div>
                        // ... image fields if any ...
                        <button type="submit" class="btn btn-primary">Add Product</button>
                        <a href="#/admin/products" class="btn btn-secondary">Cancel</a>
                    </form>
                </div>
            </div>
        `;
        document.getElementById('adminAddProductForm').addEventListener('submit', AdminProducts.handleAdd);

// Inside handleAdd in productAdmin.js, collect these new fields:
        const category = document.getElementById('productCategory').value;
        const gender = document.getElementById('productGender').value;
        const productData = { name, description, price: parseFloat(price), stock: parseInt(stock), category, gender };

// Similar changes for renderEditForm and handleEdit, ensuring values are pre-filled and collected. 