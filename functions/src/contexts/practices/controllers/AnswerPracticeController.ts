import { AuthenticatedController } from '@mimi-api/contexts/common/controllers/basic/AuthenticatedController'
import { ResCodeOf } from '@mimi-api/contexts/common/controllers/types/ReqRes'
import { AuthenticatedRequestContext } from '@mimi-api/contexts/common/requestContext/RequestContext'
import { IChatAIService } from '@mimi-api/contexts/common/services/IChatAIService'
import { UserPracticeId } from '@mimi-api/contexts/common/types/id'
import { PracticeBasePrompts } from '@mimi-api/contexts/practices/constants/PracticeBasePrompt'
import { ErrorResBody, commonErrorSchema } from '@mimi-api/shared/openapi/CommonErrorSchema'
import { z } from 'zod'

const schema = {
  pathParams: z.object({}),
  queryParams: z.object({}),
  reqBody: z.object({
    id: z.number().transform(UserPracticeId),
    answer: z.string(),
    createNextPractice: z
      .boolean()
      .optional()
      .transform(v => v ?? false),
  }),
  resBody: z.object({
    id: z.number(),
    analytics: z.string(),
  }),
}

const openApiSpec = {
  method: 'post',
  path: '/practiceAnswers',
  description: 'Answer the practices',
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

export class AnswerPracticeController extends AuthenticatedController<ReqBody, ResBody, ResCode> {
  openApiSpec = openApiSpec

  constructor(private readonly chatAI: IChatAIService) {
    super(schema)
  }

  async _execute(
    body: ReqBody,
    context: AuthenticatedRequestContext,
  ): Promise<{ status: ResCode; body: ResBody | ErrorResBody }> {
    if (body.answer === '') {
      return {
        status: 400,
        body: { error: { message: 'Answer is required' } },
      }
    }
    const practiceRecord = await this.db.reader.userPractice.findUnique({ where: { id: body.id } })
    if (!practiceRecord) {
      return {
        status: 404,
        body: { error: { message: 'Practice not found' } },
      }
    }
    const answerPrompt = PracticeBasePrompts.mimiChat.answer.of(practiceRecord.practice, body.answer)
    const answerChatResponse = await this.chatAI.generate(answerPrompt)
    const scoreMatched = answerChatResponse.match(/スコア: (\d+)/)
    const score = scoreMatched ? Number.parseInt(scoreMatched[1], 10) : undefined
    if (!score) {
      // :cry:
      throw new Error('Failed to parse score')
    }
    await this.db.writer.userPracticeAnswerHistory.create({
      data: {
        userId: context.user.id,
        practiceId: body.id,
        answer: body.answer,
        score,
      },
    })

    // 次の問題を作成
    if (body.createNextPractice) {
      const nextPracticePrompt = PracticeBasePrompts.mimiChat.practice.fromPracticeResult(
        practiceRecord.practice,
        body.answer,
        context.user.profile,
      )
      await this.db.writer.userPractice.create({
        data: {
          userId: context.user.id,
          practiceType: practiceRecord.practiceType,
          practice: await this.chatAI.generate(nextPracticePrompt),
        },
      })
    }

    return {
      status: 200,
      body: {
        id: body.id,
        analytics: answerChatResponse,
      },
    }
  }
}
