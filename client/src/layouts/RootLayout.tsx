import { Fragment, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Dialog, Disclosure, Popover, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const categories = [
  { name: 'Men', href: '/?category=men' },
  { name: 'Women', href: '/?category=women' },
  { name: 'Kids', href: '/?category=kids' },
  { name: 'Accessories', href: '/?category=accessories' },
];

export default function RootLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading: authLoading } = useAuth();
  const { items: cartItems } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const totalCartItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <div className="bg-white max-w-[100vw] overflow-x-hidden">
      {/* Header */}
      <header className="relative z-10 border-b border-gray-200">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex lg:flex-1">
              <Link to="/" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Store</span>
                <span className="text-lg font-bold text-indigo-600">Store</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button
                type="button"
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open main menu</span>
                <Bars3Icon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Desktop navigation */}
            <Popover.Group className="hidden lg:flex lg:gap-x-6">
              <Link
                to="/"
                className={clsx(
                  'text-sm font-semibold leading-6 text-gray-900',
                  location.pathname === '/' && 'text-indigo-600'
                )}
              >
                Home
              </Link>
              <Popover className="relative">
                <Popover.Button className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900">
                  Categories
                  <ChevronDownIcon className="h-4 w-4 flex-none text-gray-400" aria-hidden="true" />
                </Popover.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Popover.Panel className="absolute -left-8 top-full z-10 mt-3 w-48 rounded-lg bg-white p-2 shadow-lg ring-1 ring-gray-900/5">
                    {categories.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="block rounded-lg px-3 py-2 text-xs font-semibold leading-6 text-gray-900 hover:bg-gray-50"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </Popover.Panel>
                </Transition>
              </Popover>
            </Popover.Group>

            {/* Desktop right navigation */}
            <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 items-center">
              <Link
                to="/cart"
                className="relative flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span className="sr-only">Shopping cart</span>
                {totalCartItems > 0 && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {totalCartItems}
                  </span>
                )}
              </Link>

              {authLoading ? (
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
              ) : user ? (
                <Popover className="relative">
                  <Popover.Button className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900">
                    <UserIcon className="h-5 w-5" />
                    <span>{user.name.split(' ')[0]}</span>
                    <ChevronDownIcon className="h-4 w-4 flex-none text-gray-400" aria-hidden="true" />
                  </Popover.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                  >
                    <Popover.Panel className="absolute right-0 top-full z-10 mt-3 w-40 rounded-lg bg-white py-1 shadow-lg ring-1 ring-gray-900/5">
                      <Link
                        to="/profile"
                        className="block px-3 py-2 text-xs leading-6 text-gray-900 hover:bg-gray-50"
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full px-3 py-2 text-left text-xs leading-6 text-gray-900 hover:bg-gray-50"
                      >
                        Sign out
                      </button>
                    </Popover.Panel>
                  </Transition>
                </Popover>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-x-1 text-sm font-semibold leading-6 text-gray-900"
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Log in</span>
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
          <div className="fixed inset-0 z-10" />
          <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-4 py-4 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link to="/" className="-m-1.5 p-1.5">
                <span className="sr-only">Your Store</span>
                <span className="text-lg font-bold text-indigo-600">Store</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-4 flow-root">
              <div className="-my-4 divide-y divide-gray-500/10">
                <div className="space-y-1 py-4">
                  <Link
                    to="/"
                    className="-mx-3 block rounded-lg px-3 py-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Disclosure as="div" className="-mx-3">
                    {({ open }) => (
                      <>
                        <Disclosure.Button className="flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50">
                          Categories
                          <ChevronDownIcon
                            className={clsx(
                              open ? 'rotate-180' : '',
                              'h-4 w-4 flex-none'
                            )}
                            aria-hidden="true"
                          />
                        </Disclosure.Button>
                        <Disclosure.Panel className="mt-1 space-y-1">
                          {categories.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="block rounded-lg py-2 pl-6 pr-3 text-xs font-semibold leading-6 text-gray-900 hover:bg-gray-50"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                </div>
                <div className="py-4">
                  <Link
                    to="/cart"
                    className="-mx-3 relative flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingCartIcon className="h-5 w-5" />
                    Cart
                    {totalCartItems > 0 && (
                      <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                        {totalCartItems}
                      </span>
                    )}
                  </Link>
                  {authLoading ? (
                     <div className="-mx-3 block rounded-lg px-3 py-2 text-sm font-semibold leading-6 text-gray-400">
                       Loading...
                     </div>
                  ) : user ? (
                    <>
                      <Link
                        to="/profile"
                        className="-mx-3 flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <UserIcon className="h-5 w-5" />
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="-mx-3 flex w-full items-center gap-x-2 rounded-lg px-3 py-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50"
                      >
                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        Sign out
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="-mx-3 flex items-center gap-x-2 rounded-lg px-3 py-2 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <UserIcon className="h-5 w-5" />
                      Log in
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>

      {/* Main content */}
      <main className="min-h-[calc(100vh-12rem)]">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-8 md:flex md:items-center md:justify-between sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link to="/" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Facebook</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <Link to="/" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Instagram</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <Link to="/" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </Link>
          </div>
          <div className="mt-6 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-500">
              &copy; 2024 Your Store. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 