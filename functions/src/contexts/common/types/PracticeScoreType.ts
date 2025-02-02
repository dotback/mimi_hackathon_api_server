export type Practices = 'MimiChat' | 'HasegawaLike'
export const Practices = {
  MimiChat: 0,
  HasegawaLike: 1,
} as const satisfies { [key in Practices]: number }
export namespace Practice {
  export function of(practice: Practices): (typeof Practices)[Practices] {
    return Practices[practice]
  }
}

type ExternalScoreTypeKeys = 'Hasegawa'
export const ExternalScoreType = {
  Hasegawa: 0,
} as const satisfies { [key in ExternalScoreTypeKeys]: number }
export type ExternalScoreType = (typeof ExternalScoreType)[keyof typeof ExternalScoreType]
