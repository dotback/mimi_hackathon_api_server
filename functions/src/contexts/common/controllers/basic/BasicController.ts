import { IncomingHttpHeaders } from 'node:http'
import { getFirebaseAdmin, initializeFirebase } from '@mimi-api/configs/Firebase'
import { IBasicController } from '@mimi-api/contexts/common/controllers/IBasicController'
import { ReqResSchema } from '@mimi-api/contexts/common/controllers/types/ReqRes'
import { NoAuthRequestContext, RequestContext } from '@mimi-api/contexts/common/requestContext/RequestContext'
import { FirebaseUid } from '@mimi-api/contexts/common/types/id'
import { db } from '@mimi-api/libs/database/prisma'
import { ErrorCodes, ErrorResBody } from '@mimi-api/libs/openapi/CommonErrorSchema'
import { IOpenApiSpec } from '@mimi-api/libs/openapi/IOpenApiSpec'
import { handleError } from '@mimi-api/libs/utils/Error'
import { PrismaClient } from '@prisma/client'
import type { Response } from 'express'
import type { Request } from 'firebase-functions/v2/https'

export abstract class BasicController<TRequest, TResponse, TResCode extends number> implements IBasicController {
  abstract openApiSpec: IOpenApiSpec
  protected firebase: ReturnType<typeof getFirebaseAdmin>
  protected db: PrismaClient

  constructor(private readonly schema: ReqResSchema) {
    try {
      console.log('Starting Firebase initialization')
      
      console.log('Current environment:', process.env.NODE_ENV)
      
      initializeFirebase()
      
      console.log('Firebase initialized successfully')
      
      this.firebase = getFirebaseAdmin()
      console.log('Firebase admin retrieved')
      
      this.db = db
      console.log('Database connection established')
    } catch (error) {
      console.error('Comprehensive Firebase initialization error:', {
      })
      throw error
    }
  }

  protected async executeContainer(
    req: Request,
    context: RequestContext,
  ): Promise<{ status: TResCode | ErrorCodes; body: TResponse | ErrorResBody }> {
    try {
      const validatedRequest = this.schema.reqBody.safeParse(req.body)
      if (!validatedRequest.success) {
        const error: ErrorResBody = {
          error: {
            message: 'Invalid request body',
            cause: validatedRequest.error.errors,
          },
        }

        return { status: 400, body: error }
      }

      const result = await this._execute(validatedRequest.data, context)

      // Maybe we don't need response validations
      // const validatedResponse = this.schema.resBody.safeParse(result.body)
      // if (!validatedResponse.success) {
      //   console.error('Response validation error:', validatedResponse.error)
      //   const error: ErrorResBody = {
      //     error: {
      //       message: 'Internal server error',
      //       cause: validatedResponse.error.errors,
      //     },
      //   }

      // return { status: 500, body: error }
      // }

      // return { status: result.status, body: validatedResponse.data }
      return { status: result.status, body: result.body }
    } catch (error) {
      const errorResponse = handleError(error)
      return { status: errorResponse.error.code as ErrorCodes, body: errorResponse }
    }
  }

  protected async verifyAuth(
    headers: IncomingHttpHeaders,
  ): Promise<{ firebaseUid: FirebaseUid; email: string } | null> {
    const authHeader = headers.authorization
    console.log('Auth header', JSON.stringify(authHeader))
    if (!authHeader?.startsWith('Bearer ')) {
      return null
    }
    const token = authHeader.split('Bearer ')[1]
    try {
      const decodedToken = await this.firebase.auth.verifyIdToken(token)
      return {
        firebaseUid: decodedToken.user_id,
        email: decodedToken.email || '', // TODO: firebase doesn't always require email
      }
    } catch (error) {
      console.error('Auth error:', error)
      return null
    }
  }

  async execute(req: Request, res: Response): Promise<void> {
    const { status, body } = await this.executeContainer(req, { headers: req.headers })
    res.status(status).json(body)
  }

  protected abstract _execute(
    req: TRequest,
    contexts: NoAuthRequestContext,
  ): Promise<{ status: TResCode; body: TResponse | ErrorResBody }>
}
