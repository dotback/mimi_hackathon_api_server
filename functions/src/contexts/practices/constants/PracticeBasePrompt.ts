import { User } from '@mimi-api/contexts/common/entities/User'

const PromptPrefix = `
以下のルールを守ってください。
認知症に関する問題を作成してください。返答に"文頭のはい、承知いたしました。"や文末の"上記はあくまで一例であり、"などのフレーズを含めず、純粋な問題のみを書いてください。
ルールは以上です。
`
export const PracticeBasePrompts = {
  mimiChat: {
    practice: {
      of: (prompt: string, userProfile: User['profile']) => `
${PromptPrefix}
条件: ${prompt}
ユーザー情報: ${JSON.stringify(userProfile)}
`,
      fromHasegawa: (hasegawaScore: number, userProfile: User['profile']) => `
${PromptPrefix}
認知症の恐れのある人向けにどの分野の認知機能が弱いかを具体化させる問題を、各認知機能に対して2つずつ作成してください。テキスト入力とテキスト出力でのみ対応します。
長谷川式認知症スケールは${hasegawaScore}点、対象ユーザーの属性情報は ${JSON.stringify(userProfile)}
`,
      fromPracticeResult: (practice: string, answer: string, userProfile: User['profile']) => `
${PromptPrefix}
更に認知機能を詳しく調査するために以下の問題と回答のペアを分析し、認知機能の弱点を特定できるような問題を作成してください。テキスト入力とテキスト出力でのみ対応します。
`,
    },
    answer: {
      of: (practice: string, answer: string) => `
${PromptPrefix}
認知症を調査するための問題と回答のペアを作成したので採点してください。採点結果を元にスコアは0~10点の範囲で整数値にしてくださいフォーマットはスコア: {スコア}としてください。
またどのような認知機能が弱いか分析し、日々の生活で何に気をつけるべきかを記載してください。
問題: ${practice}
回答: ${answer}
`,
    },
  },
}
