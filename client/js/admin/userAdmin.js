// client/js/admin/userAdmin.js

window.AdminUsers = {
    // --- Rendering Functions ---

    // Renders the user management section for admin
    async renderList(container) {
        container.innerHTML = '<h3>Manage Users</h3><p>Loading users...</p>';
        try {
            const response = await fetch(`${API_BASE_URL}/users`, { credentials: 'include' });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    renderAccessDenied(); 
                    return;
                }
                throw new Error(`Failed to fetch users: ${response.statusText}`);
            }
            const data = await response.json();
            const users = data.data;

            let usersHtml = '';
            if (users && users.length > 0) {
                usersHtml += `
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                usersHtml += users.map(user => `
                    <tr>
                        <td>${user._id}</td>
                        <td>${user.name || 'N/A'}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                        <td>
                            <button class="btn btn-sm btn-warning edit-user-btn" data-user-id="${user._id}">Edit</button>
                            <button class="btn btn-sm btn-danger delete-user-btn" data-user-id="${user._id}" data-user-name="${user.name || user.email}">Delete</button>
                        </td>
                    </tr>
                `).join('');
                usersHtml += '</tbody></table>';
            } else {
                usersHtml = '<p>No users found.</p>';
            }
            container.innerHTML = `
                <h3>Manage Users</h3>
                ${usersHtml}
            `;

            // Add event listeners for the buttons
            document.querySelectorAll('.edit-user-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    this.handleEdit(e.target.dataset.userId);
                });
            });

            document.querySelectorAll('.delete-user-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    this.handleDelete(e.target.dataset.userId, e.target.dataset.userName);
                });
            });

        } catch (error) {
            console.error('Error fetching users for admin:', error);
            container.innerHTML = '<p class="text-danger">Failed to load users.</p>';
        }
    },

    // Edit user - render modal with user details for editing
    async handleEdit(userId) {
        try {
            // Prepare the modal
            const modalHtml = `
                <div class="modal fade" id="editUserModal" tabindex="-1" aria-labelledby="editUserModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="editUserModalLabel">Edit User</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p>Loading user details...</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Add modal to the DOM if it doesn't exist
            let modalContainer = document.getElementById('modalContainer');
            if (!modalContainer) {
                modalContainer = document.createElement('div');
                modalContainer.id = 'modalContainer';
                document.body.appendChild(modalContainer);
            }
            modalContainer.innerHTML = modalHtml;
            
            // Initialize the modal
            const modalElement = document.getElementById('editUserModal');
            const userModal = new bootstrap.Modal(modalElement);
            
            // Show the modal with loading state
            userModal.show();
            
            // Fetch user details
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch user details');
            }
            
            const userData = await response.json();
            const user = userData.data;
            
            // Update modal with the user form
            const modalBody = document.querySelector('#editUserModal .modal-body');
            modalBody.innerHTML = `
                <form id="editUserForm">
                    <input type="hidden" id="editUserId" value="${user._id}">
                    <div class="mb-3">
                        <label for="editUserName" class="form-label">Name</label>
                        <input type="text" class="form-control" id="editUserName" value="${user.name || ''}" placeholder="User's name">
                    </div>
                    <div class="mb-3">
                        <label for="editUserEmail" class="form-label">Email</label>
                        <input type="email" class="form-control" id="editUserEmail" value="${user.email}" required>
                    </div>
                    <div class="mb-3">
                        <label for="editUserRole" class="form-label">Role</label>
                        <select class="form-select" id="editUserRole" required>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                            <option value="customer" ${user.role === 'customer' ? 'selected' : ''}>Customer</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="editUserPassword" class="form-label">New Password (leave blank to keep current)</label>
                        <input type="password" class="form-control" id="editUserPassword">
                        <div class="form-text">Only fill this if you want to change the user's password</div>
                    </div>
                    <div class="alert alert-danger d-none" id="editUserError"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            `;
            
            // Add submit handler to the form
            document.getElementById('editUserForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const errorDisplay = document.getElementById('editUserError');
                errorDisplay.classList.add('d-none');
                
                try {
                    const userData = {
                        name: document.getElementById('editUserName').value,
                        email: document.getElementById('editUserEmail').value,
                        role: document.getElementById('editUserRole').value
                    };
                    
                    // Only include password if provided
                    const password = document.getElementById('editUserPassword').value;
                    if (password) {
                        userData.password = password;
                    }
                    
                    const updateResponse = await fetch(`${API_BASE_URL}/users/${userId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(userData),
                        credentials: 'include'
                    });
                    
                    if (!updateResponse.ok) {
                        const errorData = await updateResponse.json();
                        throw new Error(errorData.message || 'Failed to update user');
                    }
                    
                    // Close the modal
                    userModal.hide();
                    
                    // Show success message
                    alert('User updated successfully!');
                    
                    // Refresh the user list
                    this.renderList(document.getElementById('adminContent'));
                    
                } catch (error) {
                    console.error('Error updating user:', error);
                    errorDisplay.textContent = error.message;
                    errorDisplay.classList.remove('d-none');
                }
            });
            
        } catch (error) {
            console.error('Error in handleEdit:', error);
            alert('Failed to load user details. Please try again.');
        }
    },
    
    // Handle deleting a user
    async handleDelete(userId, userName) {
        if (!confirm(`Are you sure you want to delete user "${userName}" (ID: ${userId})? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete user');
            }

            alert('User deleted successfully!');
            // Re-render the user list
            this.renderList(document.getElementById('adminContent'));
        } catch (error) {
            console.error('Delete user error:', error);
            alert('An error occurred while deleting the user: ' + error.message);
        }
    }
} 