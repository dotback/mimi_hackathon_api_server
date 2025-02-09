import { BasicController } from '@mimi-api/contexts/common/controllers/basic/BasicController'
import { ResCodeOf } from '@mimi-api/contexts/common/controllers/types/ReqRes'
import { commonErrorSchema } from '@mimi-api/shared/openapi/CommonErrorSchema'
import { z } from 'zod'

const schema = {
  pathParams: z.object({}),
  queryParams: z.object({}),
  reqBody: z.object({}),
  resBody: z.object({
    message: z.string(),
  }),
}

const openApiSpec = {
  method: 'get',
  path: '/hello',
  description: 'Hello, World!',
  tags: ['System'],
  request: {
    params: schema.pathParams,
    query: schema.queryParams,
    body: {
      content: {
        'application/json': {
          schema: schema.reqBody,
        },
      },
    },
    headers: undefined,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: schema.resBody,
        },
      },
    },
    ...commonErrorSchema,
  },
} as const

type ReqBody = z.infer<typeof schema.reqBody>
type ResBody = z.infer<typeof schema.resBody>
type ResCode = ResCodeOf<typeof openApiSpec>

export class HelloController extends BasicController<ReqBody, ResBody, ResCode> {
  openApiSpec = openApiSpec
  constructor() {
    super(schema)
  }

  protected async _execute(_req: ReqBody): Promise<{ status: ResCode; body: ResBody }> {
    return {
      status: 200,
      body: {
        message: `Hello, World!, ${process.env.ENV}`,
      },
    }
  }
}
