// client/js/script.js

// Get references to key DOM elements
const appDiv = document.getElementById('app');
const loginLink = document.getElementById('loginLink');
const registerLink = document.getElementById('registerLink');
const userInfoSpan = document.getElementById('userInfo');
const userEmailSpan = document.getElementById('userEmail');
const userRoleSpan = document.getElementById('userRole');
const logoutLink = document.getElementById('logoutLink');
const adminLink = document.querySelector('.admin-link'); // Assuming the li element has this class

// IMPORTANT: Set the base URL for your backend API
// Use http://localhost:3000/api during local development
// After deployment, change this to your deployed backend URL + /api
const API_BASE_URL = 'http://localhost:3000/api';

// --- Authentication Handling ---

// Also update userEmailSpan in updateAuthUI to potentially show name instead of email
async function updateAuthUI() {
    const user = await checkAuth(); // Fetch user data from backend

    if (user) {
        // User is logged in
        loginLink.style.display = 'none';
        registerLink.style.display = 'none';
        userInfoSpan.style.display = 'block'; // Show user info
        logoutLink.style.display = 'list-item'; // Show logout link (assuming it's an li)

        userEmailSpan.textContent = user.name || user.email; // Display user name or email
        userRoleSpan.textContent = user.role; // Display user role

        // Show/hide admin link based on role
        if (user.role === 'admin') {
            adminLink.classList.remove('d-none'); // Remove Bootstrap's display: none class
        } else {
            adminLink.classList.add('d-none'); // Add Bootstrap's display: none class
        }
    } else {
        // User is not logged in
        loginLink.style.display = 'list-item'; // Show login link
        registerLink.style.display = 'list-item'; // Show register link
        userInfoSpan.style.display = 'none'; // Hide user info
        logoutLink.style.display = 'none'; // Hide logout link
        adminLink.classList.add('d-none'); // Hide admin link
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


// Event handler for user logout
logoutLink.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent default link behavior

    try {
        // Call the backend's logout endpoint
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
             // Include credentials to send the cookie to be cleared by backend
             credentials: 'include'
        });

        if (response.ok) {
            console.log('Logout successful');
            alert('Logout successful!');
            // Update UI and redirect to login page
            updateAuthUI();
            window.location.hash = '#/login';
        } else {
             // Handle logout failure (unlikely if backend cleared cookie, but good practice)
             const errorData = await response.json();
             alert('Logout failed: ' + (errorData.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('An error occurred during logout.');
    }
});


// --- Client-Side Routing / Page Rendering ---

// Function to render different pages based on the URL hash
async function renderPage() {
    const hash = window.location.hash || '#/';
    appDiv.innerHTML = '';
    await updateAuthUI();

    if (hash === '#/') {
        renderHomePage();
    } else if (hash === '#/login') {
        renderLoginForm();
    } else if (hash === '#/register') {
        renderRegisterForm();
    } else if (hash === '#/products') {
        renderProductsPage();
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
    } else if (hash === '#/admin/users') {
        AdminUsers.renderList(appDiv);
    } else if (hash === '#/admin/reviews') {
        AdminReviews.renderList(appDiv);
    } else if (hash === '#/admin/discounts') {
        AdminDiscounts.renderList(appDiv);
    } else if (hash === '#/admin/discounts/new') {
        AdminDiscounts.renderForm(appDiv);
    } else if (hash.startsWith('#/admin/discounts/edit/')) {
        const discountId = hash.split('/')[4];
        AdminDiscounts.renderForm(appDiv, discountId);
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
    }
     else {
        renderNotFound();
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
async function renderProductsPage(filters = {}) {
    appDiv.innerHTML = '<h2>Our Products</h2>';

    // Build filter query string
    const queryParams = new URLSearchParams();
    if (filters.name) queryParams.append('name', filters.name);
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.gender) queryParams.append('gender', filters.gender);
    const queryString = queryParams.toString();

    // Add search and filter form
    // Define some example categories/genders - in a real app, these might come from an API
    const exampleCategories = ['T-Shirts', 'Jeans', 'Dresses', 'Shoes', 'Accessories'];
    const exampleGenders = ['Men', 'Women', 'Unisex'];

    const filterFormHtml = `
        <form id="productFilterForm" class="mb-4 p-3 border rounded">
            <div class="row g-3">
                <div class="col-md-4">
                    <label for="productSearchInput" class="form-label">Search by Name</label>
                    <input type="text" id="productSearchInput" class="form-control" placeholder="Product name..." value="${filters.name || ''}">
                </div>
                <div class="col-md-3">
                    <label for="categoryFilter" class="form-label">Category</label>
                    <select id="categoryFilter" class="form-select">
                        <option value="">All Categories</option>
                        ${exampleCategories.map(cat => `<option value="${cat}" ${filters.category === cat ? 'selected' : ''}>${cat}</option>`).join('')}
                    </select>
                </div>
                <div class="col-md-3">
                    <label for="genderFilter" class="form-label">Gender</label>
                    <select id="genderFilter" class="form-select">
                        <option value="">All Genders</option>
                        ${exampleGenders.map(gen => `<option value="${gen}" ${filters.gender === gen ? 'selected' : ''}>${gen}</option>`).join('')}
                    </select>
                </div>
                <div class="col-md-2 d-flex align-items-end">
                    <button type="submit" class="btn btn-primary w-100">Apply Filters</button>
                </div>
            </div>
        </form>
    `;
    appDiv.innerHTML += filterFormHtml;

    const productsListDiv = document.createElement('div');
    productsListDiv.id = 'productsList';
    productsListDiv.className = 'row';
    productsListDiv.innerHTML = '<p>Loading products...</p>';
    appDiv.appendChild(productsListDiv);

    document.getElementById('productFilterForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('productSearchInput').value;
        const category = document.getElementById('categoryFilter').value;
        const gender = document.getElementById('genderFilter').value;
        renderProductsPage({ name, category, gender });
    });

    try {
        let fetchUrl = `${API_BASE_URL}/products`;
        if (queryString) {
            fetchUrl += `?${queryString}`;
        }
        const response = await fetch(fetchUrl);
         if (!response.ok) {
             throw new Error(`Failed to fetch products: ${response.statusText}`);
         }
        const data = await response.json();
        const products = data.data; // Assuming your API returns data in a 'data' field

        const productsListDiv = document.getElementById('productsList');
        productsListDiv.innerHTML = ''; // Clear the loading message

        if (products && products.length > 0) {
            products.forEach(product => {
                 // Use a working placeholder image URL or remove img if not needed
                productsListDiv.innerHTML += `
                    <div class="col-md-4 col-sm-6 mb-4">
                        <div class="card h-100">
                             <img src="https://via.placeholder.com/250x150" class="card-img-top" alt="Product Image Placeholder"> <!-- Using a reliable placeholder -->
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">${product.name}</h5>
                                <p class="card-text flex-grow-1">${product.description.substring(0, 100)}...</p>
                                <p class="card-text"><strong>$${product.price.toFixed(2)}</strong></p>
                                <div class="mt-auto">
                                    <a href="#/products/${product.name}" class="btn btn-secondary me-1">View Details</a>
                                     <button class="btn btn-primary add-to-cart-btn" data-product-id="${product._id}" data-product-price="${product.price}">Add to Cart</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                button.addEventListener('click', handleAddToCart);
            });
        } else {
            productsListDiv.innerHTML = '<p>No products available.</p>';
        }

    } catch (error) {
        console.error('Error fetching products:', error);
        appDiv.innerHTML = '<p class="text-danger">Failed to load products.</p>';
    }
}

// Renders the detail page for a single product
async function renderProductDetailPage(productName) {
     // Show a loading message initially
     appDiv.innerHTML = `<h2>${productName}</h2><div>Loading product details...</div>`;
    try {
        // Fetch the specific product details by name
        // This endpoint is assumed to be accessible without authentication
        const response = await fetch(`${API_BASE_URL}/products/${productName}`);
         if (!response.ok) {
             // If product not found (e.g., 409 or 404 from backend), throw an error
             throw new Error('Product not found');
         }
        const data = await response.json();
        const product = data.data;

        // Build HTML for reviews
        let reviewsHtml = '';
        if (product.reviews && product.reviews.length > 0) {
            reviewsHtml = '<h5>Reviews:</h5><ul class="list-group">';
            // Iterate through reviews
            reviewsHtml += product.reviews.map(review => {
                 // Note: Displaying 'User ID' because the review model stores user as ObjectId
                 // To display user names, you would need to modify the backend service to
                 // 'populate' the 'user' field in the review objects when fetching the product.
                 return `
                    <li class="list-group-item">
                        <strong>Rating: ${review.rating}/5</strong>
                        <p>${review.comment}</p>
                        <small>By User ${review.user} - ${new Date(review.createdAt).toLocaleDateString()}</small>
                         <!-- Add Edit/Delete buttons for reviews here, with logic to check if current user owns the review -->
                         <!-- Example: <button class="btn btn-sm btn-warning edit-review-btn" data-review-id="${review._id}">Edit</button> -->
                         <!-- Example: <button class="btn btn-sm btn-danger delete-review-btn" data-review-id="${review._id}">Delete</button> -->
                    </li>
                `;
            }).join('');
            reviewsHtml += '</ul>';
        } else {
            reviewsHtml = '<p>No reviews yet.</p>';
        }

        // Check if the user is logged in to decide whether to show the review form
        const user = await checkAuth();
        const addReviewFormHtml = user ? `
            <h5 class="mt-4">Add a Review</h5>
            <form id="addReviewForm">
                <div class="mb-3">
                    <label for="reviewRating" class="form-label">Rating (1-5)</label>
                    <input type="number" class="form-control" id="reviewRating" min="1" max="5" required>
                </div>
                <div class="mb-3">
                    <label for="reviewComment" class="form-label">Comment</label>
                    <textarea class="form-control" id="reviewComment" rows="3" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Submit Review</button>
                 <div id="reviewError" class="text-danger mt-2"></div> <!-- Area to display review errors -->
            </form>
        ` : '<p class="mt-4">Please log in to leave a review.</p>';


        // Populate the appDiv with product details and reviews
        appDiv.innerHTML = `
            <h2>${product.name}</h2>
            <p><strong>Price: $${product.price.toFixed(2)}</strong></p>
            <p>Stock: ${product.stock}</p>
            <p>${product.description}</p>
            <!-- Add to Cart button (same as on products page) -->
            <button class="btn btn-primary add-to-cart-btn" data-product-id="${product._id}" data-product-price="${product.price}">Add to Cart</button>

            <hr class="mt-4"> <!-- Separator -->
            ${reviewsHtml}
            ${addReviewFormHtml}
        `;

         // Add event listener to the "Add to Cart" button (if it exists)
         const addToCartBtn = appDiv.querySelector('.add-to-cart-btn');
         if (addToCartBtn) {
             addToCartBtn.addEventListener('click', handleAddToCart);
         }

         // Add event listener to the Add Review form (if it exists)
         const addReviewForm = document.getElementById('addReviewForm');
         if (addReviewForm) {
             addReviewForm.addEventListener('submit', (e) => handleAddReview(e, product._id));
         }

         // Add event listeners for edit/delete review buttons if implemented later
         // document.querySelectorAll('.edit-review-btn').forEach(...)
         // document.querySelectorAll('.delete-review-btn').forEach(...)


    } catch (error) {
        // Handle errors (e.g., product not found)
        console.error('Error fetching product details:', error);
        appDiv.innerHTML = '<p class="text-danger">Failed to load product details. Product not found.</p>';
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
       // Fetch the user object which now includes cart and discount details
       const response = await fetch(`${API_BASE_URL}/cart`, { credentials: 'include' });
        if (!response.ok) {
            // Handle authentication required specifically for cart page
            if (response.status === 401) {
                 renderLoginMessage('Please log in to view your cart.');
                 return;
            }
            throw new Error(`Failed to fetch cart: ${response.statusText}`);
        }
       const userData = await response.json();
       const userWithCart = userData.data; // Assuming backend sends user object in 'data'
       const cartItems = userWithCart.cart;

       const cartItemsDiv = document.getElementById('cartItems');
       cartItemsDiv.innerHTML = ''; // Clear loading message

       if (cartItems && cartItems.length > 0) {
            let subtotal = 0;
           cartItems.forEach(item => {
                const itemTotal = item.price * item.qty;
                subtotal += itemTotal;
               // The product field should now be populated with product details
               cartItemsDiv.innerHTML += `
                   <div class="card mb-3">
                       <div class="card-body">
                           <h5 class="card-title">${item.product ? item.product.name : 'Product not found'}</h5>
                           <p class="card-text">Price: $${item.price.toFixed(2)}</p> <!-- This price is from the cart item, which is good -->
                           <div class="input-group mb-3" style="width: 150px;">
                               <button class="btn btn-outline-secondary update-qty-btn" type="button" data-product-id="${item.product._id}" data-delta="-1">-</button>
                               <input type="number" class="form-control text-center cart-qty-input" value="${item.qty}" min="1" data-product-id="${item.product._id}">
                               <button class="btn btn-outline-secondary update-qty-btn" type="button" data-product-id="${item.product._id}" data-delta="1">+</button>
                           </div>
                            <button class="btn btn-danger remove-from-cart-btn" data-product-id="${item.product._id}">Remove</button>
                       </div>
                   </div>
               `;
           });

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

            let discountSectionHtml = `
             <div class="mt-3">
                 <form id="applyDiscountForm" class="input-group">
                     <input type="text" id="discountCodeInput" class="form-control" placeholder="Enter discount code">
                     <button type="submit" class="btn btn-primary">Apply Discount</button>
                 </form>
                 <div id="discountMessage" class="mt-2"></div>
             </div>
            `;

            if (userWithCart.appliedDiscountCode) {
                discountSectionHtml = `
                 <div class="mt-3">
                     <p>Applied Discount: <strong>${userWithCart.appliedDiscountCode}</strong> (-$${(userWithCart.discountAmount / 100).toFixed(2)}) 
                         <button class="btn btn-sm btn-outline-danger ms-2" id="removeDiscountBtn">Remove</button>
                     </p>
                 </div>
                `;
            }

            document.getElementById('cartSummary').innerHTML = `
                <h4>Order Summary</h4>
                <p>Subtotal: $${(userWithCart.cartSubtotal / 100).toFixed(2)}</p>
                ${userWithCart.appliedDiscountCode ? 
                  `<p>Discount (${userWithCart.appliedDiscountCode}): -$${(userWithCart.discountAmount / 100).toFixed(2)}</p>
                   <p><strong>Total After Discount: $${(userWithCart.cartTotalAfterDiscount / 100).toFixed(2)}</strong></p>` : ''}
                <!-- Shipping and Tax will be finalized at checkout -->
                <a href="#/checkout" class="btn btn-success mt-3 ${(!cartItems || cartItems.length === 0) ? 'disabled' : ''}">Proceed to Checkout</a>
            `;
            cartItemsDiv.insertAdjacentHTML('afterend', discountSectionHtml); // Add discount form/info after items

            const applyForm = document.getElementById('applyDiscountForm');
            if (applyForm) {
                applyForm.addEventListener('submit', handleApplyDiscount);
            }
            const removeBtn = document.getElementById('removeDiscountBtn');
            if (removeBtn) {
                removeBtn.addEventListener('click', handleRemoveDiscount);
            }

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

    // Fetch user/cart data which includes all discount fields and totals
    const cartResponse = await fetch(`${API_BASE_URL}/cart`, { credentials: 'include' });
    if (!cartResponse.ok) { /* error handling */ return; }
    const userCartData = (await cartResponse.json()).data;

    if (!userCartData.cart || userCartData.cart.length === 0) { /* handle empty cart */ return; }

    const { cart, cartSubtotal, appliedDiscountCode, discountAmount, cartTotalAfterDiscount } = userCartData;

    // Estimate/calculate shipping and tax for display (backend re-calculates on order creation)
    const shippingFeeDisplay = 500; // Cents, example same as backend
    const taxRateDisplay = 0.10; // Example same as backend
    const taxAmountDisplay = Math.round((cartTotalAfterDiscount + shippingFeeDisplay) * taxRateDisplay);
    const grandTotalDisplay = cartTotalAfterDiscount + shippingFeeDisplay + taxAmountDisplay;

    // Display checkout form and cart summary
    appDiv.innerHTML = `
        <h2>Checkout</h2>

        <div class="card mb-4">
            <div class="card-body">
                <h5 class="card-title">Order Summary</h5>
                <ul class="list-group list-group-flush">
                   ${cart.map(item => `<li class="list-group-item">${item.qty} x ${item.product.name} - $${(item.price * item.qty / 100).toFixed(2)}</li>`).join('')}
                </ul>
                <hr>
                <p>Subtotal: $${(cartSubtotal / 100).toFixed(2)}</p>
                ${appliedDiscountCode ? 
                  `<p>Discount (${appliedDiscountCode}): -$${(discountAmount / 100).toFixed(2)}</p>
                   <p>Total After Discount: $${(cartTotalAfterDiscount / 100).toFixed(2)}</p>` : ''}
                <p>Shipping: $${(shippingFeeDisplay / 100).toFixed(2)}</p>
                <p>Tax (Est.): $${(taxAmountDisplay / 100).toFixed(2)}</p>
                <hr>
                <h5>Grand Total (Est.): $${(grandTotalDisplay / 100).toFixed(2)}</h5>
            </div>
        </div>


        <form id="checkoutForm">
            <div class="mb-3">
                <label for="shippingAddress" class="form-label">Shipping Address</label>
                <input type="text" class="form-control" id="shippingAddress" required>
            </div>
            <!-- Add more address fields (city, country, postal code) as per your Order interface/model -->
            <!-- Ensure required attributes are set based on your DTO/model -->
            <button type="submit" class="btn btn-success">Place Order & Pay</button>
            <div id="checkoutError" class="text-danger mt-2"></div> <!-- Area to display checkout errors -->
        </form>

         <p class="mt-3"><a href="#/cart">Return to Cart</a></p>
    `;

    // Add event listener to the checkout form's submit event
    document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
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
        orderListDiv.innerHTML = ''; // Clear loading message

        // Check if orders were returned
        if (orders && orders.length > 0) {
            // Iterate through orders and create HTML for each
            orders.forEach(order => {
                let itemsHtml = '<ul>';
                // List items in the order
                order.items.forEach(item => {
                    itemsHtml += `<li>${item.qty} x ${item.product ? item.product.name : 'Product ID: ' + item.product} (Price: $${item.price.toFixed(2)})</li>`;
                });
                itemsHtml += '</ul>';

                // Display order details
                orderListDiv.innerHTML += `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">Order #${order._id}</h5>
                            <p class="card-text">Status: <strong>${order.status}</strong></p>
                            <p>Subtotal: $${(order.subtotal / 100).toFixed(2)}</p>
                            ${order.discountCode ? 
                              `<p>Discount (${order.discountCode}): -$${(order.discountAmount / 100).toFixed(2)}</p>
                               <p>Total After Discount: $${(order.totalAfterDiscount / 100).toFixed(2)}</p>` : ''}
                            <p>Shipping: $${(order.shippingFee / 100).toFixed(2)}</p>
                            <p>Tax: $${(order.taxAmount / 100).toFixed(2)}</p>
                            <p><strong>Grand Total: $${(order.grandTotal / 100).toFixed(2)}</strong></p>
                            <p class="card-text">Shipping Address: ${order.shippingAddress}</p>
                            <p class="card-text">Items:</p>${itemsHtml}
                            <small>Ordered on: ${new Date(order.createdAt).toLocaleDateString()}</small>
                        </div>
                    </div>
                `;
            });
             // Add event listeners for any buttons added above (e.g., view details)
            // document.querySelectorAll('.view-order-details').forEach(...)
        } else {
            // Display message if no orders found
            orderListDiv.innerHTML = '<p>You have no orders yet.</p>';
        }

    } catch (error) {
        console.error('Error fetching order history:', error);
        appDiv.innerHTML = '<p class="text-danger">Failed to load order history.</p>';
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
           <li class="nav-item"><a class="nav-link ${adminPath === '/reviews' ? 'active' : ''} nav-link" href="#/admin/reviews">Manage Reviews</a></li>
           <li class="nav-item"><a class="nav-link ${adminPath.startsWith('/discounts') ? 'active' : ''} nav-link" href="#/admin/discounts">Manage Discounts</a></li>
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

    // Delegate rendering to namespaced functions
    // Ensure the namespaces (AdminUsers, etc.) are available (check browser console if errors)
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
        } else if (adminPath === '/reviews') {
            AdminReviews.renderList(adminContentDiv);
        } else if (adminPath === '/discounts') {
            AdminDiscounts.renderList(adminContentDiv);
        } else if (adminPath === '/discounts/new') {
            AdminDiscounts.renderForm(adminContentDiv);
        } else if (adminPath.startsWith('/discounts/edit/') && editProductName) {
            AdminDiscounts.renderForm(adminContentDiv, editProductName);
        } else {
            adminContentDiv.innerHTML = '<p>Welcome to the Admin Dashboard.</p>';
        }
    } catch (error) {
        console.error('Error rendering admin section:', error);
        adminContentDiv.innerHTML = `<p class="text-danger">Error loading admin section: ${error.message}. Make sure admin JS files are loaded correctly.</p>`;
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
    const productId = event.target.dataset.productId;
    // productPrice is not strictly needed on frontend for adding to cart if backend handles price lookup
    // const productPrice = parseFloat(event.target.dataset.productPrice);
    const quantity = 1; // Assuming adding one at a time

    const user = await checkAuth();
    if (!user) {
        alert('Please log in to add items to your cart.');
        window.location.hash = '#/login';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId, quantity }),
            credentials: 'include' // Send cookie
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Item added to cart:', data.data);
            alert('Item added to cart!');
            // Optional: Provide visual feedback like updating a cart count icon
        } else {
             const errorData = await response.json();
            alert('Failed to add item to cart: ' + (errorData.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Add to cart error:', error);
        alert('An error occurred while adding to cart.');
    }
}

// Handles changing quantity or using +/- buttons in the cart page
async function handleUpdateCartQuantity(event) {
    // Find the closest ancestor with class 'input-group' to reliably find the input
    const inputGroup = event.target.closest('.input-group');
    if (!inputGroup) {
        console.error('Could not find parent .input-group');
        return;
    }

    const inputElement = inputGroup.querySelector('.cart-qty-input');
    const productId = inputElement.dataset.productId;
    let newQuantity = parseInt(inputElement.value, 10);

    // If the event came from a +/- button, adjust the quantity
    if (event.target.dataset.delta) {
        newQuantity += parseInt(event.target.dataset.delta, 10);
        // Ensure quantity is at least 1 for +/- buttons
        if (newQuantity < 1) newQuantity = 1;
        // Update the input field value visually immediately for better UX
        inputElement.value = newQuantity;
    }

    // Handle the case where the quantity becomes 0 or less via direct input or +/- button results in <= 0
    if (newQuantity < 1) {
        if (confirm('Quantity is 0. Do you want to remove this item from your cart?')) {
            // Call the remove handler and return
            handleRemoveFromCart({ target: { dataset: { productId: productId } } });
        } else {
            // If cancelled, revert the quantity in the input field to 1 and re-render
            inputElement.value = 1;
            renderCartPage(); // Revert UI state
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
            credentials: 'include'
       });

       if (response.ok) {
           console.log('Cart updated successfully');
            // Re-render the cart page to update totals (backend returns updated cart)
            renderCartPage();
       } else {
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
    const productId = event.target.dataset.productId;

    if (!confirm('Are you sure you want to remove this item from your cart?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/${productId}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            console.log('Item removed from cart');
            renderCartPage(); // Re-render cart
        } else {
             const errorData = await response.json();
             alert('Failed to remove item from cart: ' + (errorData.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Remove from cart error:', error);
        alert('An error occurred while removing from cart.');
    }
}


// Handles checkout form submission
async function handleCheckout(event) {
    event.preventDefault();
    const shippingAddress = document.getElementById('shippingAddress').value;
    const errorDiv = document.getElementById('checkoutError');
    errorDiv.textContent = '';

    // Ensure the address field is not empty
    if (shippingAddress.trim() === '') {
        errorDiv.textContent = 'Please enter a shipping address.';
        return;
    }

    // Fetch the current cart to ensure it's not empty before proceeding
     const cartCheckResponse = await fetch(`${API_BASE_URL}/cart`, { credentials: 'include' });
     if (!cartCheckResponse.ok) {
          errorDiv.textContent = 'Could not retrieve cart details for checkout.';
          console.error('Failed to fetch cart for checkout');
          return; // Stop checkout process
      }
     const cartData = await cartCheckResponse.json();
     if (!cartData.data || cartData.data.length === 0) {
         errorDiv.textContent = 'Your cart is empty. Cannot checkout.';
         return; // Stop checkout process
     }


    try {
        // Send order creation request to the backend API
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address: shippingAddress }),
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Order created, redirecting to Stripe:', data.orderId);
            alert('Redirecting to payment...'); // Inform the user

            // Redirect the user's browser to the Stripe checkout page URL provided by the backend
            if (data.sessionUrl) {
                 window.location.href = data.sessionUrl;
            } else {
                // Handle unexpected success response without Stripe URL
                errorDiv.textContent = 'Order created, but no payment URL received.';
                alert('Order created, but payment could not be initiated. Please contact support.');
            }

        } else {
            // Handle checkout failure - display error message from backend
            console.error('Checkout failed:', data.message);
             errorDiv.textContent = data.message || 'Checkout failed. Please try again.';
            // Optional: Re-render the cart page if checkout fails due to cart issues (like stock)
            // window.location.hash = '#/cart';
        }
    } catch (error) {
        console.error('Checkout error:', error);
        errorDiv.textContent = 'An error occurred during checkout.';
    }
}


// Handles adding a review to a product
async function handleAddReview(event, productId) {
    event.preventDefault();
    const rating = parseInt(document.getElementById('reviewRating').value, 10);
    const comment = document.getElementById('reviewComment').value;
    const errorDiv = document.getElementById('reviewError');
    errorDiv.textContent = '';

    // Basic frontend validation
    if (isNaN(rating) || rating < 1 || rating > 5) {
        errorDiv.textContent = 'Please provide a rating between 1 and 5.';
        return;
    }
    if (comment.trim() === '') {
        errorDiv.textContent = 'Please provide a comment.';
        return;
    }

    try {
        // Send add review request to the backend API (requires authentication)
        const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rating, comment }),
             credentials: 'include' // Authenticated users only
        });

        const data = await response.json();

        if (response.ok) {
            console.log('Review added successfully:', data.data);
            alert('Review added successfully!');
            // Re-render the product detail page to show the new review and updated average rating
            renderProductDetailPage(data.data.name); // Assuming the backend returns the updated product object on success
        } else {
             // Handle review failure - display error message from backend
             console.error('Add review failed:', data.message);
            errorDiv.textContent = data.message || 'Failed to add review.';
            // If it's an auth error, maybe redirect to login
            if (response.status === 401) {
                alert('You must be logged in to add a review.');
                window.location.hash = '#/login';
            }
        }
    } catch (error) {
        console.error('Add review error:', error);
        errorDiv.textContent = 'An error occurred while adding the review.';
    }
}

// --- Stripe Redirect Handling ---
const urlParams = new URLSearchParams(window.location.search);
const orderIdFromUrl = urlParams.get('orderId');

async function handleCheckoutRedirect(orderId, isSuccess) {
   if (isSuccess) {
       appDiv.innerHTML = `
           <h2>Checkout Successful!</h2>
           <p>Your order #${orderId} has been placed.</p>
           <p>Thank you for your purchase!</p>
           <p><a href="#/orders">View My Orders</a></p>
       `;
        // After showing the success message, you might want to do one more thing:
        // In a real app, you'd ideally *confirm* the payment status by fetching the order
        // from your backend based on orderId, but the webhook should handle the DB update.
        // Clearing the local cart display is important if you are storing it locally.
        // Since our frontend only relies on the backend cart, the next time the Cart page
        // is rendered, it will be empty (because the backend cleared it after creating the order).
        // So no explicit frontend cart clearing is needed for this setup.

   } else { // isCancel
       appDiv.innerHTML = `
           <h2>Checkout Cancelled</h2>
           <p>Your order was not completed. Your cart has NOT been cleared.</p>
           <p><a href="#/cart">Return to Cart</a></p>
       `;
        // For a cancelled payment, the backend did NOT clear the cart, so the user can return to it.
   }

   // Clear the query parameters from the URL after handling the redirect
   // This prevents the message from reappearing on page refresh
   history.replaceState(null, '', window.location.pathname + window.location.hash);

   // Re-render the page based on the new hash after clearing query params
   // This is important if the user clicks a link AFTER seeing the success/cancel message
   // window.location.hash = '#/'; // Optional: Redirect to home after a delay
}

const currentPath = window.location.pathname;
if (currentPath.includes('/checkout-success') && orderIdFromUrl) {
    handleCheckoutRedirect(orderIdFromUrl, true);
} else if (currentPath.includes('/checkout-cancel')) {
    handleCheckoutRedirect(null, false);
} else {
    // If no specific redirect parameters, render the normal page based on hash
    renderPage(); // Initial page render happens here now
}

async function handleApplyDiscount(event) {
    event.preventDefault();
    const codeInput = document.getElementById('discountCodeInput');
    const discountCode = codeInput.value.trim().toUpperCase();
    const messageDiv = document.getElementById('discountMessage');
    messageDiv.textContent = '';

    if (!discountCode) {
        messageDiv.textContent = 'Please enter a discount code.';
        messageDiv.className = 'text-danger mt-2';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/discount`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ discountCode }),
            credentials: 'include'
        });
        const result = await response.json();
        if (response.ok) {
            messageDiv.textContent = result.message || 'Discount applied!';
            messageDiv.className = 'text-success mt-2';
            renderCartPage(); // Re-render to show updated totals and discount info
        } else {
            throw new Error(result.message || 'Failed to apply discount');
        }
    } catch (error) {
        messageDiv.textContent = error.message;
        messageDiv.className = 'text-danger mt-2';
        console.error('Error applying discount:', error);
    }
}

async function handleRemoveDiscount() {
    const messageDiv = document.getElementById('discountMessage') || document.createElement('div'); // Ensure it exists
     if(!document.getElementById('discountMessage')) { // if it was created, append it after the cart summary or similar
        const cartSummary = document.getElementById('cartSummary');
        if(cartSummary) cartSummary.parentNode.insertBefore(messageDiv, cartSummary.nextSibling);
        messageDiv.id = 'discountMessage';
    }
    messageDiv.textContent = '';

    try {
        const response = await fetch(`${API_BASE_URL}/cart/discount`, {
            method: 'DELETE',
            credentials: 'include'
        });
        const result = await response.json();
        if (response.ok) {
            messageDiv.textContent = result.message || 'Discount removed!';
            messageDiv.className = 'text-success mt-2';
            renderCartPage(); // Re-render cart
        } else {
            throw new Error(result.message || 'Failed to remove discount');
        }
    } catch (error) {
        messageDiv.textContent = error.message;
        messageDiv.className = 'text-danger mt-2';
        console.error('Error removing discount:', error);
    }
}
