import { CreateUser, PatchUser, User } from '@mimi-api/contexts/common/entities/User'
import { IUserRepository, UserFindQuery } from '@mimi-api/contexts/common/repositories/IUserRepository'
import { ExternalScoreType } from '@mimi-api/contexts/common/types/PracticeScoreType'
import { Prefecture, PrefectureValues } from '@mimi-api/contexts/common/types/Prefecture'
import { UserId } from '@mimi-api/contexts/common/types/id'
import { DBClient, PWTransaction } from '@mimi-api/shared/database/prisma'
import { Prisma } from '@prisma/client'

type RowUserModel = {
  Users: Prisma.UserGetPayload<{
    include: {
      ExternalScores: true
      ExternalScoreHistories: true
      UserProfile: true
      UserPractices: {
        include: {
          UserPracticeAnswerHistories: true
        }
      }
    }
  }>
}

export class UserRepository implements IUserRepository {
  constructor(private db: DBClient) {}

  async get(id: UserId): Promise<User | null> {
    const user = await this.db.reader.user.findUnique({
      where: { id },
      include: {
        ExternalScores: true,
        ExternalScoreHistories: true,
        UserProfile: true,
        UserPractices: {
          include: {
            UserPracticeAnswerHistories: true,
          },
        },
      },
    })
    if (!user) {
      return null
    }
    return this.toEntity(user)
  }

  async find(query: UserFindQuery): Promise<User | null> {
    let whereClause: Prisma.UserWhereInput
    if ('firebaseUid' in query) {
      whereClause = { firebaseUid: query.firebaseUid }
    } else {
      const _exhaustiveCheck: never = query
      throw new Error(`Unexpected query: ${_exhaustiveCheck}`)
    }

    const user = await this.db.reader.user.findFirst({
      where: whereClause,
      include: {
        ExternalScores: true,
        ExternalScoreHistories: true,
        UserProfile: true,
        UserPractices: {
          include: {
            UserPracticeAnswerHistories: true,
          },
        },
      },
    })
    if (!user) {
      return null
    }
    return this.toEntity(user)
  }

  async create(user: CreateUser): Promise<UserId> {
    const record = await this.db.writer.user.create({
      data: {
        firebaseUid: user.firebaseUid,
        UserProfile: {
          create: {
            username: user.username,
            email: user.email,
            gender: user.gender,
            birthDate: user.birthDate,
            exerciseHabit: user.exerciseHabit,
            sleepHours: user.sleepHours,
            prefectureId: user.prefectureId,
          },
        },
      },
    })
    return UserId(record.id)
  }

  async patch(user: PatchUser): Promise<UserId> {
    return await this.db.writer.$transaction(async tx => {
      await this.updateUser(tx, user.id, user.profile)
      if (user.scores) {
        await this.updateScores(tx, user.id, user.scores)
      }
      return user.id
    })
  }

  private async updateUser(tx: PWTransaction, userId: UserId, user?: PatchUser['profile']) {
    if (!user) {
      return
    }
    await tx.user.update({
      where: {
        id: userId,
      },
      data: {
        UserProfile: {
          update: {
            username: user.username,
            email: user.email,
            gender: user.gender,
            exerciseHabit: user.exerciseHabit,
            sleepHours: user.sleepHours,
            birthDate: user.birthDate,
            prefectureId: user.prefecture !== undefined ? Prefecture.of(user.prefecture) : undefined,
          },
        },
      },
    })
  }

  private async updateScores(
    tx: PWTransaction,
    userId: UserId,
    scores: {
      hasegawa?: number
    },
  ) {
    const updateScores = [{ userId, scoreType: ExternalScoreType.Hasegawa, score: scores.hasegawa }].filter(
      score => score.score !== undefined,
    ) as {
      userId: number
      scoreType: (typeof ExternalScoreType)[keyof typeof ExternalScoreType]
      score: number
    }[]
    await Promise.all(
      updateScores.map(score =>
        tx.externalScore.upsert({
          where: {
            userId_scoreType: {
              userId: score.userId,
              scoreType: score.scoreType,
            },
          },
          update: {
            score: score.score,
          },
          create: {
            userId: score.userId,
            scoreType: score.scoreType,
            score: score.score,
          },
        }),
      ),
    )
  }

  private toEntity(user: RowUserModel['Users']): User {
    const scores = {
      hasegawa: user.ExternalScores.find(s => s.scoreType === ExternalScoreType.Hasegawa)?.score ?? undefined,
    }
    return {
      id: UserId(user.id),
      profile: {
        username: user.UserProfile?.username ?? '',
        email: user.UserProfile?.email ?? '',
        gender: user.UserProfile?.gender ?? '',
        exerciseHabit: user.UserProfile?.exerciseHabit ?? '',
        sleepHours: (user.UserProfile?.sleepHours ?? 0) as number,
        birthDate: user.UserProfile?.birthDate ?? new Date(),
        prefecture:
          Prefecture.from((user.UserProfile?.prefectureId || 0) as PrefectureValues) ||
          Object.keys(Prefecture.getDefault())[0],
      },
      scores,
    }
  }
}
