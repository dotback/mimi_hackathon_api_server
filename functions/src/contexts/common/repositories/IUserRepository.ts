import { CreateUser, PatchUser, User } from '@mimi-api/contexts/common/entities/User'
import { UserId } from '@mimi-api/contexts/common/types/id'

export type UserFindQuery = { firebaseUid: string }
export interface IUserRepository {
  get: (id: UserId) => Promise<User | null>
  find: (query: UserFindQuery) => Promise<User | null>
  create: (user: CreateUser) => Promise<UserId>
  patch: (user: PatchUser) => Promise<UserId>
}
