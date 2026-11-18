import { createBrowserRouter, Navigate } from 'react-router'
import { CatchAllRedirect } from './catch-all-redirect'
import { AccountIndexRoute } from '../routes/account-index-route'
import { AccountLayoutRoute } from '../routes/account-layout-route'
import { AccountPlaceholderRoute } from '../routes/account-placeholder-route'
import { CartRoute } from '../routes/cart-route'
import { CheckoutRoute } from '../routes/checkout-route'
import { DesignRoute } from '../routes/design-route'
import { ForgotPasswordRoute } from '../routes/forgot-password-route'
import { HomeRoute } from '../routes/home'
import { LoginRoute } from '../routes/login-route'
import { ProductDetailRoute } from '../routes/product-detail-route'
import { ProductsRoute } from '../routes/products-route'
import { ProfileRoute } from '../routes/profile-route'
import { RegisterRoute } from '../routes/register-route'
import { SearchRoute } from '../routes/search-route'
import { RootLayout } from './root-layout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/en" replace />,
  },
  {
    path: '/:lang',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomeRoute />,
      },
      {
        path: 'products',
        element: <ProductsRoute />,
      },
      {
        path: 'products/:slug',
        element: <ProductDetailRoute />,
      },
      {
        path: 'search',
        element: <SearchRoute />,
      },
      {
        path: 'cart',
        element: <CartRoute />,
      },
      {
        path: 'checkout',
        element: <CheckoutRoute />,
      },
      {
        path: 'design',
        element: <DesignRoute />,
      },
      {
        path: 'login',
        element: <LoginRoute />,
      },
      {
        path: 'register',
        element: <RegisterRoute />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordRoute />,
      },
      {
        path: 'account',
        element: <AccountLayoutRoute />,
        children: [
          {
            index: true,
            element: <AccountIndexRoute />,
          },
          {
            path: 'profile',
            element: <ProfileRoute />,
          },
          {
            path: 'orders',
            element: <AccountPlaceholderRoute type="orders" />,
          },
          {
            path: 'keys',
            element: <AccountPlaceholderRoute type="keys" />,
          },
          {
            path: 'support',
            element: <AccountPlaceholderRoute type="support" />,
          },
        ],
      },
      {
        path: '*',
        element: <CatchAllRedirect />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/en/products" replace />,
  },
])
