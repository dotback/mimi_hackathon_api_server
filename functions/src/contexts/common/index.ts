import { GoogleGenerativeAI } from '@google/generative-ai'
import { IUserRepository } from '@mimi-api/contexts/common/repositories/IUserRepository'
import { UserRepository } from '@mimi-api/contexts/common/repositories/UserRepository'
import { ChatPracticeService } from '@mimi-api/contexts/common/services/GeneratingChatPracticeService'
import { IChatPracticeService } from '@mimi-api/contexts/common/services/IGeneratingChatPracticeService'
import { db } from '@mimi-api/shared/database/prisma'

export const userRepository: IUserRepository = new UserRepository(db)

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
export const chatAIService: IChatPracticeService = new ChatPracticeService(geminiModel)
