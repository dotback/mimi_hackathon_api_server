import { userRepository } from '@mimi-api/contexts/common'
import { BasicController } from '@mimi-api/contexts/common/controllers/basic/BasicController'
import { AuthenticatedRequestContext } from '@mimi-api/contexts/common/requestContext/RequestContext'
import type { Response } from 'express'
import type { Request } from 'firebase-functions/v2/https'

export abstract class AuthenticatedController<TRequest, TResponse, TResCode extends number> extends BasicController<
  TRequest,
  TResponse,
  TResCode
> {
  async execute(req: Request, res: Response): Promise<void> {
    const firebaseUser = await this.verifyAuth(req.headers)
    if (!firebaseUser) {
      res.status(401).json({ error: { message: 'Not authorized user' } })
      return
    }
    console.log('firebaseUser', firebaseUser)

    const user = await userRepository.find({ firebaseUid: firebaseUser.firebaseUid })
    if (!user) {
      res.status(404).json({ error: { message: 'User not found' } })
      return
    }
    const { status, body } = await this.executeContainer(req, { headers: req.headers, user })
    res.status(status).json(body)
  }

  protected abstract _execute(
    req: TRequest,
    context: AuthenticatedRequestContext,
  ): Promise<{ status: TResCode; body: TResponse }>
}
