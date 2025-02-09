import { AuthenticatedController } from '@mimi-api/contexts/common/controllers/basic/AuthenticatedController'
import { ResCodeOf } from '@mimi-api/contexts/common/controllers/types/ReqRes'
import { AuthenticatedRequestContext } from '@mimi-api/contexts/common/requestContext/RequestContext'
import { commonErrorSchema } from '@mimi-api/shared/openapi/CommonErrorSchema'
import { z } from 'zod'

const schema = {
  pathParams: z.object({}),
  queryParams: z.object({}),
  reqBody: z.object({}),
  resBody: z.object({
    id: z.number(),
    username: z.string().optional(),
    email: z.string().optional(),
    birthDate: z.string().optional(),
    age: z.number().optional(),
    exerciseHabit: z.string().optional(),
    sleepHours: z.number().optional(),
    gender: z.string().optional(),
    prefecture: z.string().optional(),
  }),
}

const openApiSpec = {
  method: 'get',
  path: '/users',
  description: 'Get user profile',
  tags: ['User'],
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

export class GetUserController extends AuthenticatedController<ReqBody, ResBody, ResCode> {
  openApiSpec = openApiSpec

  constructor() {
    super(schema)
  }

  async _execute(_req: ReqBody, context: AuthenticatedRequestContext): Promise<{ status: ResCode; body: ResBody }> {
    return {
      status: 200,
      body: {
        id: context.user.id,
        username: context.user.profile.username,
        email: context.user.profile.email,
        birthDate: context.user.profile.birthDate.toISOString().split('T')[0],
        age: new Date().getFullYear() - context.user.profile.birthDate.getFullYear(),
        exerciseHabit: context.user.profile.exerciseHabit,
        sleepHours: context.user.profile.sleepHours,
        gender: context.user.profile.gender,
        prefecture: context.user.profile.prefecture,
      },
    }
  }
}
