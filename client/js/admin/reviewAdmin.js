// client/js/admin/reviewAdmin.js

window.AdminReviews = {
    // Renders the review management section
    async renderList(container) {
        container.innerHTML = '<h3>Manage Reviews</h3><div id="adminReviewList">Loading reviews...</div>';
        const reviewListDiv = document.getElementById('adminReviewList');

        try {
            const response = await fetch(`${API_BASE_URL}/reviews`, { credentials: 'include' });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    renderAccessDenied(); // Assumes this function exists globally
                    return;
                }
                throw new Error(`Failed to fetch reviews: ${response.statusText}`);
            }
            const result = await response.json();
            const reviews = result.data;

            if (reviews && reviews.length > 0) {
                let reviewsHtml = `
                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User</th>
                                <th>Product</th>
                                <th>Rating</th>
                                <th>Comment</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                reviewsHtml += reviews.map(review => `
                    <tr>
                        <td>${review._id}</td>
                        <td>${review.user ? (review.user.name || review.user.email) : 'N/A'}</td>
                        <td>${review.product ? review.product.name : 'N/A'}</td>
                        <td>${review.rating}</td>
                        <td>${review.comment.substring(0, 50)}${review.comment.length > 50 ? '...' : ''}</td>
                        <td>${new Date(review.createdAt).toLocaleDateString()}</td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="AdminReviews.handleDelete('${review._id}')">Delete</button>
                        </td>
                    </tr>
                `).join('');
                reviewsHtml += '</tbody></table>';
                reviewListDiv.innerHTML = reviewsHtml;
            } else {
                reviewListDiv.innerHTML = '<p>No reviews found.</p>';
            }
        } catch (error) {
            console.error('Error rendering reviews:', error);
            reviewListDiv.innerHTML = '<p class="text-danger">Error loading reviews. Check console.</p>';
            // renderAccessDenied(); // Or a more generic error message
        }
    },

    // Handles review deletion
    async handleDelete(reviewId) {
        if (!confirm('Are you sure you want to delete this review?')) {
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    renderAccessDenied(); return;
                }
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to delete review: ${response.statusText}`);
            }
            alert('Review deleted successfully!');
            AdminReviews.renderList(document.getElementById('app')); // Re-render the list (or specific container)
        } catch (error) {
            console.error('Error deleting review:', error);
            alert(`Error deleting review: ${error.message}`);
        }
    }
}; 