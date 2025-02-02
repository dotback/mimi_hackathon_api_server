export interface IChatAIService {
  generate(prompt: string): Promise<string>
}
