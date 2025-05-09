// client/js/script.js

// Get references to key DOM elements
const appDiv = document.getElementById('app');
const adminLinkLi = document.querySelector('.admin-link'); // Keep this to show/hide admin main nav link

// IMPORTANT: Set the base URL for your backend API
// Use http://localhost:3000/api during local development
// After deployment, change this to your deployed backend URL + /api
const API_BASE_URL = 'http://localhost:3000/api';

// --- Authentication Handling ---

async function updateAuthUI() {
    const user = await checkAuth();
    window.currentUserRole = user ? user.role : null;
    const authLinksContainer = document.getElementById('authLinksContainer');
    if (!authLinksContainer) return;

    authLinksContainer.innerHTML = ''; // Clear previous auth links

    if (user) {
        // User is logged in: Show user dropdown with person icon
        const userDropdownHtml = `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdownLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-user-circle me-1"></i>
                    <span>${user.name || user.email}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdownLink">
                    <li><span class="dropdown-item-text"><small>Role: ${user.role}</small></span></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" id="logoutButton">
                        <i class="fas fa-sign-out-alt me-1"></i>Logout
                    </a></li>
                </ul>
            </li>
        `;
        authLinksContainer.innerHTML = userDropdownHtml;

        // Remove any existing event listener for the container first
        authLinksContainer.removeEventListener('click', handleAuthContainerClick);
        
        // Then add new event listener using named function for better control
        authLinksContainer.addEventListener('click', handleAuthContainerClick);

        // Show/hide admin main nav link based on role
        if (adminLinkLi) {
        if (user.role === 'admin') {
                adminLinkLi.classList.remove('d-none');
        } else {
                adminLinkLi.classList.add('d-none');
            }
        }
    } else {
        // User is not logged in: Show Login and Register buttons with better styling
        const guestLinksHtml = `
            <li class="nav-item me-2">
                <a class="nav-link btn btn-outline-light btn-sm px-3" href="#/login">
                    <i class="fas fa-sign-in-alt me-1"></i>Login
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link btn btn-light text-dark btn-sm px-3" href="#/register">
                    <i class="fas fa-user-plus me-1"></i>Register
                </a>
            </li>
        `;
        authLinksContainer.innerHTML = guestLinksHtml;
        
        // Hide admin main nav link if not logged in
        if (adminLinkLi) {
            adminLinkLi.classList.add('d-none');
        }
    }
}

// Handler function to process clicks in the auth container
function handleAuthContainerClick(e) {
    // Check if the clicked element is the logout button or a child of it
    if (e.target.id === 'logoutButton' || e.target.closest('#logoutButton')) {
        e.preventDefault();
        
        // Immediately disable the button to prevent multiple clicks
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.classList.add('disabled');
            logoutButton.setAttribute('disabled', 'true');
            logoutButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Logging out...';
        }
        
        // Remove this event listener to prevent multiple calls
        e.currentTarget.removeEventListener('click', handleAuthContainerClick);
        
        // Proceed with logout
        handleLogout();
    }
}

// Helper function to handle logout
async function handleLogout() {
    try {
        console.log('Logout requested');
        
        // Disable logoutButton to prevent multiple clicks
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.classList.add('disabled');
            logoutButton.setAttribute('disabled', 'true');
            logoutButton.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Logging out...';
        }
        
        // Remove all event listeners from the auth container to prevent multiple calls
        const authContainer = document.getElementById('authLinksContainer');
        if (authContainer) {
            const clone = authContainer.cloneNode(true);
            authContainer.parentNode.replaceChild(clone, authContainer);
        }
        
        const response = await fetch(`${API_BASE_URL}/auth/logout`, { 
            method: 'POST', 
            credentials: 'include' 
        });
        
        if (response.ok) {
            console.log('Logout successful');
            
            // Clear any stored user data
            window.currentUserRole = null;
            
            // Use a flag to prevent multiple alerts
            if (!window.logoutAlertShown) {
                window.logoutAlertShown = true;
                alert('You have been logged out successfully.');
                
                // Reset the flag after a delay
                setTimeout(() => {
                    window.logoutAlertShown = false;
                }, 3000);
            }
            
            // Use direct URL change instead of hash change to ensure clean state
            window.location = '#/login';
            
            // Force update auth UI after logout
            setTimeout(() => {
                updateAuthUI();
            }, 100);
        } else {
            console.error('Logout failed with status:', response.status);
            alert('Logout failed: ' + ((await response.json()).message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('An error occurred during logout.');
    }
}

// Function to check authentication status by calling a protected backend endpoint
async function checkAuth() {
    try {
       const response = await fetch(`${API_BASE_URL}/auth/me`, {
           method: 'GET',
           credentials: 'include' // Send cookies
       });

       if (response.ok) {
            const data = await response.json();
            // Backend /auth/me now returns { role, email, name, _id }
            // Use these properties directly
            return { email: data.email, role: data.role, name: data.name, _id: data._id };
       } else {
           console.log('Auth check failed:', response.status, await response.text()); // Log response details on failure
           return null; // Not authenticated or token invalid
       }
   } catch (error) {
       console.error('Auth check failed:', error);
       return null; // Network error or other issue
   }
}

// --- Client-Side Routing / Page Rendering ---

// Function to render different pages based on the URL hash
async function renderPage() {
    const hash = window.location.hash || '#/';
    if(appDiv) appDiv.innerHTML = ''; // Clear main content area
    await updateAuthUI(); // Update navbar based on auth state

    // Show loading indicator while page is loading
    if (hash !== '#/' && hash !== '#/login' && hash !== '#/register') {
        appDiv.innerHTML = '<div class="text-center mt-5"><div class="spinner-border" role="status"></div><p>Loading...</p></div>';
    }

    try {
        if (hash === '#/') {
            renderHomePage();
        } else if (hash === '#/login') {
            renderLoginForm();
        } else if (hash === '#/register') {
            renderRegisterForm();
        } else if (hash === '#/products') {
            // Check for query params in hash for products page for direct navigation with filters
            const params = new URLSearchParams(hash.split('?')[1] || '');
            renderProductsPage({ 
                category: params.get('category') || '', 
                search: params.get('search') || '' 
            });
        } else if (hash.startsWith('#/products/')) {
            const parts = hash.split('/');
            const productName = decodeURIComponent(parts[parts.length - 1]); // Decode product name
            if (productName) {
                renderProductDetailPage(productName);
            } else {
                renderNotFound();
            }
        } else if (hash === '#/cart') {
            renderCartPage();
        } else if (hash === '#/checkout') {
            renderCheckoutPage();
        } else if (hash === '#/orders') {
            const user = await checkAuth();
            if (user) {
                renderOrderHistoryPage(user._id);
            } else {
                renderLoginMessage('Please log in to view your orders.');
            }
        } else if (hash.startsWith('#/admin')) {
            const user = await checkAuth();
            if (user && user.role === 'admin') {
                const adminPath = hash.substring('#/admin'.length);
                // Decode product names if they appear in edit paths
                const editMatch = adminPath.match(/^\/products\/edit\/(.+)$/);
                const editProductName = editMatch ? decodeURIComponent(editMatch[1]) : null;

                renderAdminPage(adminPath, editProductName);
            } else {
                renderAccessDenied();
            }
        } else {
            renderNotFound();
        }
    } catch (error) {
        console.error('Error rendering page:', error);
        appDiv.innerHTML = '<div class="alert alert-danger">An error occurred while loading the page. Please try again later.</div>';
    }
}

window.addEventListener('hashchange', renderPage);
// Initial render is now handled by the Stripe Redirect check at the bottom
// renderPage(); // Remove initial call here


// --- Helper functions for rendering specific page content ---

function renderHomePage() {
    appDiv.innerHTML = `
        <h2>Welcome to My Ecommerce Store!</h2>
        <p>Browse our wide selection of products.</p>
        <a href="#/products" class="btn btn-primary">View Products</a>
    `;
}

function renderLoginForm() {
    appDiv.innerHTML = `
        <h2>Login</h2>
        <form id="loginForm">
            <div class="mb-3">
                <label for="loginEmail" class="form-label">Email address</label>
                <input type="email" class="form-control" id="loginEmail" required>
            </div>
            <div class="mb-3">
                <label for="loginPassword" class="form-label">Password</label>
                <input type="password" class="form-control" id="loginPassword" required>
            </div>
            <button type="submit" class="btn btn-primary">Login</button>
             <div id="loginError" class="text-danger mt-2"></div> <!-- Area to display login errors -->
             <p class="mt-3">Don't have an account? <a href="#/register">Register here</a></p>
        </form>
    `;
    // Add event listener to the login form's submit event
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

function renderRegisterForm() {
     appDiv.innerHTML = `
        <h2>Register</h2>
        <form id="registerForm">
            <div class="mb-3">
                <label for="registerName" class="form-label">Name</label>
                <input type="text" class="form-control" id="registerName" required>
            </div>
            <div class="mb-3">
                <label for="registerEmail" class="form-label">Email address</label>
                <input type="email" class="form-control" id="registerEmail" required>
            </div>
            <div class="mb-3">
                <label for="registerPassword" class="form-label">Password</label>
                <input type="password" class="form-control" id="registerPassword" required>
            </div>
             <!-- Role selection - Maybe hide this for public registration unless intended -->
             <!-- For a simple e-commerce, typically only customer role is available for signup -->
             <!-- If admin signup is needed, might require a secret code or manual creation by existing admin -->
             <!-- For this example, we'll keep it simple, but be mindful of security -->
             <div class="mb-3">
                <label for="registerRole" class="form-label">Role</label>
                 <select class="form-select" id="registerRole" required>
                    <option value="customer">Customer</option>
                    <!-- <option value="admin">Admin</option> -- Uncomment if admin signup is allowed -->
                 </select>
            </div>
            <button type="submit" class="btn btn-primary">Register</button>
             <div id="registerError" class="text-danger mt-2"></div> <!-- Area to display registration errors -->
            <p class="mt-3">Already have an account? <a href="#/login">Login here</a></p>
        </form>
    `;
    // Add event listener to the registration form's submit event
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
     // Hide admin role option if it's not intended for public signup
     // const roleSelect = document.getElementById('registerRole');
     // if (roleSelect) {
     //      Array.from(roleSelect.options).forEach(option => {
     //          if (option.value === 'admin') {
     //              option.style.display = 'none';
     //          }
     //      });
     //       // If only customer remains, auto-select it and potentially disable select
     //       if (roleSelect.options.length === 1) {
     //           roleSelect.value = 'customer';
     //           roleSelect.disabled = true;
     //       }
     // }
}

// Renders the list of products 
async function renderProductsPage(filters = { category: '', search: '' }) {
    const { category: categoryFilter, search: searchTerm } = filters;

    // Initial HTML structure with placeholders for search and filters
    let headerHtml = `
        <div class="row mb-3">
            <div class="col-md-6">
                <label for="categoryFilter" class="form-label">Filter by Category:</label>
                <select class="form-select" id="categoryFilter">
                    <option value="">All</option> <!-- Default option -->
                    <!-- Categories will be populated here -->
                </select>
            </div>
            <div class="col-md-6">
                <label for="searchProductInput" class="form-label">Search by Name:</label>
                <div class="input-group">
                    <input type="text" class="form-control" placeholder="Enter product name..." id="searchProductInput" value="${searchTerm || ''}">
                    <button class="btn btn-primary" type="button" id="searchProductButton">Search</button>
                    <button class="btn btn-outline-secondary" type="button" id="clearSearchButton">Clear</button>
                </div>
            </div>
        </div>
    `;

    appDiv.innerHTML = `<h2>Products</h2>${headerHtml}<div id="productsList" class="row">Loading products...</div>`;

    const categorySelect = document.getElementById('categoryFilter');
    const searchInput = document.getElementById('searchProductInput');
    const searchButton = document.getElementById('searchProductButton');
    const clearSearchButton = document.getElementById('clearSearchButton');

    // Fetch and populate categories
    try {
        const categoriesResponse = await fetch(`${API_BASE_URL}/products/meta/categories`);
        if (categoriesResponse.ok) {
            const categoriesData = await categoriesResponse.json();
            const fetchedCategories = categoriesData.data;
            // Clear existing options except "All"
            categorySelect.innerHTML = '<option value="">All</option>'; 
            fetchedCategories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                if (cat === categoryFilter) {
                    option.selected = true;
                }
                categorySelect.appendChild(option);
            });
        } else {
            console.error('Failed to fetch categories');
            // Keep static options as a fallback or show an error
             categorySelect.innerHTML += `
                <option value="Men" ${categoryFilter === 'Men' ? 'selected' : ''}>Men</option>
                <option value="Women" ${categoryFilter === 'Women' ? 'selected' : ''}>Women</option>
                <option value="Kids" ${categoryFilter === 'Kids' ? 'selected' : ''}>Kids</option>
                <option value="Accessories" ${categoryFilter === 'Accessories' ? 'selected' : ''}>Accessories</option>
             `; // Fallback static categories
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to static categories on error
        categorySelect.innerHTML += `
            <option value="Men" ${categoryFilter === 'Men' ? 'selected' : ''}>Men</option>
            <option value="Women" ${categoryFilter === 'Women' ? 'selected' : ''}>Women</option>
            <option value="Kids" ${categoryFilter === 'Kids' ? 'selected' : ''}>Kids</option>
            <option value="Accessories" ${categoryFilter === 'Accessories' ? 'selected' : ''}>Accessories</option>
        `;
    }

    // Add event listener to the filter dropdown
    if (categorySelect) {
        categorySelect.addEventListener('change', (event) => {
            renderProductsPage({ category: event.target.value, search: searchInput.value });
        });
    }

    // Event listeners for search
    const performSearch = () => {
        renderProductsPage({ category: categorySelect.value, search: searchInput.value });
    };
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        renderProductsPage({ category: categorySelect.value, search: '' });
    });

    // Fetch and render products
    try {
        let apiUrl = `${API_BASE_URL}/products?`;
        const queryParams = [];
        if (categoryFilter) {
            queryParams.push(`category=${encodeURIComponent(categoryFilter)}`);
        }
        if (searchTerm) {
            queryParams.push(`search=${encodeURIComponent(searchTerm)}`);
        }
        apiUrl += queryParams.join('&');

        const response = await fetch(apiUrl);
         if (!response.ok) {
             throw new Error(`Failed to fetch products: ${response.statusText}`);
         }
        const data = await response.json();
        const products = data.data;

        const productsListDiv = document.getElementById('productsList');
        productsListDiv.innerHTML = ''; 

        if (products && products.length > 0) {
            products.forEach(product => {
                let priceHtml = `$${product.price.toFixed(2)}`;
                if (product.discountPercentage && product.discountPercentage > 0 && product.originalPrice) {
                    priceHtml = `<span class="text-danger">$${product.price.toFixed(2)}</span> <small class="text-muted text-decoration-line-through">$${product.originalPrice.toFixed(2)}</small>`;
                }

                productsListDiv.innerHTML += `
                    <div class="col-md-4 col-sm-6 mb-4">
                        <div class="card h-100">
                            <a href="#/products/${encodeURIComponent(product.name)}" class="text-decoration-none text-dark">
                                <img src="${product.imageUrl || 'https://placehold.co/250x150?text=No+Image'}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
                                <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${product.name}</h5>
                                    <p class="card-text flex-grow-1">${product.description.substring(0, 100)}...</p>
                                    <p class="card-text fw-bold">${priceHtml}</p>
                                </div>
                            </a>
                            <div class="card-footer bg-transparent border-top-0">
                                <button class="btn btn-primary w-100 add-to-cart-btn" data-product-name="${product.name}">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                button.addEventListener('click', handleAddToCart);
            });
        } else {
            productsListDiv.innerHTML = '<p>No products found matching your criteria.</p>';
        }

    } catch (error) {
        console.error('Error fetching products:', error);
        appDiv.innerHTML = '<p class="text-danger">Failed to load products.</p>';
    }
}

// Renders the detail page for a single product
async function renderProductDetailPage(productName) {
    // Show loading indicator
    appDiv.innerHTML = '<div class="text-center mt-5"><div class="spinner-border" role="status"></div><p>Loading product...</p></div>';
    
    try {
        // Fetch the product data from the API
        const response = await fetch(`${API_BASE_URL}/products/${productName}`);
        if (!response.ok) {
            appDiv.innerHTML = '<div class="alert alert-danger">Product not found.</div>';
            return;
        }
        
        const result = await response.json();
        const product = result.data;

        // Check if the product is already in the user's cart
        let cartItem = null;
        let cartItemQuantity = 0;
        
        try {
            const cartResponse = await fetch(`${API_BASE_URL}/cart`, { 
                credentials: 'include'
            });
            if (cartResponse.ok) {
                const cartData = await cartResponse.json();
                cartItem = cartData.data.find(item => item.product === product._id);
                if (cartItem) {
                    cartItemQuantity = cartItem.qty;
                }
            }
        } catch (error) {
            console.error('Error checking cart:', error);
        }
        
        // Generate the HTML for product details
        const reviewsHtml = product.reviews && product.reviews.length > 0
            ? product.reviews.map(review => {
                const date = new Date(review.createdAt).toLocaleDateString();
                const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
                const isCurrentUserReview = review.user === (window.user?._id);
                
                return `
                <div class="card mb-2">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <div class="text-warning fs-5">${stars}</div>
                                <div class="text-muted small">Posted on ${date}</div>
                            </div>
                            ${isCurrentUserReview ? `
                                <button class="btn btn-sm btn-outline-danger delete-review-btn" 
                                    data-product="${product._id}" 
                                    data-review="${review._id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                        <p class="mt-2">${review.comment}</p>
                    </div>
                </div>`;
            }).join('')
            : '<p>No reviews yet. Be the first to review this product!</p>';
            
        // Generate the review form HTML if the user is logged in
        let addReviewFormHtml = '';
        if (window.user) {
            // Check if the user has already reviewed this product
            const userReview = product.reviews && product.reviews.find(review => review.user === window.user._id);
            
            if (userReview) {
                addReviewFormHtml = `
                    <div class="card mt-4">
                        <div class="card-header">Your Review</div>
                        <div class="card-body">
                            <p>You've already reviewed this product. You gave it ${userReview.rating} stars.</p>
                            <p>${userReview.comment}</p>
                        </div>
                    </div>
                `;
            } else {
                addReviewFormHtml = `
                    <div class="card mt-4">
                        <div class="card-header">Write a Review</div>
                        <div class="card-body">
                            <form id="addReviewForm">
                                <div class="mb-3">
                                    <label class="form-label">Rating</label>
                                    <div class="rating-buttons">
                                        <button type="button" class="btn btn-outline-warning rating-btn" data-rating="1">1 ★</button>
                                        <button type="button" class="btn btn-outline-warning rating-btn" data-rating="2">2 ★</button>
                                        <button type="button" class="btn btn-outline-warning rating-btn" data-rating="3">3 ★</button>
                                        <button type="button" class="btn btn-outline-warning rating-btn" data-rating="4">4 ★</button>
                                        <button type="button" class="btn btn-outline-warning rating-btn" data-rating="5">5 ★</button>
                                    </div>
                                    <input type="hidden" id="reviewRating" required>
                                    <div id="ratingError" class="text-danger"></div>
                                </div>
                                <div class="mb-3">
                                    <label for="reviewComment" class="form-label">Your Review</label>
                                    <textarea class="form-control" id="reviewComment" rows="3" required></textarea>
                                </div>
                                <div id="reviewError" class="text-danger mb-2"></div>
                                <button type="submit" class="btn btn-primary">Submit Review</button>
                            </form>
                        </div>
                    </div>
                `;
            }
        } else {
            addReviewFormHtml = `
                <div class="alert alert-info mt-4">
                    <a href="#/login">Log in</a> to write a review.
                </div>
            `;
        }
        
        // Create cart interaction HTML based on whether item is in cart or not
        let cartInteractionHtml = '';
        
        if (cartItemQuantity > 0) {
            cartInteractionHtml = `
                <div class="cart-quantity-control">
                    <div class="input-group">
                        <button class="btn btn-outline-secondary decrement-quantity" 
                            data-product-id="${product._id}" 
                            ${cartItemQuantity <= 1 ? 'disabled' : ''}>−</button>
                        <input type="number" class="form-control text-center product-quantity" 
                            value="${cartItemQuantity}" min="0" max="${product.stock}" readonly>
                        <button class="btn btn-outline-secondary increment-quantity" 
                            data-product-id="${product._id}"
                            ${cartItemQuantity >= product.stock ? 'disabled' : ''}>+</button>
                    </div>
                    <div class="mt-2">
                        <button class="btn btn-danger w-100 remove-from-cart" 
                            data-product-id="${product._id}">Remove from Cart</button>
                    </div>
                </div>
            `;
        } else {
            cartInteractionHtml = `
                <button class="btn btn-primary add-to-cart-btn" 
                    data-product-name="${product.name}" 
                    ${product.stock <= 0 ? 'disabled' : ''}>
                    ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            `;
        }

        // For product details page, update price display
        let priceDetailHtml = `$${product.price.toFixed(2)}`;
        if (product.discountPercentage && product.discountPercentage > 0 && product.originalPrice) {
            priceDetailHtml = `<span class="text-danger">$${product.price.toFixed(2)}</span> <small class="text-muted text-decoration-line-through">$${product.originalPrice.toFixed(2)}</small>`;
        }

        // Render the product details
        appDiv.innerHTML = `
            <div class="row product-detail">
                <div class="col-md-5">
                    <img src="${product.imageUrl || 'https://via.placeholder.com/400?text=Product+Image'}" class="img-fluid" alt="${product.name}">
                </div>
                <div class="col-md-7">
                    <h2>${product.name}</h2>
                    <p class="text-muted">${product.category}</p>
                    <div class="fs-4 mb-3">
                        ${product.discountPercentage > 0 ? 
                            `<span class="text-decoration-line-through text-muted me-2">$${product.originalPrice.toFixed(2)}</span>
                             <span class="text-danger fw-bold">$${product.price.toFixed(2)}</span>
                             <span class="badge bg-danger ms-2">-${product.discountPercentage}%</span>` 
                           : `<span class="fw-bold">$${product.price.toFixed(2)}</span>`}
                    </div>
                    <p>${product.description}</p>
                    
                    <div class="stock-info mb-3">
                        ${product.stock > 10 
                            ? `<span class="text-success"><i class="fas fa-check-circle"></i> In Stock (${product.stock} available)</span>` 
                            : product.stock > 0 
                                ? `<span class="text-warning"><i class="fas fa-exclamation-circle"></i> Low Stock (Only ${product.stock} left)</span>` 
                                : `<span class="text-danger"><i class="fas fa-times-circle"></i> Out of Stock</span>`}
                    </div>
                    
                    ${cartInteractionHtml}
                </div>
            </div>
            
            <div class="row mt-5">
                <div class="col-md-8">
                    <h3>Reviews</h3>
                    <div class="reviews-container">
                        ${reviewsHtml}
                    </div>
                    
                    ${addReviewFormHtml}
                </div>
            </div>
        `;

        // Add event listener to the "Add to Cart" button (if it exists)
        const addToCartBtn = appDiv.querySelector('.add-to-cart-btn');
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', handleAddToCart);
        }
        
        // Add event listeners for the cart quantity controls
        const incrementBtn = appDiv.querySelector('.increment-quantity');
        const decrementBtn = appDiv.querySelector('.decrement-quantity');
        const removeBtn = appDiv.querySelector('.remove-from-cart');
        
        if (incrementBtn) {
            incrementBtn.addEventListener('click', async (e) => {
                const productId = e.target.dataset.productId;
                const quantityInput = appDiv.querySelector('.product-quantity');
                const newQty = parseInt(quantityInput.value) + 1;
                
                if (newQty <= product.stock) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/cart`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ productId, quantity: newQty }),
                            credentials: 'include'
                        });
                        
                        if (response.ok) {
                            quantityInput.value = newQty;
                            // Disable increment button if at max stock
                            if (newQty >= product.stock) {
                                incrementBtn.setAttribute('disabled', 'true');
                            }
                            // Enable decrement button
                            decrementBtn.removeAttribute('disabled');
                        } else {
                            console.error('Failed to update cart');
                        }
                    } catch (error) {
                        console.error('Error updating cart:', error);
                    }
                }
            });
        }
        
        if (decrementBtn) {
            decrementBtn.addEventListener('click', async (e) => {
                const productId = e.target.dataset.productId;
                const quantityInput = appDiv.querySelector('.product-quantity');
                const newQty = parseInt(quantityInput.value) - 1;
                
                if (newQty >= 1) {
                    try {
                        const response = await fetch(`${API_BASE_URL}/cart`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ productId, quantity: newQty }),
                            credentials: 'include'
                        });
                        
                        if (response.ok) {
                            quantityInput.value = newQty;
                            // Enable increment button
                            incrementBtn.removeAttribute('disabled');
                            // Disable decrement button if at 1
                            if (newQty <= 1) {
                                decrementBtn.setAttribute('disabled', 'true');
                            }
                        } else {
                            console.error('Failed to update cart');
                        }
                    } catch (error) {
                        console.error('Error updating cart:', error);
                    }
                }
            });
        }
        
        if (removeBtn) {
            removeBtn.addEventListener('click', async (e) => {
                const productId = e.target.dataset.productId;
                
                try {
                    const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    
                    if (response.ok) {
                        // Refresh the page to show "Add to Cart" button again
                        renderProductDetailPage(productName);
                    } else {
                        console.error('Failed to remove from cart');
                    }
                } catch (error) {
                    console.error('Error removing from cart:', error);
                }
            });
        }

        // Add event listener to the Add Review form (if it exists)
        const addReviewForm = document.getElementById('addReviewForm');
        if (addReviewForm) {
            // Add hidden input for product ID to make review submission more reliable
            const productIdInput = document.createElement('input');
            productIdInput.type = 'hidden';
            productIdInput.id = 'productId';
            productIdInput.value = product._id;
            addReviewForm.appendChild(productIdInput);
            
            // Set up rating buttons
            const ratingButtons = addReviewForm.querySelectorAll('.rating-btn');
            const ratingInput = document.getElementById('reviewRating');
            
            ratingButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Remove active class from all buttons
                    ratingButtons.forEach(btn => btn.classList.remove('active', 'btn-warning'));
                    btn.classList.add('btn-outline-warning');
                    
                    // Add active class to clicked button
                    this.classList.remove('btn-outline-warning');
                    this.classList.add('active', 'btn-warning');
                    
                    // Set the rating value in the hidden input
                    ratingInput.value = this.dataset.rating;
                    
                    // Clear any rating error
                    const ratingError = document.getElementById('ratingError');
                    if (ratingError) ratingError.textContent = '';
                });
            });
            
            // Handle form submission
            addReviewForm.addEventListener('submit', (event) => handleAddReview(event, productName));
        }
        
        // Add event listeners to delete review buttons
        const deleteReviewBtns = document.querySelectorAll('.delete-review-btn');
        deleteReviewBtns.forEach(button => {
            button.addEventListener('click', handleDeleteReview);
        });
        
    } catch (error) {
        console.error('Error rendering product detail:', error);
        appDiv.innerHTML = '<div class="alert alert-danger">Error loading product details. Please try again later.</div>';
    }
}

// Renders the user's shopping cart page
async function renderCartPage() {
    appDiv.innerHTML = '<h2>Your Cart</h2><div id="cartItems">Loading cart...</div><div id="cartSummary" class="mt-4"></div>';

   // Check if user is logged in, redirect if not
    const user = await checkAuth();
    if (!user) {
        renderLoginMessage('Please log in to view your cart.');
        return;
    }

   try {
       // Fetch the user's cart from the backend API (requires authentication)
       const response = await fetch(`${API_BASE_URL}/cart`, { credentials: 'include' });
        if (!response.ok) {
            // Handle authentication required specifically for cart page
            if (response.status === 401) {
                 renderLoginMessage('Please log in to view your cart.');
                 return;
            }
            throw new Error(`Failed to fetch cart: ${response.statusText}`);
        }
       const data = await response.json();
       const cartItems = data.data; // Assuming API returns cart items in 'data'

       const cartItemsDiv = document.getElementById('cartItems');
       cartItemsDiv.innerHTML = '';

       if (cartItems && cartItems.length > 0) {
            let subtotal = 0;
            
            // Fetch all product details in parallel for efficiency
            const productDetailsPromises = cartItems.map(item => 
                fetch(`${API_BASE_URL}/products/id/${item.product}`)
                    .then(res => res.ok ? res.json() : { data: null })
                    .then(data => ({ productData: data.data, cartItem: item }))
                    .catch(err => {
                        console.error(`Error fetching product ${item.product}:`, err);
                        return { productData: null, cartItem: item };
                    })
            );
            
            const productResults = await Promise.all(productDetailsPromises);
            
           for (const result of productResults) {
                const item = result.cartItem;
                const product = result.productData;
                const itemTotal = item.price * item.qty;
                subtotal += itemTotal;
                
                // Fallback values if product details couldn't be loaded
                const productName = product ? product.name : "Product";
                const productImage = product ? product.imageUrl : "https://via.placeholder.com/100x100?text=Product";
                
               cartItemsDiv.innerHTML += `
                   <div class="card mb-3">
                       <div class="card-body">
                           <div class="row align-items-center">
                               <div class="col-md-2 col-sm-3 mb-2 mb-md-0">
                                   <img src="${productImage}" alt="${productName}" class="img-fluid rounded" style="max-height: 80px;">
                               </div>
                               <div class="col-md-4 col-sm-9 mb-2 mb-md-0">
                                   <h5 class="card-title">${productName}</h5>
                                   <p class="card-text">Price: $${item.price.toFixed(2)}</p>
                               </div>
                               <div class="col-md-3 col-sm-6">
                                   <div class="input-group mb-3" style="width: 150px;">
                                       <button class="btn btn-outline-secondary update-qty-btn" type="button" data-product-id="${item.product}" data-delta="-1">-</button>
                                       <input type="number" class="form-control text-center cart-qty-input" value="${item.qty}" min="1" data-product-id="${item.product}">
                                       <button class="btn btn-outline-secondary update-qty-btn" type="button" data-product-id="${item.product}" data-delta="1">+</button>
                                   </div>
                               </div>
                               <div class="col-md-2 col-sm-6 text-end">
                                   <p class="fw-bold">$${itemTotal.toFixed(2)}</p>
                               </div>
                               <div class="col-md-1 col-sm-12 text-md-end">
                                   <button class="btn btn-sm btn-danger remove-from-cart-btn" data-product-id="${item.product}">×</button>
                               </div>
                           </div>
                       </div>
                   </div>
               `;
           }

            // Add event listeners for the quantity buttons and input changes
           document.querySelectorAll('.update-qty-btn').forEach(button => {
                button.addEventListener('click', handleUpdateCartQuantity);
            });
           document.querySelectorAll('.cart-qty-input').forEach(input => {
                input.addEventListener('change', handleUpdateCartQuantity);
            });
            document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
                button.addEventListener('click', handleRemoveFromCart);
            });

            document.getElementById('cartSummary').innerHTML = `
                <h4>Subtotal: $${subtotal.toFixed(2)}</h4>
                <a href="#/checkout" class="btn btn-success mt-3">Proceed to Checkout</a>
            `;

       } else {
           cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
            // Hide summary and checkout button if cart is empty
            document.getElementById('cartSummary').innerHTML = '';
       }

   } catch (error) {
       console.error('Error fetching cart:', error);
       appDiv.innerHTML = '<p class="text-danger">Failed to load cart.</p>';
   }
}


// Handles changing quantity or using +/- buttons in the cart page
async function handleUpdateCartQuantity(event) {
    // Determine the product ID from the button or input's data attribute
    // Using closest() handles clicks on the +/- buttons or the input itself
    const inputElement = event.target.closest('.input-group').querySelector('.cart-qty-input');
    const productId = inputElement.dataset.productId;
    let newQuantity = parseInt(inputElement.value, 10);

    // If the event came from a +/- button, adjust the quantity
    if (event.target.dataset.delta) {
        newQuantity += parseInt(event.target.dataset.delta, 10);
        // Ensure quantity is at least 1
        if (newQuantity < 1) newQuantity = 1;
        // Update the input field value visually immediately for better UX
        inputElement.value = newQuantity;
    }

    // If the quantity becomes 0 or less (only possible via direct input after the above check),
    // confirm removal before sending request.
    if (newQuantity < 1) {
        if (confirm('Quantity is 0. Do you want to remove this item from your cart?')) {
            // Call the remove handler and return
            handleRemoveFromCart({ target: { dataset: { productId: productId } } });
        } else {
            // If cancelled, revert the quantity in the input field to 1 and re-render
            inputElement.value = 1;
            renderCartPage();
        }
        return; // Stop the function here
    }

    // If quantity is valid (>= 1), send the update request
   try {
       const response = await fetch(`${API_BASE_URL}/cart`, {
           method: 'PUT',
           headers: {
               'Content-Type': 'application/json',
           },
           body: JSON.stringify({ productId, quantity: newQuantity }),
            // Include credentials to identify the user (authRequiredMiddleware will check)
            credentials: 'include'
       });

       if (response.ok) {
           console.log('Cart updated successfully');
            // Re-render the cart page to update totals (backend returns updated cart)
            renderCartPage();
       } else {
            // Handle update failure - display error and revert UI changes
            const errorData = await response.json();
            alert('Failed to update cart: ' + (errorData.message || 'Unknown error'));
            renderCartPage(); // Revert UI changes on failure
       }
   } catch (error) {
       console.error('Update cart error:', error);
       alert('An error occurred while updating cart.');
       renderCartPage(); // Revert UI changes on error
   }
}

// Handles clicking the "Remove" button in the cart page
async function handleRemoveFromCart(event) {
    // Get product ID from the button's data attribute
    const productId = event.target.dataset.productId;

    // Ask for confirmation before removing
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
        return; // If cancelled, do nothing
    }

    try {
        // Send delete request to the backend API (requires authentication)
        const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
            method: 'DELETE',
            // Include credentials to identify the user (authRequiredMiddleware will check)
            credentials: 'include'
        });

        if (response.ok) {
            console.log('Item removed from cart');
            // Re-render the cart page to show the updated cart
            renderCartPage();
        } else {
             // Handle removal failure - display error
             const errorData = await response.json();
             alert('Failed to remove item from cart: ' + (errorData.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Remove from cart error:', error);
        alert('An error occurred while removing from cart.');
    }
}


// Renders the checkout page
async function renderCheckoutPage() {
    // Check if user is logged in, redirect if not
    const user = await checkAuth();
    if (!user) {
        renderLoginMessage('Please log in to checkout.');
        return;
    }

    // Show loading message
    appDiv.innerHTML = '<h2>Checkout</h2><p>Loading your cart...</p>';

    // Fetch the current cart to display summary and ensure it's not empty
    const cartCheckResponse = await fetch(`${API_BASE_URL}/cart`, { credentials: 'include' });
     if (!cartCheckResponse.ok) {
          appDiv.innerHTML = '<p class="text-danger">Failed to load cart for checkout.</p>';
          console.error('Failed to fetch cart for checkout');
          return;
      }
     const cartData = await cartCheckResponse.json();
     const cartItems = cartData.data;

    if (!cartItems || cartItems.length === 0) {
         appDiv.innerHTML = '<h2>Checkout</h2><p>Your cart is empty. Please add items before checking out.</p><p><a href="#/products">Browse Products</a></p>';
         return;
     }
     
    // Fetch product details for all items in cart
    const productDetailsMap = {};
    await Promise.all(cartItems.map(async (item) => {
        try {
            const productResponse = await fetch(`${API_BASE_URL}/products/id/${item.product}`);
            if (productResponse.ok) {
                const productData = await productResponse.json();
                productDetailsMap[item.product] = productData.data;
            }
        } catch (error) {
            console.error(`Error fetching product ${item.product}:`, error);
        }
    }));

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    
    let shippingCost = 75; // Default
    const tempShippingAddressForDisplay = document.getElementById('shippingAddress')?.value || ''; 
    const addressLowerForDisplay = tempShippingAddressForDisplay.toLowerCase();
    if (addressLowerForDisplay.includes('cairo')) {
        shippingCost = 50;
    } else if (addressLowerForDisplay.includes('alexandria')) {
        shippingCost = 100;
    }

    const tax = subtotal * 0.14; // 14% VAT
    const total = subtotal + shippingCost + tax;

    appDiv.innerHTML = `
        <h2>Checkout</h2>
        <div class="card mb-4">
            <div class="card-body">
                <h5 class="card-title">Order Summary</h5>
                <ul class="list-group list-group-flush" id="checkoutOrderItems">
                   ${cartItems.map(item => {
                        const product = productDetailsMap[item.product];
                        const productName = product ? product.name : `Unknown Product`;
                        const imageUrl = product && product.image ? product.image : 'https://via.placeholder.com/50x50?text=Product';
                        return `
                            <li class="list-group-item d-flex align-items-center">
                                <img src="${imageUrl}" alt="${productName}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px;">
                                <div class="flex-grow-1">
                                    <strong>${productName}</strong>
                                    <div><small>Quantity: ${item.qty} × $${item.price.toFixed(2)}</small></div>
                                </div>
                                <div class="text-end">
                                    <strong>$${(item.price * item.qty).toFixed(2)}</strong>
                                </div>
                            </li>`;
                   }).join('')}
                </ul>
                <h6 class="mt-3">Subtotal: <span id="checkoutSubtotal">$${subtotal.toFixed(2)}</span></h6>
                <h6 class="mt-1">Shipping: <span id="checkoutShipping">$${shippingCost.toFixed(2)}</span></h6>
                <h6 class="mt-1">Tax (14% VAT): <span id="checkoutTax">$${tax.toFixed(2)}</span></h6>
                <h4 class="mt-2">Total: <span id="checkoutTotal">$${total.toFixed(2)}</span></h4>
            </div>
        </div>
        <form id="checkoutForm">
            <div class="mb-3">
                <label for="shippingAddress" class="form-label">Shipping Address</label>
                <input type="text" class="form-control" id="shippingAddress" required value="${tempShippingAddressForDisplay}">
                <div class="form-text">Enter full address. Shipping is $50 for Cairo, $100 for Alexandria, $75 otherwise.</div>
            </div>
            <button type="submit" class="btn btn-success">Place Order & Pay</button>
            <div id="checkoutError" class="text-danger mt-2"></div>
        </form>
         <p class="mt-3"><a href="#/cart">Return to Cart</a></p>
    `;

    const shippingAddressInput = document.getElementById('shippingAddress');
    if (shippingAddressInput) {
        shippingAddressInput.addEventListener('input', (event) => {
            const currentAddress = event.target.value.toLowerCase();
            let newShipping = 75;
            if (currentAddress.includes('cairo')) {
                newShipping = 50;
            } else if (currentAddress.includes('alexandria')) {
                newShipping = 100;
            }
            const newSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0); // Recalculate subtotal, though it doesn't change here
            const newTax = newSubtotal * 0.14;
            const newTotal = newSubtotal + newShipping + newTax;
            
            document.getElementById('checkoutShipping').textContent = `$${newShipping.toFixed(2)}`;
            document.getElementById('checkoutTax').textContent = `$${newTax.toFixed(2)}`;
            document.getElementById('checkoutTotal').textContent = `$${newTotal.toFixed(2)}`;
        });
    }
    // Ensure this ID matches the form ID and handleCheckout is defined in scope
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    } else {
        console.error('[Checkout] Checkout form not found, cannot attach submit listener.');
    }
}

// Renders the order history page for the logged-in user
async function renderOrderHistoryPage(userId) {
    // Show loading message
    appDiv.innerHTML = '<h2>My Orders</h2><div id="orderList">Loading orders...</div>';

    // Check if user is logged in (already done in renderPage, but defensive)
    const user = await checkAuth();
    if (!user) {
        renderLoginMessage('Please log in to view your orders.');
        return;
    }

    try {
        // Fetch orders for the current user from the backend API (requires authentication)
        const response = await fetch(`${API_BASE_URL}/orders/customer`, { credentials: 'include' });
        if (!response.ok) {
            // Handle authentication required specifically for order history
            if (response.status === 401) {
                renderLoginMessage('Please log in to view your orders.');
                return;
            }
            throw new Error(`Failed to fetch orders: ${response.statusText}`);
        }
        const data = await response.json();
        const orders = data.data; // Assuming API returns orders in 'data'

        const orderListDiv = document.getElementById('orderList');
        orderListDiv.innerHTML = '';

        // Check if orders were returned
        if (orders && orders.length > 0) {
            // First, collect all unique product IDs across all orders
            const allProductIds = new Set();
            orders.forEach(order => {
                order.items.forEach(item => {
                    allProductIds.add(item.product);
                });
            });
            
            // Fetch all product details in one go for efficiency
            const productDetailsMap = {};
            await Promise.all(Array.from(allProductIds).map(async (productId) => {
                try {
                    const productResponse = await fetch(`${API_BASE_URL}/products/id/${productId}`);
                    if (productResponse.ok) {
                        const productData = await productResponse.json();
                        productDetailsMap[productId] = productData.data;
                    }
                } catch (error) {
                    console.error(`Error fetching product ${productId}:`, error);
                }
            }));
            
            // Iterate through orders and create HTML for each
            orders.forEach(order => {
                let itemsHtml = '<ul class="list-group">';
                // List items in the order
                order.items.forEach(item => {
                    // Get product name from the map, or use ID if not found
                    const product = productDetailsMap[item.product];
                    const productName = product ? product.name : `Unknown Product (ID: ${item.product})`;
                    
                    itemsHtml += `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <span class="fw-bold">${productName}</span>
                                <br><small>Quantity: ${item.qty}</small>
                            </div>
                            <span>$${item.price.toFixed(2)}</span>
                        </li>
                    `;
                });
                itemsHtml += '</ul>';

                // Format date nicely with options
                const orderDate = new Date(order.createdAt);
                const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
                const formattedDate = orderDate.toLocaleDateString(undefined, dateOptions);

                // Display order details
                orderListDiv.innerHTML += `
                    <div class="card mb-4">
                        <div class="card-header d-flex justify-content-between">
                            <h5 class="mb-0">Order #${order._id}</h5>
                            <span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span>
                        </div>
                        <div class="card-body">
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <p class="mb-1"><strong>Date:</strong> ${formattedDate}</p>
                                    <p class="mb-1"><strong>Shipping Address:</strong> ${order.shippingAddress}</p>
                                </div>
                                <div class="col-md-6">
                                    <p class="mb-1"><strong>Subtotal:</strong> $${(order.total - order.shippingCost - order.tax).toFixed(2)}</p>
                                    <p class="mb-1"><strong>Shipping:</strong> $${order.shippingCost.toFixed(2)}</p>
                                    <p class="mb-1"><strong>Tax:</strong> $${order.tax.toFixed(2)}</p>
                                    <p class="mb-0"><strong>Total:</strong> $${order.total.toFixed(2)}</p>
                                </div>
                            </div>
                            <h6>Items:</h6>
                            ${itemsHtml}
                        </div>
                    </div>
                `;
            });
        } else {
            // Display message if no orders found
            orderListDiv.innerHTML = '<div class="alert alert-info">You have no orders yet.</div>';
        }
    } catch (error) {
        console.error('Error fetching order history:', error);
        appDiv.innerHTML = '<p class="text-danger">Failed to load order history.</p>';
    }
}

// Helper function to get the appropriate badge class based on order status
function getStatusBadgeClass(status) {
    switch(status) {
        case 'Pending': return 'bg-warning text-dark';
        case 'Confirmed': return 'bg-info text-dark';
        case 'Shipped': return 'bg-primary';
        case 'Delivered': return 'bg-success';
        case 'Cancelled': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

// Renders the main admin dashboard structure and delegates content rendering
async function renderAdminPage(adminPath, editProductName = null) {
    // Basic structure
    appDiv.innerHTML = `
       <h2>Admin Dashboard</h2>
       <ul class="nav nav-tabs mb-3">
           <li class="nav-item"><a class="nav-link ${adminPath === '/users' ? 'active' : ''} nav-link" href="#/admin/users">Manage Users</a></li>
           <li class="nav-item"><a class="nav-link ${adminPath.startsWith('/products') ? 'active' : ''} nav-link" href="#/admin/products">Manage Products</a></li>
           <li class="nav-item"><a class="nav-link ${adminPath === '/orders' ? 'active' : ''} nav-link" href="#/admin/orders">Manage Orders</a></li>
       </ul>
       <div id="adminContent">
           <!-- Admin content loads here -->
       </div>
    `;

    const adminContentDiv = document.getElementById('adminContent');
    if (!adminContentDiv) {
        console.error('Could not find adminContent div');
                 return;
             }

    // Check if admin module is loaded
    if (typeof window.AdminUsers === 'undefined' || 
        typeof window.AdminProducts === 'undefined' || 
        typeof window.AdminOrders === 'undefined') {
        console.error('Admin modules not loaded. Make sure the admin module files from the js/admin/ directory are included in your HTML.');
        adminContentDiv.innerHTML = `
            <div class="alert alert-danger">
                <h4>Admin Module Missing</h4>
                <p>The required admin module files could not be loaded. Please check your network connection or contact support.</p>
            </div>
        `;
                 return;
             }

    // Delegate rendering to namespaced functions from admin.js
    try {
        if (adminPath === '/users') {
            AdminUsers.renderList(adminContentDiv);
        } else if (adminPath === '/products') {
            AdminProducts.renderList(adminContentDiv);
        } else if (adminPath === '/products/new') {
            AdminProducts.renderAddForm(adminContentDiv);
        } else if (adminPath.startsWith('/products/edit/') && editProductName) {
            AdminProducts.renderEditForm(adminContentDiv, editProductName);
        } else if (adminPath === '/orders') {
            AdminOrders.renderList(adminContentDiv);
        } else {
            adminContentDiv.innerHTML = '<p>Welcome to the Admin Dashboard. Select a section from the tabs above.</p>';
        }
    } catch (error) {
        console.error('Error rendering admin section:', error);
        adminContentDiv.innerHTML = `<p class="text-danger">Error loading admin section: ${error.message}. Make sure admin.js file is loaded correctly.</p>`;
    }
}

// --- Keep generic helpers ---
function renderNotFound() {
   appDiv.innerHTML = '<h2>404 Not Found</h2><p>The page you are looking for does not exist.</p>';
}

function renderAccessDenied() {
   appDiv.innerHTML = '<h2>Access Denied</h2><p>You do not have permission to view this page.</p>';
}

function renderLoginMessage(message) {
    appDiv.innerHTML = `<h2>Login Required</h2><p>${message}</p><p><a href="#/login">Click here to login</a></p>`;
}


// --- Event Handlers for Forms and Buttons ---

// Handles login form submission
async function handleLogin(event) {
   event.preventDefault();
   const email = document.getElementById('loginEmail').value;
   const password = document.getElementById('loginPassword').value;
   const errorDiv = document.getElementById('loginError');
   errorDiv.textContent = '';

   try {
       const response = await fetch(`${API_BASE_URL}/auth/login`, {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
           },
           body: JSON.stringify({ email, password }),
           credentials: 'include'
       });

       const data = await response.json();

       if (response.ok) {
           console.log('Login successful:', data.data);
           alert('Login successful!');
           window.location.hash = '#/products'; // Redirect on success
       } else {
            console.error('Login failed:', data.message);
            errorDiv.textContent = data.message || 'Login failed. Please check your credentials.';
       }
   } catch (error) {
       console.error('Login error:', error);
       errorDiv.textContent = 'An error occurred during login. Please try again.';
   }
}

// Handles registration form submission
async function handleRegister(event) {
   event.preventDefault();
   const name = document.getElementById('registerName').value;
   const email = document.getElementById('registerEmail').value;
   const password = document.getElementById('registerPassword').value;
   // Assume role is always customer for public registration
   const role = 'customer'; // Hardcode role to 'customer' for public signup
   const errorDiv = document.getElementById('registerError');
    errorDiv.textContent = '';

    // Basic frontend validation
    if (name.trim() === '' || email.trim() === '' || password.trim() === '') {
        errorDiv.textContent = 'Please fill in all fields.';
        return;
    }
     // Add basic email format check if needed
     // if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
     //     errorDiv.textContent = 'Please enter a valid email address.';
     //     return;
     // }
     // Add password strength validation if needed

   try {
       const response = await fetch(`${API_BASE_URL}/auth/signup`, {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
           },
           body: JSON.stringify({ name, email, password, role }),
       });

       const data = await response.json();

       if (response.ok) {
           console.log('Registration successful:', data.data);
           alert('Registration successful! Please log in.');
           window.location.hash = '#/login'; // Redirect to login
       } else {
           console.error('Registration failed:', data.message);
           errorDiv.textContent = data.message || 'Registration failed. Please try again.';
       }
   } catch (error) {
       console.error('Registration error:', error);
       errorDiv.textContent = 'An error occurred during registration. Please try again.';
   }
}

// Handles clicking "Add to Cart" button on product listings or detail page
async function handleAddToCart(event) {
    // Ensure we get the button element, even if an inner element was clicked
    const button = event.target.closest('.add-to-cart-btn');
    if (!button) {
        console.error('Add to cart button not found from event target:', event.target);
        alert('Could not add to cart. Please try again.'); // User-facing error
        return;
    }
    
    // Get productId from product name (which should be a string)
    const productName = button.dataset.productName; 
    
    console.log('Using product name:', productName);

    const quantity = 1;

    const user = await checkAuth();
    if (!user) {
        alert('Please log in to add items to your cart.');
        window.location.hash = '#/login';
        return;
    }

    if (!productName) {
        console.error('Product name is missing from add-to-cart button.', button);
        alert('Could not identify product. Please try again.');
        return;
    }

    try {
        // First, look up the product ID from the name
        console.log('[Cart] Fetching product data for product name:', productName);
        const productResponse = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productName)}`, {
            credentials: 'include'
       });

        if (!productResponse.ok) {
            const errorText = await productResponse.text();
            console.error('[Cart] Failed to fetch product data. Status:', productResponse.status, 'Response:', errorText);
            alert('Failed to find product details. Please try again.');
            return;
        }
        
        const productData = await productResponse.json();
        console.log('[Cart] Raw product data from server:', JSON.stringify(productData, null, 2));

        if (!productData || !productData.data || typeof productData.data._id === 'undefined') {
            console.error('[Cart] CRITICAL: Product data or product ID is missing or undefined.', productData);
            alert('Error: Product information is incomplete. Cannot add to cart.');
        return;
    }

        const productIdFromServer = productData.data._id;
        console.log('[Cart] Retrieved product ID from server:', productIdFromServer, 'Type:', typeof productIdFromServer);

        if (typeof productIdFromServer !== 'string' || productIdFromServer.trim() === '') {
            console.error('[Cart] CRITICAL: productIdFromServer is not a valid string or is empty. Value:', productIdFromServer);
            alert('Error: Product ID is invalid. Cannot add to cart.');
        return;
    }

        const productIdString = productIdFromServer.trim(); // Ensure it's trimmed
        
        console.log('[Cart] Final productId being sent to cart API:', productIdString, 'Type:', typeof productIdString);
        
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                productId: productIdString, 
                quantity 
            }),
            credentials: 'include'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response from server.'}));
            console.error('[Cart] Add to cart server error. Status:', response.status, 'Error Data:', errorData);
            alert('Failed to add item to cart: ' + (errorData.message || 'Unknown server error'));
            return;
        }

            const data = await response.json();
        console.log('[Cart] Item added to cart successfully:', data.data);
            alert('Item added to cart!');
    } catch (error) {
        console.error('[Cart] General error in handleAddToCart:', error);
        alert('An unexpected error occurred while adding to cart.');
    }
}

// Handles adding a review to a product
async function handleAddReview(event, productNameForLookup) {
    event.preventDefault();
    const ratingInput = document.getElementById('reviewRating');
    const commentInput = document.getElementById('reviewComment');
    const errorDiv = document.getElementById('reviewError');
    const ratingErrorDiv = document.getElementById('ratingError');
    if(errorDiv) errorDiv.textContent = '';
    if(ratingErrorDiv) ratingErrorDiv.textContent = '';

    const rating = parseInt(ratingInput.value, 10);
    const comment = commentInput.value;

    if (!ratingInput.value || isNaN(rating) || rating < 1 || rating > 5) {
        if(ratingErrorDiv) ratingErrorDiv.textContent = 'Please select a rating by clicking one of the buttons.';
        return;
    }
    if (!comment || comment.trim() === '') {
        if(errorDiv) errorDiv.textContent = 'Please provide a comment.';
        return;
    }

    try {
        // Get the hidden product ID from the form or the product detail data directly
        const productIdInput = document.getElementById('productId');
        let productId;
        
        if (productIdInput && productIdInput.value) {
            // Use value from hidden input if available
            productId = productIdInput.value;
            console.log('[Review] Using product ID from form:', productId);
        } else {
            // Otherwise, fetch product ID by name
            console.log('[Review] Fetching product ID for name:', productNameForLookup);
            const productResponse = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productNameForLookup)}`, { 
                credentials: 'include' 
            });
            
            if (!productResponse.ok) {
                if(errorDiv) errorDiv.textContent = 'Failed to find product. Please try again.';
                return;
            }
            
            const productData = await productResponse.json();
            productId = productData.data._id;
        }
        
        console.log('[Review] Submitting review for product ID:', productId);
        console.log('[Review] Review details - Rating:', rating, 'Comment:', comment);
        
        // Submit the review using product ID
        const reviewResponse = await fetch(`${API_BASE_URL}/products/id/${productId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rating, comment }),
            credentials: 'include' 
        });

        if (!reviewResponse.ok) {
            const errorData = await reviewResponse.json().catch(() => ({ message: 'Failed to parse error response' }));
            console.error('[Review] Add review failed:', errorData.message || reviewResponse.statusText);
            if(errorDiv) errorDiv.textContent = errorData.message || 'Failed to add review.';
            
            if (reviewResponse.status === 401) {
                alert('You must be logged in to add a review.');
                window.location.hash = '#/login';
            }
            return;
        }

        const reviewSubmitData = await reviewResponse.json();
        console.log('[Review] Review added successfully:', reviewSubmitData.data);
        alert('Review added successfully!');
        
        // Re-render the product page to show the new review
        renderProductDetailPage(productNameForLookup);
        
    } catch (error) {
        console.error('[Review] General error in handleAddReview:', error);
        if(errorDiv) errorDiv.textContent = 'An error occurred while adding the review.';
    }
}

// --- Add new handler function for deleting reviews ---

async function handleDeleteReview(event) {
    const button = event.target;
    const productName = button.dataset.productName;
    const reviewId = button.dataset.reviewId;

    if (!confirm(`Are you sure you want to delete review ${reviewId} for product ${productName}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(productName)}/reviews/${reviewId}`, {
             method: 'DELETE',
            credentials: 'include' // Requires admin auth on backend
         });

         if (response.ok) {
            alert('Review deleted successfully!');
            // Re-render the product detail page to reflect the change
            renderProductDetailPage(productName);
         } else {
              const errorData = await response.json();
            alert(`Failed to delete review: ${errorData.message || 'Unknown error'}`);
            if (response.status === 401 || response.status === 403) renderAccessDenied();
         }
     } catch (error) {
        console.error('Delete review error:', error);
        alert('An error occurred while deleting the review.');
    }
}

// --- Stripe Redirect Handling ---
document.addEventListener('DOMContentLoaded', function() {
    console.log('Checking for checkout redirect...');
    
    // Check URL for redirect parameters using a more robust approach
    const currentUrl = window.location.href;
    console.log('Current URL:', currentUrl);
    
    // Advanced URL parsing to handle various Stripe return patterns
    if (currentUrl.includes('checkout-success') || 
        currentUrl.includes('success=true') || 
        currentUrl.includes('payment_status=success')) {
        
        // Extract orderId from URL
        const urlParams = new URLSearchParams(window.location.search);
        const orderIdFromUrl = urlParams.get('orderId') || urlParams.get('order_id');
        console.log('Success redirect detected, orderId:', orderIdFromUrl);
        
        if (orderIdFromUrl) {
            handleCheckoutRedirect(orderIdFromUrl, true);
         } else {
            console.error('No order ID found in success redirect URL');
            appDiv.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    <h4>Payment Possibly Successful</h4>
                    <p>Your payment was processed, but we couldn't verify your order details.</p>
                    <p>Please check your order history or contact customer support.</p>
                </div>
                <p class="mt-3"><a href="#/orders" class="btn btn-primary">View My Orders</a></p>
            `;
            
            // Clean up URL
            history.replaceState(null, '', '/');
        }
    } else if (currentUrl.includes('checkout-cancel') || 
              currentUrl.includes('success=false') || 
              currentUrl.includes('payment_status=cancel')) {
        console.log('Cancel redirect detected');
        handleCheckoutRedirect(null, false);
    } else {
        // Normal page rendering
        console.log('No checkout redirect detected, rendering page normally');
        renderPage();
    }
});

// Make sure handleCheckout sends tax and shipping to backend
async function handleCheckout(event) {
    event.preventDefault();
    const shippingAddress = document.getElementById('shippingAddress').value;
    const errorDiv = document.getElementById('checkoutError');
    if(errorDiv) errorDiv.textContent = '';

    if (shippingAddress.trim() === '') {
        if(errorDiv) errorDiv.textContent = 'Please enter a shipping address.';
        return;
    }

    const cartCheckResponse = await fetch(`${API_BASE_URL}/cart`, { credentials: 'include' });
    if (!cartCheckResponse.ok) {
        if(errorDiv) errorDiv.textContent = 'Could not retrieve cart details for checkout.';
        console.error('[Checkout] Failed to fetch cart for checkout');
        return;
    }
    const cartData = await cartCheckResponse.json();
    if (!cartData.data || cartData.data.length === 0) {
        if(errorDiv) errorDiv.textContent = 'Your cart is empty. Cannot checkout.';
         return;
     }

    // Calculate shipping based on address
    let shippingCost = 75; // Default
    const addressLower = shippingAddress.toLowerCase();
    if (addressLower.includes('cairo')) {
        shippingCost = 50;
    } else if (addressLower.includes('alexandria')) {
        shippingCost = 100;
    }
    
    // Calculate subtotal
    const subtotal = cartData.data.reduce((sum, item) => sum + item.price * item.qty, 0);
    const tax = subtotal * 0.14; // 14% VAT
    const total = subtotal + shippingCost + tax;

    console.log('[Checkout] Order summary:', {
        subtotal: subtotal,
        shipping: shippingCost,
        tax: tax,
        total: total,
        address: shippingAddress
    });

    try {
        // Send only the address to the backend; let the server calculate shipping, tax, and total
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                address: shippingAddress
            }),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
            console.error('[Checkout] Checkout failed:', errorData.message);
            if(errorDiv) errorDiv.textContent = errorData.message || 'Checkout failed. Please try again or contact support.';
            return;
        }
        
        const data = await response.json();
        if (data.sessionUrl) {
            console.log('[Checkout] Order created, redirecting to Stripe:', data.orderId);
            alert('Redirecting to payment...');
            
            // Store order details in sessionStorage before redirect (helps with recovery)
            sessionStorage.setItem('pendingOrderId', data.orderId);
            sessionStorage.setItem('pendingOrderTotal', total.toFixed(2));
            
            window.location.href = data.sessionUrl;
         } else {
            console.error('[Checkout] Checkout failed: No session URL received');
            if(errorDiv) errorDiv.textContent = 'Could not initialize payment. Please try again or contact support.';
         }
     } catch (error) {
        console.error('[Checkout] Checkout error:', error);
        if(errorDiv) errorDiv.textContent = 'An error occurred during checkout.';
    }
}

async function handleCheckoutRedirect(orderId, isSuccess) {
    console.log(`Handling checkout redirect: success=${isSuccess}, orderId=${orderId}`);
    
    if (isSuccess && orderId) {
        try {
            // Update the order status to "Confirmed" after successful payment
            const updateResponse = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'Confirmed' }),
                credentials: 'include'
            }).catch(err => {
                console.error('Error updating order status:', err);
                return null;
            });
            
            if (updateResponse && updateResponse.ok) {
                console.log('Order status updated to Confirmed');
            }
            
            // Display success message
            appDiv.innerHTML = `
                <div class="alert alert-success" role="alert">
                    <h4 class="alert-heading">Order Successful!</h4>
                    <p>Your order #${orderId} has been placed and confirmed.</p>
                    <p>Thank you for your purchase!</p>
                </div>
                <p class="mt-3"><a href="#/orders" class="btn btn-primary">View My Orders</a></p>
            `;
            
            // Clear the pending order from sessionStorage
            sessionStorage.removeItem('pendingOrderId');
            sessionStorage.removeItem('pendingOrderTotal');
        } catch (error) {
            console.error('Error handling successful checkout:', error);
            appDiv.innerHTML = `
                <div class="alert alert-success" role="alert">
                    <h4 class="alert-heading">Payment Received!</h4>
                    <p>Your payment was successful, but we encountered an error checking your order status.</p>
                    <p>Your order #${orderId} should be processed shortly.</p>
                </div>
                <p class="mt-3"><a href="#/orders" class="btn btn-primary">View My Orders</a></p>
            `;
        }
    } else { // isCancel or missing orderId
        appDiv.innerHTML = `
            <div class="alert alert-warning" role="alert">
                <h4 class="alert-heading">Checkout Cancelled</h4>
                <p>Your order was not completed. Your cart has NOT been cleared.</p>
            </div>
            <p class="mt-3"><a href="#/cart" class="btn btn-primary">Return to Cart</a></p>
        `;
        
        // Keep pending order info in case user wants to retry
    }

    // Clean up URL to avoid coming back to this redirect on refresh
    history.replaceState(null, '', '/');
    
    // Change hash separately to avoid full page reload
    setTimeout(() => {
        if (isSuccess) {
            window.location.hash = '#/orders';
        } else {
            window.location.hash = '#/cart';
        }
    }, 500);
}

// Expose API_BASE_URL to the window for admin.js to access
window.API_BASE_URL = API_BASE_URL;
