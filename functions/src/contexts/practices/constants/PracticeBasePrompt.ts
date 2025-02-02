import { User } from '@mimi-api/contexts/common/entities/User'

export const PracticeBasePrompts = {
  MimiChat: {
    fromHasegawa: (hasegawaScore: number, userProfile: User['profile']) => `
返答に"文頭のはい、承知いたしました。"や文末の"上記はあくまで一例であり、"などのフレーズを含めず、純粋な問題のみを書いてください。
認知症の恐れのある人向けにどの分野の認知機能が弱いかを具体化させる問題を作成してください。テキスト入力とテキスト出力でのみ対応します。
長谷川式認知症スケールは${hasegawaScore}点、対象ユーザーの属性情報は ${JSON.stringify(userProfile)}
`,
  },
}
