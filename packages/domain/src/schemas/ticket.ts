import { z } from 'zod'

export const commentResponseSchema = z.object({
  id: z.string().uuid(),
  author_type: z.enum(['customer', 'admin', 'system']),
  author_name: z.string(),
  content: z.string().min(1),
  created_at: z.string().min(1),
})

export type CommentResponse = z.infer<typeof commentResponseSchema>

export const attachmentResponseSchema = z.object({
  id: z.string().uuid(),
  file_name: z.string(),
  file_size_bytes: z.number().int().nonnegative(),
  created_at: z.string().min(1),
})

export type AttachmentResponse = z.infer<typeof attachmentResponseSchema>

export const ticketStatusSchema = z.enum(['open', 'in_progress', 'resolved', 'closed'])
export type TicketStatus = z.infer<typeof ticketStatusSchema>

export const ticketOutcomeSchema = z.enum(['replacement', 'refund', 'refused'])
export type TicketOutcome = z.infer<typeof ticketOutcomeSchema>

export const ticketDetailSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  order_item_id: z.string().uuid(),
  key_serial: z.string().min(1),
  status: ticketStatusSchema,
  outcome: ticketOutcomeSchema.nullable().optional(),
  is_locked: z.boolean().default(false),
  admin_override: z.boolean().default(false),
  replacement_key_serial: z.string().nullable().optional(),
  comments: z.array(commentResponseSchema).default([]),
  attachments: z.array(attachmentResponseSchema).default([]),
  created_at: z.string().min(1),
  resolved_at: z.string().nullable().optional(),
})

export type TicketDetail = z.infer<typeof ticketDetailSchema>

export const ticketDetailListSchema = z.array(ticketDetailSchema)

export const openTicketFormSchema = z.object({
  order_item_id: z.string().uuid({ message: 'Valid order item ID is required' }),
  initial_comment: z.string().min(10, 'Please provide details about the activation failure (at least 10 characters)'),
  attachments: z.array(
    z.custom<File>((val) => typeof File !== 'undefined' && val instanceof File, {
      message: 'Must be a valid file',
    }),
  ).max(3, 'Maximum 3 attachments allowed').optional(),
})

export type OpenTicketFormInput = z.infer<typeof openTicketFormSchema>

export const addCommentFormSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
})

export type AddCommentFormInput = z.infer<typeof addCommentFormSchema>
