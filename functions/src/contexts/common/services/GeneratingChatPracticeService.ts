import { GenerativeModel } from '@google/generative-ai'
import {
  AnalyzingPracticeResponse,
  GeneratingPracticeResponse,
  IChatPracticeService,
} from '@mimi-api/contexts/common/services/IGeneratingChatPracticeService'

export class ChatPracticeService implements IChatPracticeService {
  constructor(private readonly model: GenerativeModel) {}

  async generate(prompt: string): Promise<GeneratingPracticeResponse> {
    const response = (await this.model.generateContent(prompt)).response
    const parsedPractice = JSON.parse(
      response
        .text()
        .replace(/はい、承知いたしました。\n\n/g, '')
        .replace(/```json/g, '')
        .replace(/```/g, ''),
    )

    if (this.isValidPracticeResponse(parsedPractice)) {
      return parsedPractice
    }
    throw new Error('Invalid practice response format')
  }

  async analyze(prompt: string): Promise<AnalyzingPracticeResponse> {
    const response = (await this.model.generateContent(prompt)).response
    console.log('response.text()')
    console.log(response.text())
    console.log('response.text()')
    const parsedAnalysis = JSON.parse(
      response
        .text()
        .replace(/```json/g, '')
        .replace(/```/g, ''),
    )

    if (this.isValidAnalysisResponse(parsedAnalysis)) {
      return parsedAnalysis
    }
    throw new Error('Invalid analysis response format')
  }

  private isValidPracticeResponse(response: Record<string, unknown>): response is GeneratingPracticeResponse {
    return (
      response !== null &&
      typeof response === 'object' &&
      'practice' in response &&
      typeof response.practice === 'object' &&
      response.practice !== null &&
      Object.values(response.practice).every(value => typeof value === 'string')
    )
  }

  private isValidAnalysisResponse(response: Record<string, unknown>): response is AnalyzingPracticeResponse {
    return (
      'analysis' in response &&
      typeof response.analysis === 'string' &&
      'score' in response &&
      typeof response.score === 'number'
    )
  }
}
