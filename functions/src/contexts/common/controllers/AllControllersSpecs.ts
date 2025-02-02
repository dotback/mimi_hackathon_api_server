// import { openApiSpec as getProfileSpec } from '@mimi-api/functions/user/GetProfile'
import { IUserRepository } from '@mimi-api/contexts/common/repositories/IUserRepository'
import { HelloController } from '@mimi-api/contexts/system/controllers/HelloController'
import { CreateUserController } from '@mimi-api/contexts/users/controllers/CreateUserController'
import { GetUserController } from '@mimi-api/contexts/users/controllers/GetUserController'
import { IOpenApiSpec } from '@mimi-api/shared/openapi/IOpenApiSpec'

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const mock = <T>(t: any): T => t as T
export const allSpecs: IOpenApiSpec[] = [
  // `/users`
  new CreateUserController(mock<IUserRepository>({})).openApiSpec,
  // `/users/{userId or me}`
  new GetUserController().openApiSpec,

  // system
  // `/hello`
  new HelloController().openApiSpec,
]
