import { FirebaseUid, UserId } from '@mimi-api/contexts/common/types/id'
import { PartialDeep } from 'type-fest'

export type User = {
  id: UserId
  // firebaseUid: FirebaseUid
  profile: {
    username: string
    email: string
    gender: string
    birthDate: Date
    prefecture: string
  }
  scores: {
    hasegawa?: number
  }
}

export type CreateUser = Pick<User['profile'], 'username' | 'email' | 'gender' | 'birthDate'> & {
  firebaseUid: FirebaseUid
  prefectureId: number
}

export type PatchUser = PartialDeep<User> & {
  id: UserId
}
