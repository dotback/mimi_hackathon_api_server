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
    exerciseHabit: string
    sleepHours: number
    prefecture: string
  }
  scores: {
    hasegawa?: number
  }
}

export type CreateUser = Omit<User['profile'], 'prefecture'> & {
  firebaseUid: FirebaseUid
  prefectureId: number
}

export type PatchUser = PartialDeep<User> & {
  id: UserId
}
