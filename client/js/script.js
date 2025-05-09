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
    window.user = user; // Ensure window.user is set with the full user object
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
                    <li><a class="dropdown-item" href="#/profile"><i class="fas fa-user-edit me-1"></i>View/Edit Profile</a></li>
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
        } else if (hash === '#/profile') {
            const user = await checkAuth();
            if (user) {
                renderUserProfilePage(user);
            } else {
                renderLoginMessage('Please log in to view your profile.');
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
    let currentFilters = filters; // Store for refresh

    let headerHtml = `
        <div class="row mb-3">
            <div class="col-md-6">
                <label for="categoryFilter" class="form-label">Filter by Category:</label>
                <select class="form-select" id="categoryFilter">
                    <option value="">All</option>
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

    try {
        const categoriesResponse = await fetch(`${API_BASE_URL}/products/meta/categories`);
        if (categoriesResponse.ok) {
            const categoriesData = await categoriesResponse.json();
            const fetchedCategories = categoriesData.data;
            categorySelect.innerHTML = '<option value="">All</option>'; 
            fetchedCategories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                if (cat === categoryFilter) option.selected = true;
                categorySelect.appendChild(option);
            });
        } else {
            console.error('Failed to fetch categories');
            categorySelect.innerHTML += `<option value="Men" ${categoryFilter === 'Men' ? 'selected' : ''}>Men</option><option value="Women" ${categoryFilter === 'Women' ? 'selected' : ''}>Women</option><option value="Kids" ${categoryFilter === 'Kids' ? 'selected' : ''}>Kids</option><option value="Accessories" ${categoryFilter === 'Accessories' ? 'selected' : ''}>Accessories</option>`;
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
        categorySelect.innerHTML += `<option value="Men" ${categoryFilter === 'Men' ? 'selected' : ''}>Men</option><option value="Women" ${categoryFilter === 'Women' ? 'selected' : ''}>Women</option><option value="Kids" ${categoryFilter === 'Kids' ? 'selected' : ''}>Kids</option><option value="Accessories" ${categoryFilter === 'Accessories' ? 'selected' : ''}>Accessories</option>`;
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', (event) => {
            renderProductsPage({ category: event.target.value, search: searchInput.value });
        });
    }

    const performSearch = () => {
        renderProductsPage({ category: categorySelect.value, search: searchInput.value });
    };
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') performSearch();
    });
    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        renderProductsPage({ category: categorySelect.value, search: '' });
    });

    // Fetch cart items to display correct cart controls on product cards
    let cartItemsMap = new Map();
    const loggedInUser = await checkAuth(); // Use a different variable name to avoid conflict if window.user is used elsewhere
    if (loggedInUser) {
        try {
            const cartResponse = await fetch(`${API_BASE_URL}/cart`, { credentials: 'include' });
            if (cartResponse.ok) {
                const cartData = await cartResponse.json();
                if (cartData.data) {
                    cartData.data.forEach(item => cartItemsMap.set(item.product, item.qty)); // Assuming item.product is the product ID
                }
            }
        } catch (error) {
            console.warn('Could not fetch cart for product list display:', error);
        }
    }

    try {
        let apiUrl = `${API_BASE_URL}/products?`;
        const queryParams = [];
        if (categoryFilter) queryParams.push(`category=${encodeURIComponent(categoryFilter)}`);
        if (searchTerm) queryParams.push(`search=${encodeURIComponent(searchTerm)}`);
        apiUrl += queryParams.join('&');

        const response = await fetch(apiUrl);
         if (!response.ok) throw new Error(`Failed to fetch products: ${response.statusText}`);
        const data = await response.json();
        const products = data.data; // Ensure products have _id field

        const productsListDiv = document.getElementById('productsList');
        productsListDiv.innerHTML = ''; 

        if (products && products.length > 0) {
            products.forEach(product => {
                let priceHtml = `$${product.price.toFixed(2)}`;
                if (product.discountPercentage && product.discountPercentage > 0 && product.originalPrice) {
                    priceHtml = `<span class="text-danger">$${product.price.toFixed(2)}</span> <small class="text-muted text-decoration-line-through">$${product.originalPrice.toFixed(2)}</small>`;
                }

                let cartInteractionHtml = '';
                const cartQuantity = cartItemsMap.get(product._id); // Product._id is crucial here

                if (cartQuantity > 0) {
                    cartInteractionHtml = `
                        <div class="input-group input-group-sm mb-1">
                            <button class="btn btn-outline-secondary product-list-qty-change" data-product-id="${product._id}" data-delta="-1" ${cartQuantity <= 1 ? 'disabled' : ''}>−</button>
                            <input type="number" class="form-control text-center product-list-qty-input" value="${cartQuantity}" min="1" max="${product.stock}" readonly data-product-id="${product._id}">
                            <button class="btn btn-outline-secondary product-list-qty-change" data-product-id="${product._id}" data-delta="1" ${cartQuantity >= product.stock ? 'disabled' : ''}>+</button>
                        </div>
                        <button class="btn btn-sm btn-outline-danger w-100 product-list-remove-from-cart" data-product-id="${product._id}">Remove</button>
                    `;
                } else {
                    cartInteractionHtml = `<button class="btn btn-primary w-100 add-to-cart-btn" data-product-name="${product.name}" data-product-id="${product._id}" ${product.stock <= 0 ? 'disabled' : ''}>Add to Cart</button>`;
                }

                productsListDiv.innerHTML += `
                    <div class="col-md-4 col-sm-6 mb-4">
                        <div class="card h-100">
                            <a href="#/products/${encodeURIComponent(product.name)}" class="text-decoration-none text-dark">
                                <img src="${product.imageUrl || 'https://placehold.co/250x150?text=No+Image'}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
                                <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${product.name}</h5>
                                    <p class="card-text flex-grow-1">${product.description.substring(0, 60)}...</p>
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
                    <div class="input-group mb-3">
                        <button class="btn btn-outline-primary decrement-quantity" 
                            data-product-id="${product._id}" 
                            ${cartItemQuantity <= 1 ? 'disabled' : ''}>−</button>
                        <input type="number" class="form-control text-center product-quantity" 
                            value="${cartItemQuantity}" min="1" max="${product.stock}" readonly>
                        <button class="btn btn-outline-primary increment-quantity" 
                            data-product-id="${product._id}"
                            ${cartItemQuantity >= product.stock ? 'disabled' : ''}>+</button>
                    </div>
                    <button class="btn btn-danger w-100 remove-from-cart" 
                        data-product-id="${product._id}">
                        <i class="fas fa-trash-alt me-1"></i>Remove from Cart
                    </button>
                </div>
            `;
        } else {
            cartInteractionHtml = `
                <button class="btn btn-primary add-to-cart-btn" 
                    data-product-name="${product.name}" 
                    ${product.stock <= 0 ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart me-1"></i>
                    ${product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            `;
        }

        // For product details page, update price display
        let priceDetailHtml = `$${product.price.toFixed(2)}`;
        if (product.discountPercentage && product.discountPercentage > 0 && product.originalPrice) {
            priceDetailHtml = `<span class="text-danger fs-4">$${product.price.toFixed(2)}</span> 
                              <span class="text-muted text-decoration-line-through ms-2">$${product.originalPrice.toFixed(2)}</span>
                              <span class="badge bg-danger ms-2">-${product.discountPercentage}%</span>`;
        }

        // Render the product details
        appDiv.innerHTML = `
            <div class="row product-detail">
                <div class="col-md-5">
                    <img src="${product.imageUrl || 'https://via.placeholder.com/400?text=Product+Image'}" class="img-fluid rounded mb-3" alt="${product.name}">
                </div>
                <div class="col-md-7">
            <h2>${product.name}</h2>
                    <p class="text-muted">${product.category}</p>
                    <div class="mb-3">
                        ${priceDetailHtml}
                </div>
                    <p>${product.description}</p>
                    
                    <div class="stock-info mb-3">
                        ${product.stock > 10 
                            ? `<span class="text-success"><i class="fas fa-check-circle"></i> In Stock (${product.stock} available)</span>` 
                            : product.stock > 0 
                                ? `<span class="text-warning"><i class="fas fa-exclamation-circle"></i> Low Stock (Only ${product.stock} left)</span>` 
                                : `<span class="text-danger"><i class="fas fa-times-circle"></i> Out of Stock</span>`}
            </div>
                    
                    <div id="cartControls">
                        ${cartInteractionHtml}
                    </div>
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
            addToCartBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                // Show processing state
                const originalText = addToCartBtn.innerHTML;
                addToCartBtn.disabled = true;
                addToCartBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
                
                try {
                    await handleAddToCart(e);
                    
                    // Refresh the product page to show updated cart controls
                    renderProductDetailPage(productName);
                } catch (error) {
                    console.error('Error adding to cart:', error);
                    addToCartBtn.disabled = false;
                    addToCartBtn.innerHTML = originalText;
                }
            });
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
                        // Disable buttons during update
                        incrementBtn.disabled = true;
                        decrementBtn.disabled = true;
                        
                        const response = await fetch(`${API_BASE_URL}/cart`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ productId, quantity: newQty }),
                            credentials: 'include'
                        });
                        
                        if (response.ok) {
                            quantityInput.value = newQty;
                            // Enable buttons based on new quantity
                            decrementBtn.disabled = false;
                            incrementBtn.disabled = newQty >= product.stock;
                        } else {
                            console.error('Failed to update cart');
                            alert('Failed to update quantity');
                        }
                    } catch (error) {
                        console.error('Error updating cart:', error);
                        alert('Error updating quantity');
                    }
                } else {
                    alert(`Sorry, only ${product.stock} items available in stock.`);
                }
            });
        }
        
        if (decrementBtn) {
            decrementBtn.addEventListener('click', async (e) => {
                const productId = e.target.dataset.productId;
                const quantityInput = appDiv.querySelector('.product-quantity');
                const newQty = parseInt(quantityInput.value) - 1;
                
                // Disable buttons during update
                incrementBtn.disabled = true;
                decrementBtn.disabled = true;
                
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
                            // Enable increment button since we decreased
                            incrementBtn.disabled = false;
                            // Disable decrement button if we're at 1
                            decrementBtn.disabled = newQty <= 1;
                        } else {
                            console.error('Failed to update cart');
                            alert('Failed to update quantity');
                        }
                    } catch (error) {
                        console.error('Error updating cart:', error);
                        alert('Error updating quantity');
                    }
                } else if (newQty === 0) {
                    // If quantity would be 0, remove from cart entirely
                    try {
                        const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
                            method: 'DELETE',
                            credentials: 'include'
                        });
                        
                        if (response.ok) {
                            // Refresh product page to show "Add to Cart" button
                            renderProductDetailPage(productName);
                        } else {
                            console.error('Failed to remove from cart');
                            alert('Failed to remove from cart');
                            decrementBtn.disabled = false;
                        }
                    } catch (error) {
                        console.error('Error removing from cart:', error);
                        alert('Error removing from cart');
                        decrementBtn.disabled = false;
                    }
                }
            });
        }
        
        if (removeBtn) {
            removeBtn.addEventListener('click', async (e) => {
                const productId = e.target.closest('.remove-from-cart').dataset.productId;
                
                // Disable the button during processing
                removeBtn.disabled = true;
                removeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removing...';
                
                try {
                    const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    
                    if (response.ok) {
                        // Refresh the page to show "Add to Cart" button
                        renderProductDetailPage(productName);
                    } else {
                        console.error('Failed to remove from cart');
                        alert('Failed to remove from cart');
                        removeBtn.disabled = false;
                        removeBtn.innerHTML = '<i class="fas fa-trash-alt me-1"></i>Remove from Cart';
                    }
    } catch (error) {
                    console.error('Error removing from cart:', error);
                    alert('Error removing from cart');
                    removeBtn.disabled = false;
                    removeBtn.innerHTML = '<i class="fas fa-trash-alt me-1"></i>Remove from Cart';
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


// --- Global state for applied coupon ---
let appliedCoupon = {
    code: null,
    discountAmount: 0,
    isValid: false
};

// Function to update the checkout summary display
async function updateCheckoutTotalsUI() {
    // Ensure elements exist before trying to read/write them.
    const shippingAddressInput = document.getElementById('shippingAddress');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const discountEl = document.getElementById('checkoutDiscount');
    const shippingEl = document.getElementById('checkoutShipping');
    const taxEl = document.getElementById('checkoutTax');
    const totalEl = document.getElementById('checkoutTotal');

    // If critical elements for calculation/display aren't present, abort.
    if (!shippingAddressInput || !subtotalEl || !discountEl || !shippingEl || !taxEl || !totalEl) {
        console.warn('[Checkout UI] One or more summary elements not found. Cannot update totals.');
        return;
    }

    const cartResponse = await fetch(`${API_BASE_URL}/cart`, { credentials: 'include' });
    if (!cartResponse.ok) {
        console.error('Failed to fetch cart for summary update');
        // Potentially show an error to the user or revert coupon application if this happens after apply
        return;
    }
    const cartData = await cartResponse.json();
    const cartItems = cartData.data || [];

    const shippingAddress = shippingAddressInput.value;
    let subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    
    let shippingCost = 75; // Default shipping
    const addressLower = shippingAddress.toLowerCase();
    if (addressLower.includes('cairo')) shippingCost = 50;
    else if (addressLower.includes('alexandria')) shippingCost = 100;

    let discountToApply = 0;
    if (appliedCoupon.isValid && appliedCoupon.code) {
        discountToApply = appliedCoupon.discountAmount;
    }

    const subtotalAfterDiscount = subtotal - discountToApply;
    const tax = subtotalAfterDiscount > 0 ? subtotalAfterDiscount * 0.14 : 0; 
    const total = subtotalAfterDiscount + shippingCost + tax;

    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    discountEl.textContent = `- $${discountToApply.toFixed(2)}`;
    shippingEl.textContent = `$${shippingCost.toFixed(2)}`;
    taxEl.textContent = `$${tax.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
}

async function renderCheckoutPage() {
    const user = await checkAuth();
    if (!user) {
        renderLoginMessage('Please log in to checkout.');
        return;
    }
    appDiv.innerHTML = '<h2>Checkout</h2><p>Loading your cart...</p>';

    appliedCoupon = { code: null, discountAmount: 0, isValid: false }; // Reset coupon state

    const cartCheckResponse = await fetch(`${API_BASE_URL}/cart`, { credentials: 'include' });
     if (!cartCheckResponse.ok) {
          appDiv.innerHTML = '<p class="text-danger">Failed to load cart for checkout.</p>';
          return;
      }
     const cartData = await cartCheckResponse.json();
     const cartItems = cartData.data;

    if (!cartItems || cartItems.length === 0) {
         appDiv.innerHTML = '<h2>Checkout</h2><p>Your cart is empty. Please add items before checking out.</p><p><a href="#/products">Browse Products</a></p>';
         return;
     }
     
    const productDetailsMap = {};
    await Promise.all(cartItems.map(async (item) => {
        try {
            const productResponse = await fetch(`${API_BASE_URL}/products/id/${item.product}`);
            if (productResponse.ok) {
                const productData = await productResponse.json();
                productDetailsMap[item.product] = productData.data;
            }
        } catch (error) { console.error(`Error fetching product ${item.product}:`, error); }
    }));

    appDiv.innerHTML = `
        <h2>Checkout</h2>
        <div class="card mb-4">
            <div class="card-body">
                <h5 class="card-title">Order Summary</h5>
                <ul class="list-group list-group-flush" id="checkoutOrderItems">
                   ${cartItems.map(item => {
                        const product = productDetailsMap[item.product];
                        const productName = product ? product.name : `Unknown Product`;
                        const imageUrl = product && product.imageUrl ? product.imageUrl : 'https://via.placeholder.com/50x50?text=Product';
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
                <h6 class="mt-3">Subtotal: <span id="checkoutSubtotal">$0.00</span></h6>
                <h6 class="mt-1 text-success">Discount: <span id="checkoutDiscount">- $0.00</span></h6>
                <h6 class="mt-1">Shipping: <span id="checkoutShipping">$0.00</span></h6>
                <h6 class="mt-1">Tax (14%): <span id="checkoutTax">$0.00</span></h6>
                <h4 class="mt-2">Total: <span id="checkoutTotal">$0.00</span></h4>
            </div>
        </div>
        <form id="checkoutForm">
            <div class="mb-3">
                <label for="shippingAddress" class="form-label">Shipping Address</label>
                <input type="text" class="form-control" id="shippingAddress" required value="">
                <div class="form-text">Enter full address. Shipping: Cairo ($50), Alexandria ($100), Others ($75).</div>
            </div>
            <div class="row mb-3">
                <div class="col-md-8">
                    <label for="couponCode" class="form-label">Coupon Code</label>
                    <input type="text" class="form-control" id="couponCode" placeholder="Enter coupon code">
                </div>
                <div class="col-md-4 d-flex align-items-end">
                    <button class="btn btn-outline-primary w-100" type="button" id="applyCouponBtn">Apply Coupon</button>
                </div>
            </div>
            <div id="couponMessage" class="mb-2"></div>
            <button type="submit" class="btn btn-success">Place Order & Pay</button>
            <div id="checkoutError" class="text-danger mt-2"></div>
        </form>
         <p class="mt-3"><a href="#/cart">Return to Cart</a></p>
    `;

    const shippingAddressInput = document.getElementById('shippingAddress');
    if (shippingAddressInput) {
        shippingAddressInput.addEventListener('input', updateCheckoutTotalsUI);
    }
    
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', handleApplyCoupon);
    }

    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }
    await updateCheckoutTotalsUI(); // Initial call to set totals based on current cart and default address/coupon state
}

async function handleApplyCoupon() {
    const couponCodeInput = document.getElementById('couponCode');
    const couponCode = couponCodeInput.value.trim().toUpperCase();
    const couponMessageDiv = document.getElementById('couponMessage');
    const applyBtn = document.getElementById('applyCouponBtn');

    if (!couponCode) {
        couponMessageDiv.textContent = 'Please enter a coupon code.';
        couponMessageDiv.className = 'mb-2 text-danger';
        return;
    }

    applyBtn.disabled = true;
    applyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Applying...';
    couponMessageDiv.textContent = ''; 

    try {
        // Backend endpoint: POST /api/coupons/validate (or similar)
        // Expected request: { couponCode: "CODE" }
        // Expected response on success (200 OK): { isValid: true, discountAmount: 10.00, message: "Coupon applied!" }
        // Expected response on failure (400/404): { isValid: false, message: "Invalid coupon" }
        const response = await fetch(`${API_BASE_URL}/coupons/validate`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ couponCode }), 
            credentials: 'include'
        });

        const data = await response.json();
        if (response.ok && data.isValid) {
            appliedCoupon = { code: couponCode, discountAmount: data.discountAmount, isValid: true };
            couponMessageDiv.textContent = data.message || `Coupon "${couponCode}" applied! Discount: $${data.discountAmount.toFixed(2)}`;
            couponMessageDiv.className = 'mb-2 text-success';
            couponCodeInput.disabled = true;
            applyBtn.textContent = 'Applied';
        } else {
            appliedCoupon = { code: null, discountAmount: 0, isValid: false };
            couponMessageDiv.textContent = data.message || 'Invalid or expired coupon.';
            couponMessageDiv.className = 'mb-2 text-danger';
            applyBtn.disabled = false;
            applyBtn.innerHTML = 'Apply Coupon';
        }
    } catch (error) {
        console.error("Apply coupon error:", error);
        appliedCoupon = { code: null, discountAmount: 0, isValid: false }; 
        couponMessageDiv.textContent = 'Error applying coupon. Please try again.';
        couponMessageDiv.className = 'mb-2 text-danger';
        applyBtn.disabled = false;
        applyBtn.innerHTML = 'Apply Coupon';
    }
    await updateCheckoutTotalsUI(); 
}

async function handleCheckout(event) {
    event.preventDefault();
    const shippingAddress = document.getElementById('shippingAddress').value;
    const errorDiv = document.getElementById('checkoutError');
    if(errorDiv) errorDiv.textContent = '';

    if (shippingAddress.trim() === '') {
        if(errorDiv) errorDiv.textContent = 'Please enter a shipping address.';
        return;
    }

    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    const cartCheckResponse = await fetch(`${API_BASE_URL}/cart`, { credentials: 'include' });
    if (!cartCheckResponse.ok) {
        if(errorDiv) errorDiv.textContent = 'Could not retrieve fresh cart details. Please try again.';
        submitButton.disabled = false; submitButton.innerHTML = originalButtonText;
        return;
    }
    const cartData = await cartCheckResponse.json();
    if (!cartData.data || cartData.data.length === 0) {
        if(errorDiv) errorDiv.textContent = 'Your cart is empty. Cannot checkout.';
        submitButton.disabled = false; submitButton.innerHTML = originalButtonText;
         return;
     }

    // Backend calculates all financial details. Client sends address and potentially applied coupon code.
    const orderPayload = {
        address: shippingAddress,
        couponCode: appliedCoupon.isValid ? appliedCoupon.code : null 
    };
    
    console.log('[Checkout] Final order payload for /api/orders:', orderPayload);

    try {
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
            console.error('[Checkout] Checkout failed:', errorData.message);
            if(errorDiv) errorDiv.textContent = errorData.message || 'Checkout failed. Please try again or contact support.';
            submitButton.disabled = false; submitButton.innerHTML = originalButtonText;
            return;
        }
        
        const data = await response.json();
        if (data.sessionUrl) {
            console.log('[Checkout] Order created, redirecting to Stripe:', data.orderId);
            sessionStorage.setItem('pendingOrderId', data.orderId);
            alert('Redirecting to payment gateway...');
            window.location.href = data.sessionUrl;
         } else {
            console.error('[Checkout] Checkout failed: No session URL received');
            if(errorDiv) errorDiv.textContent = 'Could not initialize payment. Please try again or contact support.';
            submitButton.disabled = false; submitButton.innerHTML = originalButtonText;
         }
     } catch (error) {
        console.error('[Checkout] Checkout error:', error);
        if(errorDiv) errorDiv.textContent = 'An error occurred during checkout.';
        submitButton.disabled = false; submitButton.innerHTML = originalButtonText;
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

// Renders user profile page with editable fields
async function renderUserProfilePage(user) {
    appDiv.innerHTML = '<h2>Your Profile</h2><div id="profileContainer">Loading profile data...</div>';
    
    try {
        // Get latest user data
        const response = await fetch(`${API_BASE_URL}/auth/me`, { 
            credentials: 'include' 
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const userData = await response.json();
        
        // Create the profile form
        const profileContainer = document.getElementById('profileContainer');
        profileContainer.innerHTML = `
            <div class="row">
                <div class="col-md-8 mx-auto">
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            <h5 class="mb-0"><i class="fas fa-user-circle me-2"></i>Profile Information</h5>
                        </div>
                        <div class="card-body">
                            <form id="profileForm" class="needs-validation" novalidate>
                                <div class="mb-3">
                                    <label for="profileName" class="form-label">Name</label>
                                    <input type="text" class="form-control" id="profileName" value="${userData.name || ''}" required>
                                    <div class="invalid-feedback">Please provide your name.</div>
                                </div>
                                <div class="mb-3">
                                    <label for="profileEmail" class="form-label">Email address</label>
                                    <input type="email" class="form-control" id="profileEmail" value="${userData.email}" required>
                                    <div class="invalid-feedback">Please provide a valid email address.</div>
                                </div>
                                <hr>
                                <div class="mb-3">
                                    <label for="currentPassword" class="form-label">Current Password</label>
                                    <input type="password" class="form-control" id="currentPassword">
                                    <div class="form-text">Leave password fields empty if you don't want to change your password.</div>
                                </div>
                                <div class="mb-3">
                                    <label for="newPassword" class="form-label">New Password</label>
                                    <input type="password" class="form-control" id="newPassword">
                                </div>
                                <div class="mb-3">
                                    <label for="confirmPassword" class="form-label">Confirm New Password</label>
                                    <input type="password" class="form-control" id="confirmPassword">
                                    <div class="invalid-feedback" id="passwordMismatch">Passwords don't match.</div>
                                </div>
                                <div id="profileError" class="alert alert-danger d-none"></div>
                                <div id="profileSuccess" class="alert alert-success d-none"></div>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-save me-1"></i>Save Changes
                                </button>
                            </form>
                        </div>
                    </div>
                    
                    <div class="card mt-4">
                        <div class="card-header bg-info text-white">
                            <h5 class="mb-0"><i class="fas fa-shopping-bag me-2"></i>Quick Links</h5>
                        </div>
                        <div class="card-body">
                            <div class="d-grid gap-2">
                                <a href="#/orders" class="btn btn-outline-primary">
                                    <i class="fas fa-box me-2"></i>View Your Orders
                                </a>
                                <a href="#/cart" class="btn btn-outline-primary">
                                    <i class="fas fa-shopping-cart me-2"></i>View Your Cart
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listener for form submission
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', handleUpdateProfile);
        }
        
        // Add password confirmation validation
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        
        if (newPasswordInput && confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', function() {
                if (newPasswordInput.value && this.value && this.value !== newPasswordInput.value) {
                    this.setCustomValidity('Passwords do not match');
                    document.getElementById('passwordMismatch').style.display = 'block';
                } else {
                    this.setCustomValidity('');
                    document.getElementById('passwordMismatch').style.display = 'none';
                }
            });
            
            newPasswordInput.addEventListener('input', function() {
                if (confirmPasswordInput.value) {
                    if (this.value !== confirmPasswordInput.value) {
                        confirmPasswordInput.setCustomValidity('Passwords do not match');
                        document.getElementById('passwordMismatch').style.display = 'block';
                    } else {
                        confirmPasswordInput.setCustomValidity('');
                        document.getElementById('passwordMismatch').style.display = 'none';
                    }
                }
            });
        }
        
    } catch (error) {
        console.error('Error rendering profile page:', error);
        appDiv.innerHTML = '<div class="alert alert-danger">Failed to load profile data. Please try again later.</div>';
    }
}

// Handle profile update form submission
async function handleUpdateProfile(event) {
    event.preventDefault();
    
    const nameInput = document.getElementById('profileName');
    const emailInput = document.getElementById('profileEmail');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const errorDiv = document.getElementById('profileError');
    const successDiv = document.getElementById('profileSuccess');
    
    // Reset alerts
    errorDiv.classList.add('d-none');
    errorDiv.textContent = '';
    successDiv.classList.add('d-none');
    successDiv.textContent = '';
    
    // Form validation
    if (!nameInput.value.trim()) {
        errorDiv.textContent = 'Name is required.';
        errorDiv.classList.remove('d-none');
        nameInput.focus();
        return;
    }
    
    if (!emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
        errorDiv.textContent = 'Please enter a valid email address.';
        errorDiv.classList.remove('d-none');
        emailInput.focus();
        return;
    }
    
    // Check password fields
    if (newPasswordInput.value || confirmPasswordInput.value) {
        if (!currentPasswordInput.value) {
            errorDiv.textContent = 'Current password is required to set a new password.';
            errorDiv.classList.remove('d-none');
            currentPasswordInput.focus();
            return;
        }
        
        if (newPasswordInput.value !== confirmPasswordInput.value) {
            errorDiv.textContent = 'New password and confirmation do not match.';
            errorDiv.classList.remove('d-none');
            newPasswordInput.focus();
            return;
        }
        
        if (newPasswordInput.value.length < 6) {
            errorDiv.textContent = 'New password must be at least 6 characters long.';
            errorDiv.classList.remove('d-none');
            newPasswordInput.focus();
            return;
        }
    }
    
    // Prepare update data
    const updateData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim()
    };
    
    // Add password data if provided
    if (newPasswordInput.value) {
        updateData.currentPassword = currentPasswordInput.value;
        updateData.password = newPasswordInput.value;
    }
    
    // Disable form during submission
    const submitButton = event.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData),
            credentials: 'include'
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Unknown error occurred' }));
            throw new Error(errorData.message || 'Failed to update profile');
        }
        
        // Display success message
        successDiv.textContent = 'Profile updated successfully!';
        successDiv.classList.remove('d-none');
        
        // Clear password fields
        currentPasswordInput.value = '';
        newPasswordInput.value = '';
        confirmPasswordInput.value = '';
        
        // Update auth UI to reflect name change if applicable
        await updateAuthUI();
        
    } catch (error) {
        console.error('Profile update error:', error);
        errorDiv.textContent = error.message || 'An error occurred while updating your profile.';
        errorDiv.classList.remove('d-none');
    } finally {
        // Re-enable form
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
    }
}

// Add the new handleCancelOrder function
async function handleCancelOrder(event) {
    const orderId = event.target.dataset.orderId;
    if (!confirm(`Are you sure you want to cancel order #${orderId}? This action cannot be undone.`)) {
        return;
    }

    const button = event.target;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cancelling...';

    try {
        // Backend needs to implement: POST /api/orders/:orderId/cancel
        // This endpoint should handle logic like checking if cancellation is allowed,
        // processing refunds via Stripe (if applicable), and updating order status.
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
            method: 'POST', // Or PUT, depending on backend API design
            credentials: 'include'
        });

        if (response.ok) {
            alert('Order cancelled successfully.');
            // Re-render order history to reflect the change
            // Assuming current user ID is available or renderOrderHistoryPage can get it
            const user = await checkAuth(); 
            if (user) renderOrderHistoryPage(user._id);
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Failed to cancel order. Please try again.' }));
            alert(`Error cancelling order: ${errorData.message}`);
            button.disabled = false;
            button.innerHTML = 'Cancel Order';
        }
    } catch (error) {
        console.error('Cancel order error:', error);
        alert('An unexpected error occurred while trying to cancel the order.');
        button.disabled = false;
        button.innerHTML = 'Cancel Order';
    }
}
