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
import { Checkbox } from '@workspace/ui/components/checkbox'
import { useTranslation } from 'react-i18next'
import { useResolveTicket, useTicketDetail } from '../hooks/use-tickets'
import type { TicketDetail, TicketOutcome } from '@workspace/domain/schemas/ticket'

interface TicketResolveDialogProps {
  ticket?: TicketDetail | null
  ticketId?: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TicketResolveDialog({
  ticket: propTicket,
  ticketId,
  open,
  onOpenChange,
}: TicketResolveDialogProps) {
  const effectiveId = ticketId ?? propTicket?.id ?? ''
  const { data: fetchedTicket } = useTicketDetail(effectiveId)
  const ticket = propTicket ?? fetchedTicket

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {open && ticket && (
          <TicketResolveContent
            key={ticket.id}
            ticket={ticket}
            onSuccess={() => onOpenChange(false)}
            onCancel={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function TicketResolveContent({
  ticket,
  onSuccess,
  onCancel,
}: {
  ticket: TicketDetail
  onSuccess: () => void
  onCancel: () => void
}) {
  const { t } = useTranslation()
  const resolveMutation = useResolveTicket()

  const [outcome, setOutcome] = React.useState<TicketOutcome>('replacement')
  const [replacementKeyId, setReplacementKeyId] = React.useState('')
  const [adminOverride, setAdminOverride] = React.useState(false)
  const [customerMessage, setCustomerMessage] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await resolveMutation.mutateAsync({
        ticketId: ticket.id,
        payload: {
          outcome,
          replacement_key_id: outcome === 'replacement' && replacementKeyId ? replacementKeyId : undefined,
          admin_override: adminOverride,
          customer_message: customerMessage || undefined,
        },
      })
      onSuccess()
    } catch {
      // Handled
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('admin.ticketsModule.resolveTicket', 'Resolve Support Dispute')}</DialogTitle>
        <DialogDescription>
          Ticket #{ticket.id.slice(0, 8)}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 mt-3 text-xs">
        <div className="space-y-1.5">
          <Label htmlFor="outcome-select">{t('admin.ticketsModule.outcome', 'Resolution Decision')}</Label>
          <select
            id="outcome-select"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as TicketOutcome)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="replacement">{t('admin.ticketsModule.outcomeReplacement', 'Provide Replacement Key')}</option>
            <option value="refund">{t('admin.ticketsModule.outcomeRefund', 'Issue Refund')}</option>
            <option value="refused">{t('admin.ticketsModule.outcomeRefused', 'Refuse / Invalid Claim')}</option>
          </select>
        </div>

        {outcome === 'replacement' && (
          <div className="space-y-1.5">
            <Label htmlFor="key-id-input">{t('admin.ticketsModule.replacementKey', 'Replacement Key UUID')}</Label>
            <Input
              id="key-id-input"
              value={replacementKeyId}
              onChange={(e) => setReplacementKeyId(e.target.value)}
              placeholder="Optional UUID from replacement pool"
              className="font-mono text-xs"
            />
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Checkbox
            id="admin-override"
            checked={adminOverride}
            onCheckedChange={(checked) => setAdminOverride(Boolean(checked))}
          />
          <Label htmlFor="admin-override" className="text-xs font-normal cursor-pointer leading-tight">
            {t('admin.ticketsModule.adminOverride', 'Admin Override Replacement Policy')}
          </Label>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cust-msg">{t('admin.ticketsModule.internalNote', 'Operator Message to Customer')}</Label>
          <textarea
            id="cust-msg"
            rows={3}
            value={customerMessage}
            onChange={(e) => setCustomerMessage(e.target.value)}
            placeholder="Explain the inspection outcome and resolution details..."
            className="w-full rounded-md border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            {t('admin.common.cancel', 'Cancel')}
          </Button>
          <Button type="submit" size="sm" disabled={resolveMutation.isPending}>
            {resolveMutation.isPending ? t('admin.common.loading', 'Resolving...') : t('admin.ticketsModule.resolveTicket', 'Resolve')}
          </Button>
        </div>
      </form>
    </>
  )
}
