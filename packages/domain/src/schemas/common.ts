import { z } from 'zod'

export const decimalStringSchema = z
  .union([z.string(), z.number()])
  .transform((val) => (typeof val === 'number' ? val.toFixed(2) : val))

export type DecimalString = z.infer<typeof decimalStringSchema>

