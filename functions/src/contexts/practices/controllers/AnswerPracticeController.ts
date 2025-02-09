import { AuthenticatedController } from '@mimi-api/contexts/common/controllers/basic/AuthenticatedController'
import { ResCodeOf } from '@mimi-api/contexts/common/controllers/types/ReqRes'
import { AuthenticatedRequestContext } from '@mimi-api/contexts/common/requestContext/RequestContext'
import { IChatPracticeService } from '@mimi-api/contexts/common/services/IGeneratingChatPracticeService'
import { UserPracticeId } from '@mimi-api/contexts/common/types/id'
import {
  AnalyzingPracticePrompts,
  CreatingPracticePrompts,
} from '@mimi-api/contexts/practices/constants/PracticeBasePrompt'
import { ErrorResBody, commonErrorSchema } from '@mimi-api/shared/openapi/CommonErrorSchema'
import { z } from 'zod'

const schema = {
  pathParams: z.object({}),
  queryParams: z.object({}),
  reqBody: z.object({
    id: z.number().transform(UserPracticeId),
    answer: z.record(z.string()),
    createNextPractice: z
      .boolean()
      .optional()
      .transform(v => v ?? false),
  }),
  resBody: z.object({
    id: z.number(),
    score: z.number(),
    analysis: z.string(),
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

  constructor(private readonly chatPractice: IChatPracticeService) {
    super(schema)
  }

  async _execute(
    body: ReqBody,
    context: AuthenticatedRequestContext,
  ): Promise<{ status: ResCode; body: ResBody | ErrorResBody }> {
    const practiceRecord = await this.db.reader.userPractice.findUnique({ where: { id: body.id } })
    if (!practiceRecord) {
      return {
        status: 404,
        body: { error: { message: 'Practice not found' } },
      }
    }
    const answerPrompt = AnalyzingPracticePrompts.mimiChat.answer.of(
      JSON.stringify(practiceRecord.practice),
      JSON.stringify(body.answer),
    )
    const analyzed = await this.chatPractice.analyze(answerPrompt)
    const score = analyzed.score
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
      const nextPracticePrompt = CreatingPracticePrompts.mimiChat.practice.fromPracticeResult(
        JSON.stringify(practiceRecord.practice),
        JSON.stringify(body.answer),
        context.user.profile,
      )
      await this.db.writer.userPractice.create({
        data: {
          userId: context.user.id,
          practiceType: practiceRecord.practiceType,
          practice: await this.chatPractice.generate(nextPracticePrompt),
        },
      })
    }

    return {
      status: 200,
      body: {
        id: body.id,
        score: analyzed.score,
        analysis: analyzed.analysis,
      },
    }
  }
}
