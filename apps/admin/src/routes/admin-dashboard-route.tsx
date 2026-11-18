import * as React from 'react'
import { useParams, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  ShieldCheck,
  LogOut,
  Moon,
  Sun,
  Globe,
  Loader2,
  DollarSign,
  Key,
  ShoppingCart,
  CheckCircle2,
  PackageCheck,
  TrendingUp,
} from 'lucide-react'
import { useAdminAuth } from '../features/auth/hooks/use-admin-auth'
import { useTheme } from '../app/theme-context'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'

export function AdminDashboardRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t } = useTranslation(['admin', 'auth'])
  const { user, logout, isLoading } = useAdminAuth()
  const { theme, setTheme } = useTheme()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const otherLang = lang === 'ar' ? 'en' : 'ar'
  const otherLangLabel = lang === 'ar' ? 'English' : 'العربية'

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  const recentActivities = [
    {
      id: 'EVT-9041',
      action: 'License Pool Ingestion',
      product: 'Office 2024 Pro Plus (x500 keys)',
      operator: 'admin1@souqmuftah.com',
      time: '12 mins ago',
      status: 'completed',
    },
    {
      id: 'EVT-9040',
      action: 'Regional Tier Adjustment',
      product: 'Xbox Game Pass Ultimate 3M',
      operator: 'admin1@souqmuftah.com',
      time: '1 hour ago',
      status: 'completed',
    },
    {
      id: 'EVT-9039',
      action: 'Order Refund Verification',
      product: 'ORD-78192 (Cyberpunk 2077)',
      operator: 'admin1@souqmuftah.com',
      time: '3 hours ago',
      status: 'reviewed',
    },
    {
      id: 'EVT-9038',
      action: 'Stock Health Alert',
      product: 'PlayStation Network 50 USD',
      operator: 'System Daemon',
      time: '5 hours ago',
      status: 'warning',
    },
  ]

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold tracking-tight">Muftahy</span>
            <Badge variant="secondary" className="font-mono text-[10px] uppercase tracking-wider">
              Admin
            </Badge>
          </div>
          <span className="hidden text-xs text-muted-foreground sm:inline-block">/</span>
          <span className="hidden text-xs font-medium sm:inline-block">
            {t('admin:dashboard', 'Dashboard')}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Operator Identity Badge */}
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-xs shadow-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <div className="text-start">
              <span className="font-medium">{user?.full_name || 'System Admin'}</span>
              <span className="hidden text-[10px] text-muted-foreground sm:inline ms-1.5 font-mono">
                ({user?.email || 'admin1@souqmuftah.com'})
              </span>
            </div>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-8 w-8 p-0"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Language Switcher */}
          <Button
            variant="ghost"
            size="sm"
            render={<Link to={`/${otherLang}`} />}
            className="h-8 gap-1.5 text-xs"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>{otherLangLabel}</span>
          </Button>

          {/* Logout Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={isLoading || isLoggingOut}
            className="h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            {isLoggingOut ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5 rtl:rotate-180" />
            )}
            <span className="hidden sm:inline">{t('admin:logoutConfirm', 'End Session')}</span>
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t('admin:title', 'Muftahy Admin Portal')}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t('admin:subtitle', 'Secure Operator Console')} — {t('admin:operatorSession')}:{' '}
              <span className="font-medium text-foreground">{user?.email}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>API Gateway Connected</span>
            </Badge>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('admin:totalRevenue', 'Total Revenue')}
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <DollarSign className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">EGP 458,250</div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                <span>+12.5% from last month</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('admin:activeLicenses', 'Active Licenses')}
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Key className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,842</div>
              <p className="text-xs text-muted-foreground mt-1">Encrypted codes ready in pool</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('admin:pendingOrders', 'Pending Orders')}
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ShoppingCart className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">14</div>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Requires manual fraud review</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Fulfillment Rate
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.8%</div>
              <p className="text-xs text-muted-foreground mt-1">Automated dispatch latency &lt; 2s</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Operator Activity & Management Modules */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Activity Table */}
          <Card className="border-border lg:col-span-2">
            <CardHeader className="text-start">
              <CardTitle className="text-lg font-semibold">{t('admin:recentActivity', 'Recent Activity')}</CardTitle>
              <CardDescription>Audit trail of operations across inventory, orders, and pricing.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-start">Action</TableHead>
                    <TableHead className="text-start">Target / Product</TableHead>
                    <TableHead className="text-start">Operator</TableHead>
                    <TableHead className="text-start">Time</TableHead>
                    <TableHead className="text-end">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivities.map((act) => (
                    <TableRow key={act.id}>
                      <TableCell className="font-medium text-start">{act.action}</TableCell>
                      <TableCell className="text-muted-foreground text-start">{act.product}</TableCell>
                      <TableCell className="font-mono text-xs text-start">{act.operator}</TableCell>
                      <TableCell className="text-muted-foreground text-xs text-start">{act.time}</TableCell>
                      <TableCell className="text-end">
                        <Badge
                          variant={
                            act.status === 'completed'
                              ? 'default'
                              : act.status === 'warning'
                                ? 'destructive'
                                : 'secondary'
                          }
                          className="capitalize text-[10px]"
                        >
                          {act.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick Operations Modules */}
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader className="text-start">
                <CardTitle className="text-base font-semibold">{t('admin:quickStats', 'Quick Operations')}</CardTitle>
                <CardDescription>Primary administrative workstations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/40">
                  <div className="flex items-center gap-3">
                    <PackageCheck className="h-5 w-5 text-primary" />
                    <div className="text-start">
                      <p className="text-sm font-medium">{t('admin:products', 'Products Management')}</p>
                      <p className="text-xs text-muted-foreground">Manage SKUs, categories, and tags</p>
                    </div>
                  </div>
                  <Badge variant="outline">Browse</Badge>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/40">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-5 w-5 text-blue-500" />
                    <div className="text-start">
                      <p className="text-sm font-medium">{t('admin:orders', 'Orders & Fulfillment')}</p>
                      <p className="text-xs text-muted-foreground">Review orders and issue refunds</p>
                    </div>
                  </div>
                  <Badge variant="outline">Review</Badge>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/40">
                  <div className="flex items-center gap-3">
                    <Key className="h-5 w-5 text-amber-500" />
                    <div className="text-start">
                      <p className="text-sm font-medium">{t('admin:inventory', 'Key Inventory')}</p>
                      <p className="text-xs text-muted-foreground">Encrypted code repository & batch ingestion</p>
                    </div>
                  </div>
                  <Badge variant="outline">Manage</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
