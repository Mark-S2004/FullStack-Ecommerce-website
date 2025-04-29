## 🔐 Phase 1: Authentication & Authorization
@Mark-S2004
### Login Flow
- [ ] **Login Page** (`/login`)
  - [ ] Verify form validation
    - Empty fields show error messages
    - Invalid email format shows error
  - [ ] Test invalid credentials
    - Wrong password shows error toast
    - Non-existent email shows error toast
  - [ ] Test successful login
    - Redirects to home page
    - JWT token stored in localStorage
    - Navbar shows user menu/logout
@Mark-S2004
### Registration Flow
- [ ] **Register Page** (`/register`)
  - [ ] Form validation
    - Required fields marked with *
    - Password strength requirements
    - Email format validation
  - [ ] Test duplicate email
    - Shows "Email already exists" error
  - [ ] Test successful registration
    - Creates user in database
    - Auto-login and redirect to home
@Mark-S2004
### Protected Routes
- [ ] **Access Control**
  - [ ] Verify unauthenticated access to protected routes
    - `/cart` redirects to login
    - `/checkout` redirects to login
  - [ ] Test JWT expiration
    - Expired token redirects to login
    - Shows "Session expired" toast

## 📦 Phase 2: Product Catalog
@Monica-hany
### Product Listing
- [ ] **Product List Page** (`/products`)
  - [ ] Verify product grid layout
    - Images load correctly
    - Price formatting
    - Product names and descriptions
  - [ ] Test search functionality
    - Type in search box (debounced 300ms)
    - Verify case-insensitive results
    - Clear search button works
  - [ ] Test empty states
    - "No products found" message
    - Loading spinner during fetch
@Monica-hany
### Product Details
- [ ] **Product Detail Page** (`/products/:id`)
  - [ ] Verify product information
    - All fields displayed correctly
    - Image gallery if multiple images
  - [ ] Test "Add to Cart" button
    - Updates cart count in navbar
    - Shows success toast
  - [ ] Test stock validation
    - Out of stock shows disabled button
    - Low stock shows warning

## 🛒 Phase 3: Shopping Cart
@Patrick-ramez
### Cart Management
- [ ] **Cart Page** (`/cart`)
  - [ ] Verify cart items
    - Correct quantities
    - Price calculations
    - Image thumbnails
  - [ ] Test quantity updates
    - Increase/decrease buttons
    - Input field validation
  - [ ] Test remove item
    - Confirmation dialog
    - Updates total
  - [ ] Test empty cart
    - Shows empty state message
    - "Continue Shopping" button
@Patrick-ramez
### Cart Integration
- [ ] **Cart Context**
  - [ ] Verify cart persistence
    - Items remain after page refresh
    - Syncs across browser tabs
  - [ ] Test maximum quantity
    - Cannot exceed stock
    - Shows error toast

## 💳 Phase 4: Checkout Process
@caraxesmsc
### Checkout Flow
- [ ] **Checkout Page** (`/checkout`)
  - [ ] Verify form sections
    - Shipping address
    - Payment method
    - Order summary
  - [ ] Test form validation
    - Required fields
    - Address format
    - Card number format
  - [ ] Test Stripe integration
    - Test card: 4242 4242 4242 4242
    - Expiry: Any future date
    - CVC: Any 3 digits
  - [ ] Test error scenarios
    - Insufficient funds
    - Invalid card
    - Network errors
@caraxesmsc
### Order Confirmation
- [ ] **Order Success Page** (`/order-success/:id`)
  - [ ] Verify order details
    - Order number
    - Items list
    - Total amount
    - Shipping address
  - [ ] Test email receipt
    - Check inbox for order confirmation
  - [ ] Verify cart cleared
    - Cart is empty after order
    - Local storage updated

## 🚚 Phase 5: Shipping & Tax
@caraxesmsc
### Shipping Calculation
- [ ] **Shipping Options**
  - [ ] Test different addresses
    - Domestic vs international
    - Remote locations
  - [ ] Verify shipping costs
    - Free shipping threshold
    - Express shipping premium
  - [ ] Test address validation
    - Invalid postal codes
    - Unsupported regions
@caraxesmsc
### Tax Calculation
- [ ] **Tax Rates**
  - [ ] Test different regions
    - State/province taxes
    - International taxes
  - [ ] Verify tax display
    - Breakdown in cart
    - Included in checkout total
  - [ ] Test tax exemptions
    - Non-taxable items
    - Tax-exempt customers

## 🔎 Phase 6: Search & Filter
@caraxesmsc
### Search Functionality
- [ ] **Product Search**
  - [ ] Test search API (`/api/products?search=...`)
    - Case-insensitive matching
    - Partial word matches
    - Special characters
  - [ ] Verify search UI
    - Debounce working (300ms)
    - Clear search button
    - Loading states
@caraxesmsc
### Filter Integration
- [ ] **Filter Options**
  - [ ] Test category filters
    - Multiple selection
    - Clear filters
  - [ ] Test price range
    - Min/max validation
    - Dynamic results
  - [ ] Test sort options
    - Price high/low
    - Name A-Z
    - Newest first

## 🧪 Phase 7: Edge Cases & Integration

### Error Handling
- [ ] **API Errors**
  - [ ] Test network failures
    - Offline mode
    - Slow connection
  - [ ] Verify error messages
    - User-friendly text
    - Retry options
  - [ ] Test rate limiting
    - Too many requests
    - API quota exceeded

### Browser Compatibility
- [ ] **Cross-browser Testing**
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge
  - [ ] Mobile browsers

### Performance
- [ ] **Load Testing**
  - [ ] Large product catalogs
  - [ ] Many cart items
  - [ ] Complex searches
  - [ ] Multiple concurrent users

## 📝 Notes for Testers

- All API endpoints require valid JWT token in Authorization header
- Use Stripe test keys for payment testing
- Test data should be reset between test runs
- Document any UI inconsistencies or performance issues
- Verify all toast notifications and error messages
- Check console for any JavaScript errors
- Validate responsive design on different screen sizes

This test plan covers all major features and integration points of the e-commerce application. Each section can be tested independently, but it's recommended to follow the flow from authentication through checkout for a complete end-to-end test.
