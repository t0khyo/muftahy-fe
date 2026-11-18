import { createBrowserRouter, Navigate } from 'react-router'
import { RootLayout } from './root-layout'
import { CatchAllRedirect } from './catch-all-redirect'
import { AdminLoginRoute } from '../routes/admin-login-route'
import { AdminDashboardRoute } from '../routes/admin-dashboard-route'
import { AdminGuard } from '../features/auth/components/admin-guard'

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
        element: (
          <AdminGuard>
            <AdminDashboardRoute />
          </AdminGuard>
        ),
      },
      {
        path: 'login',
        element: <AdminLoginRoute />,
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
