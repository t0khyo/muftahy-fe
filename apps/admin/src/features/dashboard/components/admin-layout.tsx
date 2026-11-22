import * as React from 'react'
import { Outlet, useParams } from 'react-router'
import { SidebarInset, SidebarProvider } from '@workspace/ui/components/sidebar'
import { TooltipProvider } from '@workspace/ui/components/tooltip'
import { AppSidebar } from './app-sidebar'
import { SiteHeader } from './site-header'

export function AdminLayout() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const isRtl = lang === 'ar'

  return (
    <TooltipProvider>
      <SidebarProvider
        style={{
          '--sidebar-width': '17rem',
          '--header-height': '3.5rem',
        } as React.CSSProperties}
      >
        <AppSidebar
          variant="inset"
          side={isRtl ? 'right' : 'left'}
          dir={isRtl ? 'rtl' : 'ltr'}
        />
        <SidebarInset className="bg-background">
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
              <Outlet />
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}

