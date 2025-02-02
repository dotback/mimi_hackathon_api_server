import { z } from 'zod'

export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleError(error: unknown) {
  if (error instanceof ApiError) {
    return {
      error: {
        message: error.message,
        code: error.code,
      },
    }
  }

  if (error instanceof z.ZodError) {
    return {
      error: {
        message: 'Validation error',
        code: 400,
        details: error.errors,
      },
    }
  }

  console.error('Unexpected error:', error)
  return {
    error: {
      message: 'Internal server error',
      code: 500,
    },
  }
}
