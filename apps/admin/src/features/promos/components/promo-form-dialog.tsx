import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { useTranslation } from 'react-i18next'
import { useCreatePromo } from '../hooks/use-promos'

interface PromoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PromoFormDialog({ open, onOpenChange }: PromoFormDialogProps) {
  const { t } = useTranslation()
  const createMutation = useCreatePromo()

  const [code, setCode] = React.useState('')
  const [discount, setDiscount] = React.useState('')
  const [maxTotalUses, setMaxTotalUses] = React.useState('')
  const [maxUsesPerUser, setMaxUsesPerUser] = React.useState('1')
  const [expiresAt, setExpiresAt] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const discountNum = parseFloat(discount)
    if (!code || isNaN(discountNum) || discountNum <= 0 || discountNum > 100) return

    try {
      await createMutation.mutateAsync({
        code: code.trim().toUpperCase(),
        discount_percentage: discountNum,
        max_total_uses: maxTotalUses ? parseInt(maxTotalUses, 10) : null,
        max_uses_per_user: maxUsesPerUser ? parseInt(maxUsesPerUser, 10) : null,
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      })
      setCode('')
      setDiscount('')
      setMaxTotalUses('')
      setMaxUsesPerUser('1')
      setExpiresAt('')
      onOpenChange(false)
    } catch {
      // Handled
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('admin.promosModule.createPromo', 'Create Promo Campaign')}</DialogTitle>
          <DialogDescription>
            Generate a new coupon code with usage constraints and percentage discounts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-3 text-xs">
          <div className="space-y-1">
            <Label htmlFor="promo-code">{t('admin.promosModule.promoCode', 'Promo Code')}</Label>
            <Input
              id="promo-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. FLASH25"
              className="font-mono uppercase font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="promo-disc">{t('admin.promosModule.discountPercentage', 'Discount %')}</Label>
              <Input
                id="promo-disc"
                type="number"
                min="1"
                max="100"
                step="1"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="20"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="promo-expiry">{t('admin.promosModule.expiresAt', 'Expiration Date')}</Label>
              <Input
                id="promo-expiry"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="promo-max-total">{t('admin.promosModule.maxUses', 'Max Total Redemptions')}</Label>
              <Input
                id="promo-max-total"
                type="number"
                min="1"
                value={maxTotalUses}
                onChange={(e) => setMaxTotalUses(e.target.value)}
                placeholder="Unlimited"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="promo-max-user">Per-User Limit</Label>
              <Input
                id="promo-max-user"
                type="number"
                min="1"
                value={maxUsesPerUser}
                onChange={(e) => setMaxUsesPerUser(e.target.value)}
                placeholder="1"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              {t('admin.common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" size="sm" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('admin.common.loading', 'Creating...') : t('admin.promosModule.createPromo', 'Create Code')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

