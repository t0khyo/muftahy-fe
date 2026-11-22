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
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Textarea } from '@workspace/ui/components/textarea'
import { Field, FieldLabel, FieldGroup } from '@workspace/ui/components/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
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
      <DialogContent className="sm:max-w-lg p-6">
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
        <DialogTitle>{t('admin.ticketsModule.resolveTicket', 'Resolve Ticket')}</DialogTitle>
        <DialogDescription>
          Ticket #{ticket.id.slice(0, 8)}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="outcome-select">{t('admin.ticketsModule.outcome', 'Resolution Action')}</FieldLabel>
            <Select
              value={outcome}
              onValueChange={(val) => setOutcome(val as TicketOutcome)}
            >
              <SelectTrigger id="outcome-select" className="w-full h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="replacement">{t('admin.ticketsModule.outcomeReplacement', 'Provide Replacement Key')}</SelectItem>
                  <SelectItem value="refund">{t('admin.ticketsModule.outcomeRefund', 'Issue Refund')}</SelectItem>
                  <SelectItem value="refused">{t('admin.ticketsModule.outcomeRefused', 'Refuse / Invalid Claim')}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          {outcome === 'replacement' && (
            <Field>
              <FieldLabel htmlFor="key-id-input">{t('admin.ticketsModule.replacementKey', 'Replacement Key ID')}</FieldLabel>
              <Input
                id="key-id-input"
                value={replacementKeyId}
                onChange={(e) => setReplacementKeyId(e.target.value)}
                placeholder="Optional key ID from replacement pool"
                className="h-9 font-mono text-xs"
              />
            </Field>
          )}

          <Field orientation="horizontal" className="justify-between rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <FieldLabel htmlFor="admin-override" className="text-xs font-normal cursor-pointer leading-tight">
              {t('admin.ticketsModule.adminOverride', 'Override Replacement Policy')}
            </FieldLabel>
            <Checkbox
              id="admin-override"
              checked={adminOverride}
              onCheckedChange={(checked) => setAdminOverride(Boolean(checked))}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="cust-msg">{t('admin.ticketsModule.internalNote', 'Message to Customer')}</FieldLabel>
            <Textarea
              id="cust-msg"
              rows={4}
              value={customerMessage}
              onChange={(e) => setCustomerMessage(e.target.value)}
              placeholder="Explain the resolution and details..."
              className="min-h-24"
            />
          </Field>
        </FieldGroup>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-4">
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
