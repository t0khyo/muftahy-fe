import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router'
import { AlertCircle, FileCheck, Loader2, Upload, LifeBuoy } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@workspace/ui/components/dialog'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import {
  Alert,
  AlertDescription,
} from '@workspace/ui/components/alert'
import {
  FieldGroup,
  Field,
  FieldLabel,
} from '@workspace/ui/components/field'
import { Card } from '@workspace/ui/components/card'
import { useOpenTicket } from '../../hooks/use-tickets'

interface OpenTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderItemId?: string
  keySerial?: string
  productName?: string
}

export function OpenTicketDialog({
  open,
  onOpenChange,
  orderItemId: initialOrderItemId = '',
  keySerial,
  productName,
}: OpenTicketDialogProps) {
  const { t } = useTranslation('account')
  const { lang = 'ar' } = useParams<{ lang: string }>()
  const navigate = useNavigate()
  const { mutateAsync: openTicket, isPending } = useOpenTicket()

  const [orderItemId, setOrderItemId] = useState(initialOrderItemId)
  const [comment, setComment] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).slice(0, 3)
      setFiles(selected)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    const targetItemId = orderItemId || initialOrderItemId
    if (!targetItemId) {
      setErrorMsg('A valid Order Item ID is required.')
      return
    }

    if (comment.trim().length < 10) {
      setErrorMsg(t('support.dialog.problemPlaceholder'))
      return
    }

    try {
      const newTicket = await openTicket({
        order_item_id: targetItemId,
        initial_comment: comment.trim(),
        attachments: files.length > 0 ? files : undefined,
      })

      onOpenChange(false)
      navigate(`/${lang}/account/support/${newTicket.id}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit defect ticket.'
      setErrorMsg(message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <LifeBuoy className="h-5 w-5 shrink-0" />
            <DialogTitle>{t('support.dialog.title')}</DialogTitle>
          </div>
          <DialogDescription className="pt-1">
            {t('support.dialog.desc')}
          </DialogDescription>
        </DialogHeader>

        {productName && (
          <Card className="bg-muted/60 p-3 text-xs border-border space-y-1">
            <div className="font-semibold text-foreground">{productName}</div>
            {keySerial && (
              <div className="font-mono text-muted-foreground">{keySerial}</div>
            )}
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          <FieldGroup>
            {!initialOrderItemId && (
              <Field>
                <FieldLabel htmlFor="order_item_id">Order Item ID (UUID)</FieldLabel>
                <Input
                  id="order_item_id"
                  value={orderItemId}
                  onChange={(e) => setOrderItemId(e.target.value)}
                  placeholder="e.g. 323e4567-e89b-12d3-a456-426614174000"
                  required
                />
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="initial_comment">{t('support.dialog.problemDescription')}</FieldLabel>
              <Textarea
                id="initial_comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('support.dialog.problemPlaceholder')}
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="ticket_screenshots">{t('support.dialog.attachments')}</FieldLabel>
              <div className="relative flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-4 text-center hover:border-primary/50 transition-colors">
                <input
                  id="ticket_screenshots"
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFilesChange}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                {files.length > 0 ? (
                  <div className="flex flex-wrap gap-2 text-xs text-primary font-medium">
                    {files.map((f) => (
                      <span key={f.name} className="inline-flex items-center gap-1">
                        <FileCheck className="h-3.5 w-3.5" />
                        {f.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {t('orders.detail.dropFilePrompt')}
                  </p>
                )}
              </div>
            </Field>
          </FieldGroup>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              {t('profile.cancel')}
            </Button>
            <Button type="submit" disabled={isPending || comment.trim().length < 10}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin me-2" />}
              {isPending ? t('support.dialog.submitting') : t('support.dialog.submitTicket')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
