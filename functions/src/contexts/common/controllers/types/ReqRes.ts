import { IOpenApiSpec } from '@mimi-api/shared/openapi/IOpenApiSpec'
import { ZodTypeAny } from 'zod'

export type ReqResSchema = {
  pathParams: ZodTypeAny
  queryParams: ZodTypeAny
  reqBody: ZodTypeAny
  resBody: ZodTypeAny
}

export type ResCodeOf<OpenApiSpec extends IOpenApiSpec> = keyof OpenApiSpec['responses']
