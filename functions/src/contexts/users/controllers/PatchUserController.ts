import { AuthenticatedController } from '@mimi-api/contexts/common/controllers/basic/AuthenticatedController'
import { ResCodeOf } from '@mimi-api/contexts/common/controllers/types/ReqRes'
import { PatchUser } from '@mimi-api/contexts/common/entities/User'
import { IUserRepository } from '@mimi-api/contexts/common/repositories/IUserRepository'
import { AuthenticatedRequestContext } from '@mimi-api/contexts/common/requestContext/RequestContext'
import { commonErrorSchema } from '@mimi-api/shared/openapi/CommonErrorSchema'

import { z } from 'zod'

const schema = {
  pathParams: z.object({}),
  queryParams: z.object({}),
  reqBody: z.object({
    username: z.string().min(3).optional(),
    exerciseHabit: z.string().optional(),
    sleepHours: z.number().optional(),
    prefecture: z
      .string()
      .transform(v => v.toLowerCase())
      .optional(),
    scores: z
      .object({
        hasegawa: z.number().optional(),
      })
      .optional(),
  }),
  resBody: z.object({}),
}

const openApiSpec = {
  method: 'patch',
  path: '/users/me',
  description: 'Update user profile for authenticated user',
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
    204: {
      description: 'User profile updated successfully',
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

export class PatchUserController extends AuthenticatedController<ReqBody, ResBody, ResCode> {
  openApiSpec = openApiSpec
  constructor(private readonly userRepository: IUserRepository) {
    super(schema)
  }

  protected async _execute(
    req: ReqBody,
    context: AuthenticatedRequestContext,
  ): Promise<{ status: ResCode; body: ResBody }> {
    const patchUserBody: PatchUser = {
      id: context.user.id,
      profile: {
        username: req.username,
        prefecture: req.prefecture,
        exerciseHabit: req.exerciseHabit,
        sleepHours: req.sleepHours,
      },
      scores: req.scores
        ? {
            hasegawa: req.scores.hasegawa ? req.scores.hasegawa : undefined,
          }
        : undefined,
    }

    await this.userRepository.patch(patchUserBody)

    return {
      status: 204,
      body: {},
    }
  }
}
