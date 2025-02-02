import { IOpenApiSpec } from '@mimi-api/shared/openapi/IOpenApiSpec'
import type { Response } from 'express'
import type { Request } from 'firebase-functions/v2/https'

export interface IBasicController {
  execute(req: Request, res: Response): Promise<void>
  readonly openApiSpec: IOpenApiSpec
}
