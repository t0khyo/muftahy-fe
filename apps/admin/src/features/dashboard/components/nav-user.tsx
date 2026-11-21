import * as React from 'react'
import {
  ChevronsUpDown,
  LogOut,
  ShieldCheck,
  User,
  Loader2,
} from 'lucide-react'
import { Blobatar } from '@workspace/ui/components/blobatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@workspace/ui/components/sidebar'
import { useAdminAuth } from '../../auth/hooks/use-admin-auth'

export function NavUser({ side }: { side?: 'left' | 'right' } = {}) {
  const { isMobile } = useSidebar()
  const { user, logout, isLoading } = useAdminAuth()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const isRtl = side === 'right'

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  const name = user?.full_name || 'System Operator'
  const email = user?.email || 'admin1@souqmuftah.com'

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              />
            }
          >
            <Blobatar
              name={name}
              className="size-8 rounded-lg"
              blobatar={{
                animate: 'hover',
              }}
            />
            <div className="grid flex-1 text-start text-xs leading-tight">
              <span className="truncate font-semibold">{name}</span>
              <span className="truncate text-[10px] text-muted-foreground font-mono">
                {email}
              </span>
            </div>
            <ChevronsUpDown className="ms-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : isRtl ? 'left' : 'right'}
            align={isRtl ? 'start' : 'end'}
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-start text-xs">
                <Blobatar
                  name={name}
                  className="size-8 rounded-lg"
                  blobatar={{
                    animate: 'hover',
                  }}
                />
                <div className="grid flex-1 text-start text-xs leading-tight">
                  <span className="truncate font-semibold">{name}</span>
                  <span className="truncate text-[10px] text-muted-foreground font-mono">
                    {email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Zero-Trust Session Active</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <User className="size-4" />
                <span>Operator Profile</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              disabled={isLoading || isLoggingOut}
              variant="destructive"
              className="gap-2 cursor-pointer"
            >
              {isLoggingOut ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4 rtl:rotate-180" />
              )}
              <span>End Admin Session</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

