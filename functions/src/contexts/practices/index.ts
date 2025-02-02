import { chatAIService } from '@mimi-api/contexts/common'
import { requestHandlers } from '@mimi-api/contexts/common/controllers/requestHandlers'
import { AnswerPracticeController } from '@mimi-api/contexts/practices/controllers/AnswerPracticeController'
import { CreatePracticeController } from '@mimi-api/contexts/practices/controllers/CreatePracticeController'
import { GetPracticeController } from '@mimi-api/contexts/practices/controllers/GetPracticeController'

export const practices = requestHandlers({
  get: new GetPracticeController(),
  post: new CreatePracticeController(chatAIService),
})
export const practiceAnswers = requestHandlers({ post: new AnswerPracticeController(chatAIService) })
