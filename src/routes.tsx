import type { ReactNode } from 'react';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import PaymentSuccess from './pages/PaymentSuccess';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Account from './pages/Account';
import Wishlist from './pages/Wishlist';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Forbidden from './pages/Forbidden';
import NotFound from './pages/NotFound';
import { RequireAuth } from './components/auth/RequireAuth';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Home />,
    visible: false,
  },
  {
    name: 'Products',
    path: '/products',
    element: <Products />,
    visible: false,
  },
  {
    name: 'Product Detail',
    path: '/products/:slug',
    element: <ProductDetail />,
    visible: false,
  },
  {
    name: 'Search',
    path: '/search',
    element: <Products />,
    visible: false,
  },
  {
    name: 'Cart',
    path: '/cart',
    element: <Cart />,
    visible: false,
  },
  {
    name: 'Checkout',
    path: '/checkout',
    element: (
      <RequireAuth>
        <Checkout />
      </RequireAuth>
    ),
    visible: false,
  },
  {
    name: 'Payment Success',
    path: '/payment-success',
    element: (
      <RequireAuth>
        <PaymentSuccess />
      </RequireAuth>
    ),
    visible: false,
  },
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
    visible: false,
  },
  {
    name: 'Register',
    path: '/register',
    element: <Login />,
    visible: false,
  },
  {
    name: 'Orders',
    path: '/orders',
    element: (
      <RequireAuth>
        <Orders />
      </RequireAuth>
    ),
    visible: false,
  },
  {
    name: 'Account',
    path: '/account',
    element: (
      <RequireAuth>
        <Account />
      </RequireAuth>
    ),
    visible: false,
  },
  {
    name: 'Wishlist',
    path: '/wishlist',
    element: (
      <RequireAuth>
        <Wishlist />
      </RequireAuth>
    ),
    visible: false,
  },
  {
    name: 'Seller Dashboard',
    path: '/seller',
    element: (
      <RequireAuth allowedRoles={['seller', 'admin']}>
        <SellerDashboard />
      </RequireAuth>
    ),
    visible: false,
  },
  {
    name: 'Admin Dashboard',
    path: '/admin',
    element: (
      <RequireAuth allowedRoles={['admin']}>
        <AdminDashboard />
      </RequireAuth>
    ),
    visible: false,
  },
  {
    name: 'Forbidden',
    path: '/403',
    element: <Forbidden />,
    visible: false,
  },
  {
    name: 'Not Found',
    path: '*',
    element: <NotFound />,
    visible: false,
  },
];

export default routes;