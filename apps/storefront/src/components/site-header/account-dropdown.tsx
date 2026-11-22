import { Link, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { User, LogOut, ShoppingBag, KeyRound, LifeBuoy, ChevronDown } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Blobatar } from '@workspace/ui/components/blobatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@workspace/ui/components/dropdown-menu'
import { useAuth } from '../../features/auth/hooks/use-auth'

export function AccountDropdown() {
  const { t } = useTranslation(['auth', 'account', 'common'])
  const { lang = 'ar' } = useParams<{ lang: string }>()
  const { user, isAuthenticated, logout } = useAuth()

  const displayName = user?.full_name || user?.email?.split('@')[0] || t('signIn')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-xs font-medium text-foreground/80 hover:text-foreground cursor-pointer"
            aria-label={isAuthenticated ? t('account:title') : t('signIn')}
          >
            {isAuthenticated ? (
              <Blobatar
                name={user?.full_name || user?.email || displayName}
                className="size-5 shrink-0"
                blobatar={{ animate: 'hover' }}
              />
            ) : (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
            <span className="hidden md:inline max-w-[120px] truncate">{displayName}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-56 p-1.5">
        {isAuthenticated ? (
          <DropdownMenuGroup>
            {/* User greeting */}
            <div className="flex items-center gap-2.5 px-2.5 py-2 border-b border-border/60 mb-1">
              <Blobatar
                name={user?.full_name || user?.email || displayName}
                className="size-8 shrink-0"
                blobatar={{ animate: 'hover' }}
              />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{user?.full_name || displayName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>

            {/* Account navigation items */}
            <DropdownMenuItem render={<Link to={`/${lang}/account/profile`} />} className="gap-2.5 text-xs font-medium">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{t('account:nav.profile')}</span>
            </DropdownMenuItem>

            <DropdownMenuItem render={<Link to={`/${lang}/account/orders`} />} className="gap-2.5 text-xs font-medium">
              <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{t('account:nav.orders')}</span>
            </DropdownMenuItem>

            <DropdownMenuItem render={<Link to={`/${lang}/account/keys`} />} className="gap-2.5 text-xs font-medium">
              <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{t('account:nav.keys')}</span>
            </DropdownMenuItem>

            <DropdownMenuItem render={<Link to={`/${lang}/account/support`} />} className="gap-2.5 text-xs font-medium">
              <LifeBuoy className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{t('account:nav.support')}</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 border-border/60" />

            <DropdownMenuItem
              variant="destructive"
              onClick={() => logout()}
              className="gap-2.5 text-xs font-medium text-destructive cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{t('logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        ) : (
          <div className="p-2 space-y-1.5">
            <Button
              render={<Link to={`/${lang}/login`} />}
              size="sm"
              className="w-full text-xs font-medium cursor-pointer"
            >
              {t('signIn')}
            </Button>
            <Button
              render={<Link to={`/${lang}/register`} />}
              variant="outline"
              size="sm"
              className="w-full text-xs font-medium cursor-pointer"
            >
              {t('createAccount')}
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
