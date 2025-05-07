import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            EcomerceX
          </Link>
          <div className="space-x-4">
            <Link to="/customer/products" className="text-gray-600 hover:text-indigo-600">
              Products
            </Link>
            <Link to="/auth/login" className="text-gray-600 hover:text-indigo-600">
              Login
            </Link>
            <Link to="/auth/register" className="text-gray-600 hover:text-indigo-600">
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-grow container mx-auto px-6 py-16 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
            Discover Amazing Products
          </h1>
          <p className="mt-6 text-lg text-gray-700">
            Explore our curated collection of the best products. Quality you can trust.
          </p>
          <Link
            to="/customer/products"
            className="inline-block mt-8 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Shop Now
          </Link>
        </div>
        <div className="lg:w-1/2 mt-10 lg:mt-0">
          <img src="/images/hero-image.png" alt="Hero" className="w-full h-auto" />
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* Feature Item */}
          <div className="text-center">
            <div className="text-4xl">🚚</div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Free Shipping</h3>
            <p className="mt-2 text-gray-600">On all orders over $50.</p>
          </div>
          {/* Feature Item */}
          <div className="text-center">
            <div className="text-4xl">🔒</div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">Secure Payment</h3>
            <p className="mt-2 text-gray-600">100% secure payment processing.</p>
          </div>
          {/* Feature Item */}
          <div className="text-center">
            <div className="text-4xl">📞</div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">24/7 Support</h3>
            <p className="mt-2 text-gray-600">We're here to help you anytime.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400">
        <div className="container mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} EcomerceX. All rights reserved.</p>
          <div className="space-x-4 mt-4 sm:mt-0">
            <Link to="#" className="hover:text-white">Privacy Policy</Link>
            <Link to="#" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
