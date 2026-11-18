import type { ZodType } from 'zod'
import type { Resolver, FieldValues, FieldErrors } from 'react-hook-form'

/**
 * Lightweight Zod v4 compatible resolver for react-hook-form.
 * Resolves both standard Zod issues and refinements without throwing unhandled errors.
 */
export function zodResolver<TValues extends FieldValues>(
  schema: ZodType<TValues>
): Resolver<TValues> {
  return async (values) => {
    const result = await schema.safeParseAsync(values)
    if (result.success) {
      return {
        values: result.data,
        errors: {} as Record<string, never>,
      }
    }

    const errors: Record<string, { type: string; message?: string }> = {}

    for (const issue of result.error.issues) {
      const path = issue.path.join('.') || 'root'
      if (!errors[path]) {
        errors[path] = {
          type: issue.code,
          message: issue.message,
        }
      }
    }

    return {
      values: {} as Record<string, never>,
      errors: errors as FieldErrors<TValues>,
    }
  }
}
