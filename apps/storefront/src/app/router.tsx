import { createBrowserRouter, Navigate } from 'react-router'
import { CatchAllRedirect } from './catch-all-redirect'
import { CartRoute } from '../routes/cart-route'
import { CheckoutRoute } from '../routes/checkout-route'
import { DesignRoute } from '../routes/design-route'
import { HomeRoute } from '../routes/home'
import { ProductDetailRoute } from '../routes/product-detail-route'
import { ProductsRoute } from '../routes/products-route'
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
