// client/js/admin/discountAdmin.js
window.AdminDiscounts = {
    // Renders the discount management list
    async renderList(container) {
        container.innerHTML = '<h3>Manage Discounts</h3><p><a href="#/admin/discounts/new" class="btn btn-success mb-3">Add New Discount</a></p><div id="adminDiscountsList">Loading discounts...</div>';
        const listDiv = document.getElementById('adminDiscountsList');

        try {
            const response = await fetch(`${API_BASE_URL}/discounts`, { credentials: 'include' });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) { renderAccessDenied(); return; }
                throw new Error(`Failed to fetch discounts: ${response.statusText}`);
            }
            const result = await response.json();
            const discounts = result.data;

            if (discounts && discounts.length > 0) {
                let html = `
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Type</th>
                                <th>Value</th>
                                <th>Active</th>
                                <th>Min Purchase</th>
                                <th>Valid From</th>
                                <th>Valid To</th>
                                <th>Usage</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                html += discounts.map(d => `
                    <tr>
                        <td>${d.code}</td>
                        <td>${d.discountType}</td>
                        <td>${d.discountType === 'percentage' ? d.value + '%' : '$' + (d.value / 100).toFixed(2)}</td>
                        <td>${d.isActive ? 'Yes' : 'No'}</td>
                        <td>$${(d.minPurchase / 100).toFixed(2)}</td>
                        <td>${d.validFrom ? new Date(d.validFrom).toLocaleDateString() : 'N/A'}</td>
                        <td>${d.validTo ? new Date(d.validTo).toLocaleDateString() : 'N/A'}</td>
                        <td>${d.timesUsed !== undefined ? d.timesUsed : 'N/A'} / ${d.usageLimit !== undefined ? d.usageLimit : 'Unlimited'}</td>
                        <td>
                            <button class="btn btn-sm btn-primary me-2" onclick="AdminDiscounts.navigateToEdit('${d._id}')">Edit</button>
                            <button class="btn btn-sm btn-danger" onclick="AdminDiscounts.handleDelete('${d._id}')">Delete</button>
                        </td>
                    </tr>
                `).join('');
                html += '</tbody></table>';
                listDiv.innerHTML = html;
            } else {
                listDiv.innerHTML = '<p>No discounts found.</p>';
            }
        } catch (error) {
            console.error('Error rendering discounts:', error);
            listDiv.innerHTML = '<p class="text-danger">Error loading discounts. Check console.</p>';
        }
    },

    navigateToEdit(discountId) {
        window.location.hash = `#/admin/discounts/edit/${discountId}`;
    },

    // Renders the form for adding or editing a discount
    async renderForm(container, discountId = null) {
        let currentDiscount = null;
        if (discountId) {
            try {
                const response = await fetch(`${API_BASE_URL}/discounts/${discountId}`, { credentials: 'include' });
                if (!response.ok) throw new Error('Failed to fetch discount details');
                currentDiscount = (await response.json()).data;
            } catch (error) {
                container.innerHTML = `<p class="text-danger">Error loading discount for editing: ${error.message}</p>`;
                return;
            }
        }

        container.innerHTML = `
            <div class="card">
                <div class="card-header"><h3>${discountId ? 'Edit' : 'Add New'} Discount</h3></div>
                <div class="card-body">
                    <form id="adminDiscountForm">
                        <input type="hidden" id="discountId" value="${discountId || ''}">
                        <div class="mb-3">
                            <label for="discountCode" class="form-label">Code</label>
                            <input type="text" class="form-control" id="discountCode" required value="${currentDiscount?.code || ''}">
                        </div>
                        <div class="mb-3">
                            <label for="discountDescription" class="form-label">Description</label>
                            <input type="text" class="form-control" id="discountDescription" value="${currentDiscount?.description || ''}">
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="discountType" class="form-label">Type</label>
                                <select class="form-select" id="discountType" required>
                                    <option value="percentage" ${currentDiscount?.discountType === 'percentage' ? 'selected' : ''}>Percentage</option>
                                    <option value="fixedAmount" ${currentDiscount?.discountType === 'fixedAmount' ? 'selected' : ''}>Fixed Amount (in cents)</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="discountValue" class="form-label">Value</label>
                                <input type="number" class="form-control" id="discountValue" required min="0" value="${currentDiscount?.value || ''}">
                            </div>
                        </div>
                        <div class="mb-3 form-check">
                            <input type="checkbox" class="form-check-input" id="discountIsActive" ${currentDiscount?.isActive !== false ? 'checked' : ''}>
                            <label class="form-check-label" for="discountIsActive">Is Active</label>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="discountValidFrom" class="form-label">Valid From (Optional)</label>
                                <input type="date" class="form-control" id="discountValidFrom" value="${currentDiscount?.validFrom ? new Date(currentDiscount.validFrom).toISOString().split('T')[0] : ''}">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="discountValidTo" class="form-label">Valid To (Optional)</label>
                                <input type="date" class="form-control" id="discountValidTo" value="${currentDiscount?.validTo ? new Date(currentDiscount.validTo).toISOString().split('T')[0] : ''}">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="discountMinPurchase" class="form-label">Minimum Purchase (in cents, 0 for no minimum)</label>
                            <input type="number" class="form-control" id="discountMinPurchase" min="0" value="${currentDiscount?.minPurchase || 0}">
                        </div>
                        <div class="mb-3">
                            <label for="discountApplicableProducts" class="form-label">Applicable Product IDs (comma-separated, optional)</label>
                            <input type="text" class="form-control" id="discountApplicableProducts" value="${currentDiscount?.applicableProducts?.join(', ') || ''}">
                        </div>
                        <div class="mb-3">
                            <label for="discountApplicableCategories" class="form-label">Applicable Categories (comma-separated, optional)</label>
                            <input type="text" class="form-control" id="discountApplicableCategories" value="${currentDiscount?.applicableCategories?.join(', ') || ''}">
                        </div>
                        <div class="mb-3">
                            <label for="discountUsageLimit" class="form-label">Usage Limit (0 or empty for unlimited)</label>
                            <input type="number" class="form-control" id="discountUsageLimit" min="0" value="${currentDiscount?.usageLimit || ''}">
                        </div>
                        <button type="submit" class="btn btn-primary">${discountId ? 'Update' : 'Create'} Discount</button>
                        <a href="#/admin/discounts" class="btn btn-secondary">Cancel</a>
                    </form>
                </div>
            </div>
        `;
        document.getElementById('adminDiscountForm').addEventListener('submit', AdminDiscounts.handleSubmit);
    },

    // Handles form submission for add/edit
    async handleSubmit(event) {
        event.preventDefault();
        const discountId = document.getElementById('discountId').value;
        const data = {
            code: document.getElementById('discountCode').value.toUpperCase(),
            description: document.getElementById('discountDescription').value,
            discountType: document.getElementById('discountType').value,
            value: parseFloat(document.getElementById('discountValue').value),
            isActive: document.getElementById('discountIsActive').checked,
            validFrom: document.getElementById('discountValidFrom').value || null,
            validTo: document.getElementById('discountValidTo').value || null,
            minPurchase: parseInt(document.getElementById('discountMinPurchase').value) || 0,
            applicableProducts: document.getElementById('discountApplicableProducts').value.split(',').map(id => id.trim()).filter(id => id),
            applicableCategories: document.getElementById('discountApplicableCategories').value.split(',').map(cat => cat.trim()).filter(cat => cat),
            usageLimit: document.getElementById('discountUsageLimit').value ? parseInt(document.getElementById('discountUsageLimit').value) : null,
        };

        // Remove null dates for backend DTO validation if IsDateString is strict
        if (!data.validFrom) delete data.validFrom;
        if (!data.validTo) delete data.validTo;
        if (data.usageLimit === null) delete data.usageLimit;
        if (!data.applicableProducts.length) delete data.applicableProducts;
        if (!data.applicableCategories.length) delete data.applicableCategories;


        const url = discountId ? `${API_BASE_URL}/discounts/${discountId}` : `${API_BASE_URL}/discounts`;
        const method = discountId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || `Failed to ${discountId ? 'update' : 'create'} discount`);
            }
            alert(`Discount ${discountId ? 'updated' : 'created'} successfully!`);
            window.location.hash = '#/admin/discounts';
        } catch (error) {
            console.error(`Error ${discountId ? 'updating' : 'creating'} discount:`, error);
            alert(`Error: ${error.message}`);
        }
    },

    // Handles discount deletion
    async handleDelete(discountId) {
        if (!confirm('Are you sure you want to delete this discount?')) return;
        try {
            const response = await fetch(`${API_BASE_URL}/discounts/${discountId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete discount');
            }
            alert('Discount deleted successfully!');
            AdminDiscounts.renderList(document.getElementById('app')); // Re-render the list
        } catch (error) {
            console.error('Error deleting discount:', error);
            alert(`Error deleting discount: ${error.message}`);
        }
    }
}; 