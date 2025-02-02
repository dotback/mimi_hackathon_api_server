import { GenerativeModel } from '@google/generative-ai'
import { IChatAIService } from '@mimi-api/contexts/common/services/IChatAIService'

export class GeminiAIService implements IChatAIService {
  constructor(private readonly model: GenerativeModel) {}

  async generate(prompt: string): Promise<string> {
    const response = (await this.model.generateContent(prompt)).response

    return response.text().replace(/はい、承知いたしました。\n\n/g, '')
  }
}
