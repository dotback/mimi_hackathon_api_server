import { AuthenticatedController } from '@mimi-api/contexts/common/controllers/basic/AuthenticatedController'
import { ResCodeOf } from '@mimi-api/contexts/common/controllers/types/ReqRes'
import { AuthenticatedRequestContext } from '@mimi-api/contexts/common/requestContext/RequestContext'
import { IChatPracticeService } from '@mimi-api/contexts/common/services/IGeneratingChatPracticeService'
import { Practice } from '@mimi-api/contexts/common/types/PracticeScoreType'
import { CreatingPracticePrompts } from '@mimi-api/contexts/practices/constants/PracticeBasePrompt'
import { ErrorResBody, commonErrorSchema } from '@mimi-api/shared/openapi/CommonErrorSchema'
import { z } from 'zod'

const schema = {
  pathParams: z.object({}),
  queryParams: z.object({}),
  reqBody: z.object({
    mode: z.enum(['MimiChat', 'HasegawaLike', 'FreeChatFormat']),
    prompt: z.string().optional(),
  }),
  resBody: z.object({
    id: z.number(),
  }),
}

const openApiSpec = {
  method: 'post',
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

export class CreatePracticeController extends AuthenticatedController<ReqBody, ResBody, ResCode> {
  openApiSpec = openApiSpec

  constructor(private readonly chatAI: IChatPracticeService) {
    super(schema)
  }

  async _execute(
    body: ReqBody,
    context: AuthenticatedRequestContext,
  ): Promise<{ status: ResCode; body: ResBody | ErrorResBody }> {
    let prompt: string
    if (body.mode === 'MimiChat') {
      prompt = CreatingPracticePrompts.mimiChat.practice.fromHasegawa(
        context.user.scores.hasegawa || 15,
        context.user.profile,
      )
    } else if (body.mode === 'HasegawaLike') {
      // TBC
      throw new Error('Not implemented')
    } else if (body.mode === 'FreeChatFormat') {
      prompt = CreatingPracticePrompts.mimiChat.practice.of(body.prompt || '', context.user.profile)
    } else {
      const _exhaustiveCheck: never = body.mode
      throw new Error(`Unexpected mode: ${_exhaustiveCheck}`)
    }

    const practice = await this.chatAI.generate(prompt)
    const record = await this.db.writer.userPractice.create({
      data: {
        userId: context.user.id,
        practiceType: Practice.of(body.mode),
        practice: practice.practice,
      },
    })

    const test1 = await this.db.reader.userPractice.findFirst({
      where: { userId: context.user.id },
      orderBy: { id: 'desc' },
    })
    if (test1?.practice && Object.keys(test1.practice).every(key => typeof Number.parseInt(key) === 'number')) {
      console.log(test1.practice)
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      console.log((test1.practice as any)['1'])
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      console.log((test1.practice as any)['2'])
    } else {
      console.log('Practice is not available or not an array')
    }
    return {
      status: 200,
      body: {
        id: record.id,
      },
    }
  }
}
