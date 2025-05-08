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
    // Get the current hash from the URL, default to home ('#/')
    const hash = window.location.hash || '#/';
    // Clear the main app content area
    appDiv.innerHTML = '';

    // Update the authentication UI (navbar) on every page render
    await updateAuthUI();

    // Determine which page to render based on the hash
    if (hash === '#/') {
        renderHomePage();
    } else if (hash === '#/login') {
        renderLoginForm();
    } else if (hash === '#/register') {
        renderRegisterForm();
    } else if (hash === '#/products') {
        renderProductsPage();
    } else if (hash.startsWith('#/products/')) {
        // Extract product name from the hash (e.g., #/products/MyProduct -> MyProduct)
        const parts = hash.split('/');
        const productName = parts[parts.length - 1]; // Get the last part
         // Simple check to ensure product name is not empty after split
         if (productName) {
            renderProductDetailPage(productName);
         } else {
             renderNotFound(); // Handle case like #/products/
         }
    } else if (hash === '#/cart') {
        renderCartPage();
    } else if (hash === '#/checkout') {
        renderCheckoutPage();
    } else if (hash === '#/orders') {
         // Check if user is authenticated to view orders
         const user = await checkAuth();
         if (user) {
             renderOrderHistoryPage(user._id); // Pass user ID if needed by service
         } else {
             // If not authenticated, show a login message
             renderLoginMessage('Please log in to view your orders.');
         }
    } else if (hash.startsWith('#/admin')) {
         // Check if user is authenticated and has admin role for admin pages
         const user = await checkAuth();
         if (user && user.role === 'admin') {
             // Extract the specific admin path (e.g., /users, /products)
             const adminPath = hash.substring('#/admin'.length);
             renderAdminPage(adminPath);
         } else {
             // If not admin, show access denied message
             renderAccessDenied();
         }
    }
    // Add more hash routes here for other pages if needed
     else {
        // If no matching hash is found, render the 404 page
        renderNotFound();
    }
}

// Listen for changes to the URL hash and re-render the page
window.addEventListener('hashchange', renderPage);

// Render the initial page when the script loads
renderPage();


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
async function renderProductsPage() {
    appDiv.innerHTML = '<h2>Products</h2><div id="productsList" class="row">Loading products...</div>';
    try {
        // Fetch products from the backend API
        // This endpoint is now public based on index.ts needsAuth: false
        const response = await fetch(`${API_BASE_URL}/products`);
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
                    <div class="col-md-4 mb-4">
                        <div class="card">
                             <img src="https://via.placeholder.com/250x150" class="card-img-top" alt="Product Image Placeholder"> <!-- Using a reliable placeholder -->
                            <div class="card-body">
                                <h5 class="card-title">${product.name}</h5>
                                <p class="card-text">${product.description.substring(0, 100)}...</p>
                                <p class="card-text"><strong>$${product.price.toFixed(2)}</strong></p>
                                <a href="#/products/${product.name}" class="btn btn-secondary">View Details</a>
                                 <button class="btn btn-primary add-to-cart-btn" data-product-id="${product._id}" data-product-price="${product.price}">Add to Cart</button>
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
       cartItemsDiv.innerHTML = ''; // Clear loading message

       if (cartItems && cartItems.length > 0) {
            let subtotal = 0;
           cartItems.forEach(item => {
                const itemTotal = item.price * item.qty;
                subtotal += itemTotal;
               // NOTE: item.product here is likely just the product ID string.
               // To display product name, you would need to fetch product details or
               // modify the backend /api/cart endpoint to populate the product data.
               cartItemsDiv.innerHTML += `
                   <div class="card mb-3">
                       <div class="card-body">
                           <h5 class="card-title">Product ID: ${item.product}</h5> <!-- Enhance later -->
                           <p class="card-text">Price: $${item.price.toFixed(2)}</p>
                           <div class="input-group mb-3" style="width: 150px;">
                               <button class="btn btn-outline-secondary update-qty-btn" type="button" data-product-id="${item.product}" data-delta="-1">-</button>
                               <input type="number" class="form-control text-center cart-qty-input" value="${item.qty}" min="1" data-product-id="${item.product}">
                               <button class="btn btn-outline-secondary update-qty-btn" type="button" data-product-id="${item.product}" data-delta="1">+</button>
                           </div>
                            <button class="btn btn-danger remove-from-cart-btn" data-product-id="${item.product}">Remove</button>
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

    // Calculate subtotal, shipping, tax, and total based on cart items (can be done on frontend or fetched from backend)
    // For simplicity, let's assume backend handles this accurately during order creation.
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    // Note: Shipping and Tax calculation logic exists in the backend service.
    // You might want to create a backend endpoint (e.g., GET /api/cart/summary) to fetch
    // the calculated shipping, tax, and total before displaying the checkout page.
    // For this basic example, we'll just show the subtotal here.

    // Display checkout form and cart summary
    appDiv.innerHTML = `
        <h2>Checkout</h2>

        <div class="card mb-4">
            <div class="card-body">
                <h5 class="card-title">Order Summary</h5>
                <ul class="list-group list-group-flush">
                   ${cartItems.map(item => `
                        <li class="list-group-item">${item.qty} x Product ID: ${item.product} - $${(item.price * item.qty).toFixed(2)}</li>
                   `).join('')}
                </ul>
                <h6 class="mt-3">Subtotal: $${subtotal.toFixed(2)}</h6>
                <!-- Ideally, fetch and display shipping and tax from backend summary endpoint -->
                <!-- <h6 class="mt-1">Shipping: $...</h6> -->
                <!-- <h6 class="mt-1">Tax: $...</h6> -->
                <!-- <h4>Total: $...</h4> -->
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
                    // Again, product details are not populated here. Displaying ID.
                    itemsHtml += `<li>Product ID: ${item.product} (Qty: ${item.qty}, Price: $${item.price.toFixed(2)})</li>`;
                });
                itemsHtml += '</ul>';

                // Display order details
                orderListDiv.innerHTML += `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">Order #${order._id}</h5>
                            <p class="card-text">Status: <strong>${order.status}</strong></p>
                            <p class="card-text">Total: $${order.total.toFixed(2)}</p>
                            <p class="card-text">Shipping Address: ${order.shippingAddress}</p>
                            <p class="card-text">Items:</p>
                            ${itemsHtml}
                            <small>Ordered on: ${new Date(order.createdAt).toLocaleDateString()}</small>
                            <!-- Optional: Button to view detailed order information -->
                            <!-- <button class="btn btn-sm btn-info view-order-details" data-order-id="${order._id}">Details</button> -->
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

// Renders the admin dashboard and specific admin sections
async function renderAdminPage(adminPath) {
    // Check if user is authenticated and is an admin (already done in renderPage, but defensive)
    const user = await checkAuth();
    if (!user || user.role !== 'admin') {
        renderAccessDenied();
        return;
    }

    // Base admin dashboard structure
    appDiv.innerHTML = `
       <h2>Admin Dashboard</h2>
       <p>Select an action:</p>
       <ul class="nav nav-tabs">
           <li class="nav-item"><a class="nav-link ${adminPath === '/users' ? 'active' : ''}" href="#/admin/users">Manage Users</a></li>
           <li class="nav-item"><a class="nav-link ${adminPath.startsWith('/products') ? 'active' : ''}" href="#/admin/products">Manage Products</a></li> <!-- Check for products path prefix -->
           <li class="nav-item"><a class="nav-link ${adminPath === '/orders' ? 'active' : ''}" href="#/admin/orders">Manage Orders</a></li>
           <!-- Add more tabs for other admin sections -->
       </ul>
       <div id="adminContent" class="mt-3">
           <!-- Specific admin content will load here -->
       </div>
    `;

    const adminContentDiv = document.getElementById('adminContent');

    // Render specific admin section based on the path
    switch (adminPath) {
        case '/users':
            renderAdminUsers(adminContentDiv); // Implement this function
            break;
        case '/products': // Fall through for /products/ to render the list
        case '/products/':
            renderAdminProducts(adminContentDiv); // Implement this function
            break;
        case '/products/new':
            renderAdminAddProductForm(adminContentDiv); // Implement this function
            break;
        // You would add cases here for '/products/edit/:name' etc.
        case '/orders':
            renderAdminOrders(adminContentDiv); // Implement this function
            break;
        // Add cases for other admin views (e.g., '/discounts')
        default:
            // Default view for admin dashboard if the specific path is not matched
            adminContentDiv.innerHTML = '<p>Welcome to the Admin Dashboard. Use the links above to manage the store.</p>';
            break;
    }
}

// Renders the user management section for admin
async function renderAdminUsers(container) {
    container.innerHTML = '<h3>Manage Users</h3><p>Loading users...</p>';
    try {
        // Fetch all users from the backend API (requires admin authentication)
        const response = await fetch(`${API_BASE_URL}/users`, { credentials: 'include' });
         if (!response.ok) {
             // Handle access denied for non-admin
             if (response.status === 401 || response.status === 403) {
                 renderAccessDenied(); // Redirect or show message
                 return; // Stop processing
             }
              throw new Error(`Failed to fetch users: ${response.statusText}`);
          }
        const data = await response.json();
        const users = data.data;

        let usersHtml = ''; // HTML string for the table
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
            // Iterate through users and create table rows
            usersHtml += users.map(user => `
                <tr>
                    <td>${user._id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.role}</td>
                    <td>
                        <!-- Placeholder buttons for Edit and Delete actions -->
                        <!-- These would need event listeners and functions to call backend PUT/DELETE endpoints -->
                        <button class="btn btn-sm btn-warning" disabled>Edit</button>
                        <button class="btn btn-sm btn-danger" disabled>Delete</button>
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
}

// Renders the product management section for admin (list view)
async function renderAdminProducts(container) {
   // Show add new product link and loading message
   container.innerHTML = '<h3>Manage Products</h3><p><a href="#/admin/products/new" class="btn btn-success mb-3">Add New Product</a></p><div id="adminProductsList">Loading products...</div>';

   try {
       // Fetch all products from the backend API (requires admin authentication implicitly via needsAuth)
       const response = await fetch(`${API_BASE_URL}/products`, { credentials: 'include' });
        if (!response.ok) {
            // Handle access denied for non-admin
             if (response.status === 401 || response.status === 403) {
                 renderAccessDenied();
                 return;
             }
             throw new Error(`Failed to fetch products: ${response.statusText}`);
         }
       const data = await response.json();
       const products = data.data;

       const productsListDiv = document.getElementById('adminProductsList');
       productsListDiv.innerHTML = '';

       if (products && products.length > 0) {
            let productsHtml = `
               <table class="table table-striped table-bordered">
                   <thead>
                       <tr>
                           <th>Name</th>
                           <th>Price</th>
                           <th>Stock</th>
                            <th>Reviews</th>
                           <th>Actions</th>
                       </tr>
                   </thead>
                   <tbody>
           `;
            productsHtml += products.map(product => `
                <tr>
                    <td>${product.name}</td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td>${product.stock}</td>
                     <td>${product.reviewCount} (${product.reviewCount > 0 ? (product.totalRating / product.reviewCount).toFixed(1) : 'N/A'})</td> <!-- Display review info -->
                    <td>
                        <!-- Edit and Delete buttons with data attributes -->
                        <button class="btn btn-sm btn-primary edit-product-btn" data-product-name="${product.name}">Edit</button>
                        <button class="btn btn-sm btn-danger delete-product-btn" data-product-name="${product.name}">Delete</button>
                    </td>
                </tr>
            `).join('');
            productsHtml += '</tbody></table>';
            productsListDiv.innerHTML = productsHtml;

            // Add event listeners for delete buttons
           document.querySelectorAll('.delete-product-btn').forEach(button => {
                button.addEventListener('click', handleDeleteProduct);
            });
            // Add event listeners for edit buttons (implementation needed for edit page/modal)
           document.querySelectorAll('.edit-product-btn').forEach(button => {
                button.addEventListener('click', handleEditProduct);
            });

       } else {
           productsListDiv.innerHTML = '<p>No products found.</p>';
       }

   } catch (error) {
        console.error('Error fetching products for admin:', error);
       container.innerHTML = '<p class="text-danger">Failed to load products.</p>';
   }
}

// Renders the form to add a new product for admin
function renderAdminAddProductForm(container) {
    // We already checked admin role in renderAdminPage, no need to re-check here
   container.innerHTML = `
       <h3>Add New Product</h3>
        <form id="newProductForm">
            <div class="mb-3">
                <label for="productName" class="form-label">Product Name</label>
                <input type="text" class="form-control" id="productName" required>
            </div>
            <div class="mb-3">
                <label for="productDescription" class="form-label">Description</label>
                <textarea class="form-control" id="productDescription" rows="3" required></textarea>
            </div>
            <div class="mb-3">
                <label for="productPrice" class="form-label">Price</label>
                <input type="number" class="form-control" id="productPrice" step="0.01" required>
            </div>
            <div class="mb-3">
                <label for="productStock" class="form-label">Stock (Optional)</label>
                <input type="number" class="form-control" id="productStock">
            </div>
            <button type="submit" class="btn btn-success">Add Product</button>
            <div id="addProductError" class="text-danger mt-2"></div>
        </form>
         <p class="mt-3"><a href="#/admin/products">Back to Product List</a></p>
   `;
    document.getElementById('newProductForm').addEventListener('submit', handleAddProduct);
}


// Renders the order management section for admin
async function renderAdminOrders(container) {
   container.innerHTML = '<h3>Manage Orders</h3><div id="adminOrderList">Loading orders...</div>';
    try {
        // Fetch all orders from the backend API (requires admin authentication)
        const response = await fetch(`${API_BASE_URL}/orders`, { credentials: 'include' });
         if (!response.ok) {
              // Handle access denied for non-admin
             if (response.status === 401 || response.status === 403) {
                 renderAccessDenied();
                 return;
             }
              throw new Error(`Failed to fetch orders: ${response.statusText}`);
          }
        const data = await response.json();
        const orders = data.data;

        const orderListDiv = document.getElementById('adminOrderList');
        orderListDiv.innerHTML = ''; // Clear loading message

        if (orders && orders.length > 0) {
            let ordersHtml = `
                <table class="table table-striped table-bordered">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer ID</th> <!-- Enhance later to show customer name -->
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
             ordersHtml += orders.map(order => `
                  <tr>
                      <td>${order._id}</td>
                       <td>${order.user}</td> <!-- Display User ID - Enhance later -->
                       <td>$${order.total.toFixed(2)}</td>
                      <td>
                            <!-- Dropdown to update order status -->
                            <select class="form-select order-status-select" data-order-id="${order._id}">
                                <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                                <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                                <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                                <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </td>
                        <td>
                             <!-- Optional: Button to view detailed order information -->
                             <button class="btn btn-sm btn-info view-order-details" data-order-id="${order._id}">Details</button>
                        </td>
                   </tr>
              `).join('');
            ordersHtml += '</tbody></table>';
            orderListDiv.innerHTML = ordersHtml;

            document.querySelectorAll('.order-status-select').forEach(select => {
                select.addEventListener('change', handleUpdateOrderStatus);
            });

            document.querySelectorAll('.view-order-details').forEach(button => {
                button.addEventListener('click', handleViewOrderDetails);
            });

        } else {
            orderListDiv.innerHTML = '<p>No orders found.</p>';
        }

    } catch (error) {
        console.error('Error fetching orders for admin:', error);
        container.innerHTML = '<p class="text-danger">Failed to load orders.</p>';
    }
}

// Renders a generic "Not Found" message
function renderNotFound() {
   appDiv.innerHTML = '<h2>404 Not Found</h2><p>The page you are looking for does not exist.</p>';
}

// Renders an "Access Denied" message
function renderAccessDenied() {
   appDiv.innerHTML = '<h2>Access Denied</h2><p>You do not have permission to view this page.</p>';
}

// Renders a message prompting the user to log in
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

// --- Placeholder Admin Action Handlers ---
// These functions are called when admin buttons are clicked but need full implementation

async function handleAddProduct(event) {
    event.preventDefault();
    // Get product data from the form fields (assuming you added them in renderAdminAddProductForm)
    const name = document.getElementById('productName').value;
    const description = document.getElementById('productDescription').value;
    const priceInput = document.getElementById('productPrice');
    const stockInput = document.getElementById('productStock');
    const errorDiv = document.getElementById('addProductError');
    errorDiv.textContent = '';

    const price = parseFloat(priceInput.value);
    const stock = parseInt(stockInput.value, 10); // Use parseInt

     // Basic frontend validation (you have stricter validation on backend too)
    if (name.trim() === '' || description.trim() === '' || isNaN(price) || price <= 0 || isNaN(stock) || stock < 0) {
        errorDiv.textContent = 'Please fill in all required fields with valid data.';
        return;
    }

    try {
        // Send POST request to create a new product (requires admin authentication)
         const response = await fetch(`${API_BASE_URL}/products`, {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/json',
             },
             body: JSON.stringify({ name, description, price, stock }),
              credentials: 'include' // Requires admin auth
         });

         const data = await response.json();

         if (response.ok) {
             console.log('Product added successfully:', data.data);
             alert('Product added successfully!');
              // Redirect back to the products list after adding
              window.location.hash = '#/admin/products';
         } else {
              console.error('Add product failed:', data.message);
             errorDiv.textContent = data.message || 'Failed to add product.';
             // If access denied, redirect
             if (response.status === 401 || response.status === 403) {
                 renderAccessDenied();
             }
         }
     } catch (error) {
          console.error('Add product error:', error);
          errorDiv.textContent = 'An error occurred while adding the product.';
     }
}

async function handleDeleteProduct(event) {
    // Get the product name from the button's data attribute
    const productName = event.target.dataset.productName;

    // Confirm deletion with the user
    if (!confirm(`Are you sure you want to delete product "${productName}"?`)) {
        return; // If cancelled, do nothing
    }

    try {
        // Send DELETE request to the backend API (requires admin authentication)
         const response = await fetch(`${API_BASE_URL}/products/${productName}`, {
             method: 'DELETE',
             credentials: 'include' // Requires admin auth
         });

         if (response.ok) {
             console.log(`Product "${productName}" deleted`);
             alert('Product deleted successfully!');
             // Re-render the admin products list to show the item is removed
             renderAdminPage('/products'); // Call renderAdminPage with the correct path
         } else {
              // Handle deletion failure - display error
              const errorData = await response.json();
              alert('Failed to delete product: ' + (errorData.message || 'Unknown error'));
              // If access denied, redirect
              if (response.status === 401 || response.status === 403) {
                  renderAccessDenied();
              }
         }
     } catch (error) {
          console.error('Delete product error:', error);
          alert('An error occurred while deleting the product.');
     }
}

async function handleEditProduct(event) {
    // Get the product name from the button's data attribute
    const productName = event.target.dataset.productName;
    // This would typically navigate to an edit page or show a modal with a form
    // populated with the current product data.
     alert(`Editing product "${productName}" - functionality not fully implemented yet.`); // Placeholder

    // To implement:
    // 1. Navigate to a new hash like #/admin/products/edit/:name
    // 2. Create a new rendering function (e.g., renderAdminEditProductForm)
    // 3. This function fetches the product data by name (requires admin auth), renders a form pre-filled with data
    // 4. Add an event listener to the form to send a PUT request to /api/products/:name (requires admin auth)
    // 5. On success, redirect back to #/admin/products
}

async function handleUpdateOrderStatus(event) {
    const orderId = event.target.dataset.orderId;
    const newStatus = event.target.value;
    const selectElement = event.target; // Get the select element to revert value on failure

    // Ask for confirmation before changing status
    if (!confirm(`Change status for Order #${orderId} to "${newStatus}"?`)) {
         // If cancelled, reset the select element's value to the original status
         // Note: This requires storing the original value, or re-rendering the page
          renderAdminPage('/orders'); // Simplest way to revert state
         return;
     }

    try {
         // Send PUT request to update the order status (requires admin authentication)
         const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
             method: 'PUT',
             headers: {
                 'Content-Type': 'application/json',
             },
             body: JSON.stringify({ status: newStatus }),
              credentials: 'include' // Requires admin auth
         });

         if (response.ok) {
             console.log(`Order ${orderId} status updated to ${newStatus}`);
             alert('Order status updated successfully!');
              // Re-render the admin orders list to confirm the change visually
              renderAdminPage('/orders');
         } else {
              // Handle update failure - display error and re-render to revert UI
              const errorData = await response.json();
              alert('Failed to update order status: ' + (errorData.message || 'Unknown error'));
              renderAdminPage('/orders'); // Revert changes on failure
              // If access denied, redirect
              if (response.status === 401 || response.status === 403) {
                  renderAccessDenied();
              }
         }
     } catch (error) {
         console.error('Update order status error:', error);
         alert('An error occurred while updating order status.');
         renderAdminPage('/orders'); // Revert changes on error
     }
}

async function handleViewOrderDetails(event) {
    const orderId = event.target.dataset.orderId;
     alert(`Viewing details for Order #${orderId} - functionality not fully implemented yet.`); // Placeholder

     // To implement:
     // 1. Fetch the specific order details from the backend (/api/orders/:id - you have this endpoint, might need admin check)
     // 2. Display the full order details (items, costs, addresses etc.) in a modal or a new page section.
     // This would require a GET request like:
     // try {
     //     const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, { credentials: 'include' }); // Requires admin auth
     //     if (response.ok) {
     //          const orderDetails = await response.json();
     //          console.log('Order details:', orderDetails.data);
     //          // Render the order details in a modal or a specific div
     //     } else {
     //          console.error('Failed to fetch order details:', response.statusText);
     //          alert('Failed to load order details.');
     //           if (response.status === 401 || response.status === 403) renderAccessDenied();
     //     }
     // } catch (error) {
     //      console.error('View order details error:', error);
     //      alert('An error occurred while loading order details.');
     // }
}


// --- Stripe Redirect Handling (for after checkout) ---
// This code runs when the browser is redirected back from Stripe after payment

// Check if the current URL has query parameters from Stripe redirect
const urlParams = new URLSearchParams(window.location.search);
const orderIdFromUrl = urlParams.get('orderId'); // Get the orderId from the success URL

// Function to handle displaying the success/cancel message
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

// Check for Stripe redirect parameters when the script loads
if (orderIdFromUrl) {
   // If orderId is present, it's a success redirect
    handleCheckoutRedirect(orderIdFromUrl, true);
} else if (window.location.pathname.includes('/checkout-cancel')) {
   // If '/checkout-cancel' is in the path, it's a cancel redirect
    handleCheckoutRedirect(null, false); // No orderId for cancel, pass null
} else {
   // If no specific redirect parameters, render the normal page based on hash
    renderPage();
}
