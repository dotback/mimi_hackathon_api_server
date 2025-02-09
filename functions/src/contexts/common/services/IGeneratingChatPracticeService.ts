export type GeneratingPracticeResponse = {
  practice: {
    [key: string]: string
  }
}
export type AnalyzingPracticeResponse = {
  score: number
  analysis: string
}

export interface IChatPracticeService {
  generate(prompt: string): Promise<GeneratingPracticeResponse>
  analyze(prompt: string): Promise<AnalyzingPracticeResponse>
}
