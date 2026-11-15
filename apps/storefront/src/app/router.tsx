import { createBrowserRouter, Navigate } from 'react-router'
import { ProductsRoute } from '../routes/products-route'
import { RootLayout } from './root-layout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/en/products" replace />,
  },
  {
    path: '/:lang',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="products" replace />,
      },
      {
        path: 'products',
        element: <ProductsRoute />,
      },
      {
        path: '*',
        element: <Navigate to="products" replace />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/en/products" replace />,
  },
])

