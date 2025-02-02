export type Practices = 'MimiChat' | 'FreeChatFormat' | 'HasegawaLike'
export const Practices = {
  FreeChatFormat: 0,
  MimiChat: 1,
  HasegawaLike: 100,
} as const satisfies { [key in Practices]: number }
export namespace Practice {
  export function of(practice: Practices): (typeof Practices)[Practices] {
    return Practices[practice]
  }
  export function from(value: number): Practices {
    return Object.keys(Practices).find(key => Practices[key as Practices] === value) as Practices
  }
}

type ExternalScoreTypeKeys = 'Hasegawa'
export const ExternalScoreType = {
  Hasegawa: 0,
} as const satisfies { [key in ExternalScoreTypeKeys]: number }
export type ExternalScoreType = (typeof ExternalScoreType)[keyof typeof ExternalScoreType]
