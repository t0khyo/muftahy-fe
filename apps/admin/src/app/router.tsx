import { createBrowserRouter, Navigate } from 'react-router'
import { RootLayout } from './root-layout'
import { CatchAllRedirect } from './catch-all-redirect'
import { AdminNotFoundRoute } from '../routes/admin-not-found-route'
import { AdminLoginRoute } from '../routes/admin-login-route'
import { AdminDashboardRoute } from '../routes/admin-dashboard-route'
import { AdminProductsRoute } from '../routes/admin-products-route'
import { AdminProductEditorRoute } from '../routes/admin-product-editor-route'
import { AdminCategoriesRoute } from '../routes/admin-categories-route'
import { AdminOrdersRoute } from '../routes/admin-orders-route'
import { AdminInventoryRoute } from '../routes/admin-inventory-route'
import { AdminTicketsRoute } from '../routes/admin-tickets-route'
import { AdminPromosRoute } from '../routes/admin-promos-route'
import { AdminLedgerRoute } from '../routes/admin-ledger-route'
import { AdminAuditRoute } from '../routes/admin-audit-route'
import { AdminProfileRoute } from '../routes/admin-profile-route'
import { AdminGuard } from '../features/auth/components/admin-guard'
import { AdminLayout } from '../features/dashboard/components/admin-layout'
import { AdminRouteError } from '../components/admin-route-error'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <CatchAllRedirect />,
  },
  {
    path: '/:lang',
    element: <RootLayout />,
    errorElement: <AdminRouteError />,
    children: [
      {
        path: 'login',
        element: <AdminLoginRoute />,
      },
      {
        element: (
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        ),
        errorElement: <AdminRouteError />,
        children: [
          {
            index: true,
            element: <AdminDashboardRoute />,
          },
          {
            path: 'products',
            element: <AdminProductsRoute />,
          },
          {
            path: 'products/new',
            element: <AdminProductEditorRoute />,
          },
          {
            path: 'products/:id',
            element: <AdminProductEditorRoute />,
          },
          {
            path: 'categories',
            element: <AdminCategoriesRoute />,
          },
          {
            path: 'orders',
            element: <AdminOrdersRoute />,
          },
          {
            path: 'inventory',
            element: <AdminInventoryRoute />,
          },
          {
            path: 'tickets',
            element: <AdminTicketsRoute />,
          },
          {
            path: 'promos',
            element: <AdminPromosRoute />,
          },
          {
            path: 'ledger',
            element: <AdminLedgerRoute />,
          },
          {
            path: 'customers',
            element: <Navigate to="../orders" replace />,
          },
          {
            path: 'audit',
            element: <AdminAuditRoute />,
          },
          {
            path: 'profile',
            element: <AdminProfileRoute />,
          },
        ],
      },
      {
        path: '*',
        element: <AdminNotFoundRoute />,
      },
    ],
  },
  {
    path: '*',
    element: <CatchAllRedirect />,
  },
])
