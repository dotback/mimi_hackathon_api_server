import { Named } from '@mimi-api/contexts/common/types/named'

export type FirebaseUid = Named<string, 'FirebaseUid'>
export const FirebaseUid = (value: string): FirebaseUid => value as FirebaseUid
export type UserId = Named<number, 'UserId'>
export const UserId = (value: number): UserId => value as UserId
export type UserPracticeId = Named<number, 'UserPracticeId'>
export const UserPracticeId = (value: number): UserPracticeId => value as UserPracticeId
