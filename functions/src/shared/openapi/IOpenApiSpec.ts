import { RouteParameter, ZodRequestBody } from '@asteasolutions/zod-to-openapi/dist/openapi-registry'
import { z } from 'zod'

export interface IOpenApiSpec {
  method: 'get' | 'post' | 'put' | 'delete' | 'patch'
  path: string
  description: string
  tags: string[] | readonly string[]
  request: {
    headers: RouteParameter
    query: RouteParameter
    params: RouteParameter
    body: ZodRequestBody
  }
  responses: {
    [statusCode: number]: {
      description: string
      content: {
        'application/json': {
          schema: z.ZodType
        }
      }
    }
  }
}
