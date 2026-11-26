import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  ChevronsUpDown,
  LogOut,
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
  const navigate = useNavigate()
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t } = useTranslation(['admin'])
  const { isMobile, setOpenMobile } = useSidebar()
  const { user, logout, isLoading } = useAdminAuth()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const isRtl = side === 'right'

  const handleProfileClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      navigate(`/${lang}/login`, { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  const name = user?.display_name || 'System Operator'
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
            <DropdownMenuGroup>
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
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={<Link to={`/${lang}/profile`} onClick={handleProfileClick} />}
                className="gap-2 cursor-pointer"
              >
                <User className="size-4" />
                <span>{t('admin:nav.profile', 'Operator Profile')}</span>
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
              <span>{t('admin:logout', 'Logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

