import { createBrowserRouter, Navigate } from 'react-router'
import { RootLayout } from './root-layout'
import { CatchAllRedirect } from './catch-all-redirect'
import { AdminLoginRoute } from '../routes/admin-login-route'
import { AdminDashboardRoute } from '../routes/admin-dashboard-route'
import { AdminProductsRoute } from '../routes/admin-products-route'
import { AdminOrdersRoute } from '../routes/admin-orders-route'
import { AdminInventoryRoute } from '../routes/admin-inventory-route'
import { AdminCustomersRoute } from '../routes/admin-customers-route'
import { AdminAuditRoute } from '../routes/admin-audit-route'
import { AdminGuard } from '../features/auth/components/admin-guard'
import { AdminLayout } from '../features/dashboard/components/admin-layout'

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
        path: 'login',
        element: <AdminLoginRoute />,
      },
      {
        element: (
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        ),
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
            path: 'orders',
            element: <AdminOrdersRoute />,
          },
          {
            path: 'inventory',
            element: <AdminInventoryRoute />,
          },
          {
            path: 'customers',
            element: <AdminCustomersRoute />,
          },
          {
            path: 'audit',
            element: <AdminAuditRoute />,
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
    element: <Navigate to="/en" replace />,
  },
])
