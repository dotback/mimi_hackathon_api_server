import { chatAIService } from '@mimi-api/contexts/common'
import { requestHandlers } from '@mimi-api/contexts/common/controllers/requestHandlers'
import { CreatePracticeController } from '@mimi-api/contexts/practices/CreatePracticeController'

export const practices = requestHandlers({ post: new CreatePracticeController(chatAIService) })
