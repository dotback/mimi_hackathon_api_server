import type { IntRange } from 'type-fest'
import { z } from 'zod'

export const ErrorResBody = z.object({
  error: z.object({
    message: z.string(),
    cause: z.any().optional(),
  }),
})
export type ErrorResBody = z.infer<typeof ErrorResBody>
export type ErrorCodes = keyof typeof commonErrorSchema
export const commonErrorSchema = {
  400: {
    description: 'Bad request',
    content: {
      'application/json': {
        schema: ErrorResBody,
      },
    },
  },
  401: {
    description: 'Unauthorized',
    content: {
      'application/json': {
        schema: ErrorResBody,
      },
    },
  },
  403: {
    description: 'Forbidden',
    content: {
      'application/json': {
        schema: ErrorResBody,
      },
    },
  },
  404: {
    description: 'Not found',
    content: {
      'application/json': {
        schema: ErrorResBody,
      },
    },
  },
  500: {
    description: 'Internal server error',
    content: {
      'application/json': {
        schema: ErrorResBody,
      },
    },
  },
} as const satisfies Partial<{
  [K in IntRange<400, 501>]: {
    description: string
    content: {
      'application/json': {
        schema: z.ZodType
      }
    }
  }
}>
