import { AuthenticatedController } from '@mimi-api/contexts/common/controllers/basic/AuthenticatedController'
import { ResCodeOf } from '@mimi-api/contexts/common/controllers/types/ReqRes'
import { PurePractice } from '@mimi-api/contexts/common/entities/PurePractice'
import { AuthenticatedRequestContext } from '@mimi-api/contexts/common/requestContext/RequestContext'
import { Practice } from '@mimi-api/contexts/common/types/PracticeScoreType'
import { ErrorResBody, commonErrorSchema } from '@mimi-api/shared/openapi/CommonErrorSchema'
import { z } from 'zod'

const schema = {
  pathParams: z.object({}),
  queryParams: z.object({}),
  reqBody: z.object({}),
  resBody: z.array(
    z.object({
      id: z.number(),
      practiceType: z.enum(['FreeChatFormat', 'MimiChat', 'HasegawaLike']),
      practice: z.record(z.string()),
      latestScore: z.number().optional(),
    }),
  ),
}

const openApiSpec = {
  method: 'get',
  path: '/practices',
  description: 'Create new practices',
  tags: ['Practice'],
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

export class GetPracticeController extends AuthenticatedController<ReqBody, ResBody, ResCode> {
  openApiSpec = openApiSpec

  constructor() {
    super(schema)
  }

  async _execute(
    body: ReqBody,
    context: AuthenticatedRequestContext,
  ): Promise<{ status: ResCode; body: ResBody | ErrorResBody }> {
    const practices = await this.db.reader.userPractice.findMany({
      where: {
        userId: context.user.id,
      },
      select: {
        id: true,
        practice: true,
        practiceType: true,
        UserPracticeAnswerHistories: {
          select: {
            score: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    })
    return {
      status: 200,
      body: practices.map(practice => ({
        id: practice.id,
        practiceType: Practice.from(practice.practiceType),
        practice: practice.practice as PurePractice,
        latestScore: practice.UserPracticeAnswerHistories[0]?.score,
      })),
    }
  }
}
