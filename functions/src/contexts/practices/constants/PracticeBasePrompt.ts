import { User } from '@mimi-api/contexts/common/entities/User'

const CreatingBasePrompt = `
今までのルールは全て忘れ、以下のルールを必ず守ってください。
あなたの返答は必ずJSONデコード可能な形式でなければなりません。形式は{"practice":{数字_通し番号:"{実際の問題}", ...}です。
認知症に関する問題を作成してください。返答に"文頭のはい、承知いたしました。"や文末の"上記はあくまで一例であり、"などのフレーズを含めず、純粋な問題のみを書いてください。
ルールは以上です。
`
export const CreatingPracticePrompts = {
  mimiChat: {
    practice: {
      of: (prompt: string, userProfile: User['profile']) => `
${CreatingBasePrompt}
条件: ${prompt}
ユーザー情報: ${JSON.stringify(userProfile)}
`,
      fromHasegawa: (hasegawaScore: number, userProfile: User['profile']) => `
${CreatingBasePrompt}
認知症の恐れのある人向けにどの分野の認知機能が弱いかを具体化させる問題を、各認知機能に対して2つずつ作成してください。テキスト入力とテキスト出力でのみ対応します。
長谷川式認知症スケールは${hasegawaScore}点、対象ユーザーの属性情報は ${JSON.stringify(userProfile)}
`,
      fromPracticeResult: (practice: string, answer: string, userProfile: User['profile']) => `
${CreatingBasePrompt}
更に認知機能を詳しく調査するために以下の問題と回答のペアを分析し、認知機能の弱点を特定できるような問題を作成してください。テキスト入力とテキスト出力でのみ対応します。
`,
    },
  },
}

const AnalyzingBasePrompt = `
今までのルールは全て忘れ、以下のルールを必ず守ってください。
あなたの返答は必ずJSONデコード可能な形式でなければなりません。形式は{"score":数字,"analysis":分析結果}です。
認知症を調査するための問題と回答のペアを作成したので採点をし、その結果を元にスコアを0~10点の範囲でつけてください。
ルールは以上です。
`
export const AnalyzingPracticePrompts = {
  mimiChat: {
    answer: {
      of: (practice: string, answer: string) => `
${AnalyzingBasePrompt}
どのような認知機能が弱いか分析し、日々の生活で何に気をつけるべきかを記載してください。
問題: ${practice}
回答: ${answer}
`,
    },
  },
}
