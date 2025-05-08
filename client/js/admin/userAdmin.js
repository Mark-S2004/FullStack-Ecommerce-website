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
                     renderAccessDenied(); return;
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
                         <td>${user.name}</td>
                         <td>${user.email}</td>
                         <td>${user.role}</td>
                         <td>
                             <button class="btn btn-sm btn-warning" onclick="AdminUsers.handleEdit('${user._id}')">Edit</button>
                             <button class="btn btn-sm btn-danger" onclick="AdminUsers.handleDelete('${user._id}', '${user.name}')">Delete</button>
                         </td>
                     </tr>
                 `).join('');
                 usersHtml += '</tbody></table>';
            } else {
                usersHtml = '<p>No users found.</p>';
            }
            container.innerHTML = usersHtml;

        } catch (error) {
            console.error('Error fetching users for admin:', error);
            container.innerHTML = '<p class="text-danger">Failed to load users.</p>';
        }
    },

    // Placeholder/Navigation for editing a user
    handleEdit(userId) {
        // TODO: Implement edit user form rendering and submission
        // Similar pattern to AdminProducts.renderEditForm and handleEditSubmit
        // Would likely navigate to #/admin/users/edit/:userId
        alert(`Editing user ${userId} - Functionality not implemented yet.`);
    },

    // --- Action Handlers ---

    // Handles deleting a user
    async handleDelete(userId, userName) {
         if (!confirm(`Are you sure you want to delete user "${userName}" (ID: ${userId})? This action cannot be undone.`)) {
             return;
         }

         try {
              const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                  method: 'DELETE',
                  credentials: 'include' // Requires admin auth
              });

              if (response.ok) {
                  alert('User deleted successfully!');
                   // Re-render the user list
                   this.renderList(document.getElementById('adminContent'));
              } else {
                   const errorData = await response.json();
                   alert('Failed to delete user: ' + (errorData.message || 'Unknown error'));
                   if (response.status === 401 || response.status === 403) renderAccessDenied();
              }
          } catch (error) {
               console.error('Delete user error:', error);
               alert('An error occurred while deleting the user.');
          }
    }
}; 