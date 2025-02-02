import { GoogleGenerativeAI } from '@google/generative-ai'
import { IUserRepository } from '@mimi-api/contexts/common/repositories/IUserRepository'
import { UserRepository } from '@mimi-api/contexts/common/repositories/UserRepository'
import { GeminiAIService } from '@mimi-api/contexts/common/services/GeminiAIService'
import { IChatAIService } from '@mimi-api/contexts/common/services/IChatAIService'
import { db } from '@mimi-api/shared/database/prisma'

export const userRepository: IUserRepository = new UserRepository(db)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
export const chatAIService: IChatAIService = new GeminiAIService(geminiModel)
