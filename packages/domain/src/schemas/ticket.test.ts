import { describe, expect, it } from 'vitest'
import {
  ticketDetailSchema,
  openTicketFormSchema,
  addCommentFormSchema,
  ticketResolveRequestSchema,
} from './ticket'

describe('ticket schemas', () => {
  describe('ticketDetailSchema', () => {
    it('validates a complete ticket detail payload', () => {
      const payload = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '223e4567-e89b-12d3-a456-426614174001',
        order_item_id: '323e4567-e89b-12d3-a456-426614174002',
        key_serial: 'XXXXX-XXXXX-XXXXX-XXXXX-XXXXX',
        status: 'open',
        outcome: null,
        is_locked: false,
        admin_override: false,
        replacement_key_serial: null,
        comments: [
          {
            id: '423e4567-e89b-12d3-a456-426614174003',
            author_type: 'customer',
            author_name: 'Abdelrahman Eltokhy',
            content: 'Key activation failed with error code 0xC004C003.',
            created_at: '2026-11-20T04:10:00Z',
          },
        ],
        attachments: [
          {
            id: '523e4567-e89b-12d3-a456-426614174004',
            file_name: 'activation_error.png',
            file_size_bytes: 124500,
            created_at: '2026-11-20T04:10:00Z',
          },
        ],
        created_at: '2026-11-20T04:10:00Z',
        resolved_at: null,
      }

      const parsed = ticketDetailSchema.parse(payload)
      expect(parsed.id).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(parsed.status).toBe('open')
      expect(parsed.comments).toHaveLength(1)
      expect(parsed.attachments).toHaveLength(1)
    })

    it('validates resolved ticket with replacement outcome', () => {
      const payload = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '223e4567-e89b-12d3-a456-426614174001',
        order_item_id: '323e4567-e89b-12d3-a456-426614174002',
        key_serial: 'DEFECTIVE-KEY-001',
        status: 'resolved',
        outcome: 'replacement',
        is_locked: true,
        admin_override: false,
        replacement_key_serial: 'REPLACEMENT-KEY-999',
        comments: [],
        attachments: [],
        created_at: '2026-11-20T04:10:00Z',
        resolved_at: '2026-11-20T04:30:00Z',
      }

      const parsed = ticketDetailSchema.parse(payload)
      expect(parsed.status).toBe('resolved')
      expect(parsed.outcome).toBe('replacement')
      expect(parsed.replacement_key_serial).toBe('REPLACEMENT-KEY-999')
    })
  })

  describe('openTicketFormSchema', () => {
    it('validates a correct ticket opening submission', () => {
      const file = new File(['fake image'], 'error.png', { type: 'image/png' })
      const payload = {
        order_item_id: '323e4567-e89b-12d3-a456-426614174002',
        initial_comment: 'The activation code says it was already used on another PC.',
        attachments: [file],
      }

      const parsed = openTicketFormSchema.parse(payload)
      expect(parsed.order_item_id).toBe('323e4567-e89b-12d3-a456-426614174002')
      expect(parsed.attachments).toHaveLength(1)
    })

    it('rejects initial comment shorter than 10 characters', () => {
      const payload = {
        order_item_id: '323e4567-e89b-12d3-a456-426614174002',
        initial_comment: 'broken',
      }

      expect(() => openTicketFormSchema.parse(payload)).toThrow()
    })
  })

  describe('addCommentFormSchema', () => {
    it('validates valid non-empty comment', () => {
      const payload = { content: 'Any update on this ticket please?' }
      const parsed = addCommentFormSchema.parse(payload)
      expect(parsed.content).toBe('Any update on this ticket please?')
    })

    it('rejects empty comment', () => {
      expect(() => addCommentFormSchema.parse({ content: '' })).toThrow()
    })
  })

  describe('ticketResolveRequestSchema', () => {
    it('validates replacement resolution with key ID and admin override', () => {
      const payload = {
        outcome: 'replacement',
        replacement_key_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        admin_override: true,
        customer_message: 'Here is your replacement key.',
      }
      const parsed = ticketResolveRequestSchema.parse(payload)
      expect(parsed.outcome).toBe('replacement')
      expect(parsed.admin_override).toBe(true)
    })

    it('validates refund resolution with default override', () => {
      const payload = { outcome: 'refund' }
      const parsed = ticketResolveRequestSchema.parse(payload)
      expect(parsed.outcome).toBe('refund')
      expect(parsed.admin_override).toBe(false)
    })

    it('rejects invalid outcome', () => {
      expect(() => ticketResolveRequestSchema.parse({ outcome: 'unknown' })).toThrow()
    })
  })
})

