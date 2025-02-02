import { BasicController } from '@mimi-api/contexts/common/controllers/basic/BasicController'
import { ResCodeOf } from '@mimi-api/contexts/common/controllers/types/ReqRes'
import { IUserRepository } from '@mimi-api/contexts/common/repositories/IUserRepository'
import { NoAuthRequestContext } from '@mimi-api/contexts/common/requestContext/RequestContext'
import { Prefecture } from '@mimi-api/contexts/common/types/Prefecture'
import { ErrorResBody, commonErrorSchema } from '@mimi-api/shared/openapi/CommonErrorSchema'

import { z } from 'zod'

const schema = {
  pathParams: z.object({}),
  queryParams: z.object({}),
  reqBody: z.object({
    username: z.string().min(4),
    gender: z.enum(['male', 'female', 'other']),
    birthDate: z.string().pipe(z.coerce.date()),
    prefecture: z.string().transform(v => v.toLowerCase()),
  }),
  resBody: z.object({}),
}

const openApiSpec = {
  method: 'post',
  path: '/users',
  description: 'Create new user',
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
    201: {
      description: 'User created successfully',
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

export class CreateUserController extends BasicController<ReqBody, ResBody, ResCode> {
  openApiSpec = openApiSpec
  constructor(private readonly userRepository: IUserRepository) {
    super(schema)
  }

  protected async _execute(
    body: ReqBody,
    context: NoAuthRequestContext,
  ): Promise<{ status: ResCode; body: ResBody | ErrorResBody }> {
    const firebaseUser = await this.verifyAuth(context.headers)
    if (!firebaseUser) {
      return {
        status: 401,
        body: { error: { message: 'Not authorized user' } },
      }
    }

    const user = await this.userRepository.find({ firebaseUid: firebaseUser.firebaseUid })
    if (user) {
      return {
        status: 400,
        body: { error: { message: 'User already exists' } },
      }
    }

    await this.userRepository.create({
      firebaseUid: firebaseUser.firebaseUid,
      username: body.username,
      email: firebaseUser.email,
      gender: body.gender,
      birthDate: body.birthDate,
      prefectureId: Prefecture.of(body.prefecture),
    })

    return {
      status: 201,
      body: {},
    }
  }
}
