import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Field, FieldLabel, FieldGroup } from '@workspace/ui/components/field'
import { InputGroup, InputGroupInput, InputGroupAddon } from '@workspace/ui/components/input-group'
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover'
import { Calendar } from '@workspace/ui/components/calendar'
import { Calendar as CalendarIcon, X, Percent } from 'lucide-react'
import { formatDate } from '@workspace/domain/formatters/date'
import { FormErrorAlert } from '../../../components/feedback/form-error-alert'
import { useCreatePromo } from '../hooks/use-promos'

interface PromoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PromoFormDialog({ open, onOpenChange }: PromoFormDialogProps) {
  const { t } = useTranslation(['admin'])
  const { lang = 'en' } = useParams<{ lang: string }>()
  const createMutation = useCreatePromo({ errorMode: 'inline' })

  const [code, setCode] = React.useState('')
  const [discount, setDiscount] = React.useState('')
  const [maxTotalUses, setMaxTotalUses] = React.useState('')
  const [maxUsesPerUser, setMaxUsesPerUser] = React.useState('1')
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined)
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false)

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      createMutation.reset()
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const discountNum = parseFloat(discount)
    if (!code || isNaN(discountNum) || discountNum <= 0 || discountNum > 100) return

    createMutation.reset()
    try {
      await createMutation.mutateAsync({
        code: code.trim().toUpperCase(),
        discount_percentage: discountNum,
        max_total_uses: maxTotalUses ? parseInt(maxTotalUses, 10) : null,
        max_uses_per_user: maxUsesPerUser ? parseInt(maxUsesPerUser, 10) : null,
        expires_at: selectedDate ? selectedDate.toISOString() : null,
      })
      setCode('')
      setDiscount('')
      setMaxTotalUses('')
      setMaxUsesPerUser('1')
      setSelectedDate(undefined)
      setIsCalendarOpen(false)
      onOpenChange(false)
    } catch {
      // Keeps dialog open; FormErrorAlert renders 400/409/422 and MutationCache handles toast errors
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader>
          <DialogTitle>{t('admin:promosModule.createPromo', 'Create Discount Code')}</DialogTitle>
          <DialogDescription>
            Create a new discount code with percentage discount and usage limits.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <FormErrorAlert error={createMutation.error} />
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="promo-code">{t('admin.promosModule.promoCode', 'Promo Code')}</FieldLabel>
              <Input
                id="promo-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. FLASH25"
                className="h-9 font-mono uppercase font-bold"
                required
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="promo-disc">{t('admin.promosModule.discountPercentage', 'Discount %')}</FieldLabel>
                <InputGroup className="h-9">
                  <InputGroupInput
                    id="promo-disc"
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="20"
                    className="font-mono"
                    required
                  />
                  <InputGroupAddon align="inline-end">
                    <Percent className="size-3.5 text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
              </Field>

              <Field>
                <FieldLabel htmlFor="promo-expiry">{t('admin.promosModule.expiresAt', 'Expiration Date')}</FieldLabel>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger
                    render={
                      <Button
                        id="promo-expiry"
                        type="button"
                        variant="outline"
                        className="w-full justify-start text-start font-normal h-9 text-xs"
                      >
                        <CalendarIcon className="me-2 size-3.5 text-muted-foreground shrink-0" />
                        {selectedDate ? (
                          <span className="font-mono text-foreground truncate">
                            {formatDate(selectedDate, { locale: lang, dateStyle: 'medium' })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground truncate">
                            {t('admin.promosModule.pickDate', 'Pick expiration date')}
                          </span>
                        )}
                        {selectedDate && (
                          <span
                            role="button"
                            tabIndex={0}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedDate(undefined)
                            }}
                            className="ms-auto rounded p-0.5 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
                            aria-label={t('admin.common.clear', 'Clear date')}
                          >
                            <X className="size-3" />
                          </span>
                        )}
                      </Button>
                    }
                  />
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date)
                        setIsCalendarOpen(false)
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="promo-max-total">{t('admin.promosModule.maxUses', 'Max Total Redemptions')}</FieldLabel>
                <Input
                  id="promo-max-total"
                  type="number"
                  min="1"
                  value={maxTotalUses}
                  onChange={(e) => setMaxTotalUses(e.target.value)}
                  placeholder="Unlimited"
                  className="h-9 font-mono"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="promo-max-user">Per-User Limit</FieldLabel>
                <Input
                  id="promo-max-user"
                  type="number"
                  min="1"
                  value={maxUsesPerUser}
                  onChange={(e) => setMaxUsesPerUser(e.target.value)}
                  placeholder="1"
                  className="h-9 font-mono"
                />
              </Field>
            </div>
          </FieldGroup>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-4">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              {t('admin.common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" size="sm" disabled={createMutation.isPending}>
              {createMutation.isPending ? t('admin.common.loading', 'Creating...') : t('admin.promosModule.createPromo', 'Create Discount')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

