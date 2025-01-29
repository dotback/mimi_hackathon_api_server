import './libs/utils/setup'
import * as functions from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import express from 'express'
import dotenv from 'dotenv'

import vision from '@google-cloud/vision'
// import axios from 'axios'

// Google Cloud Visionクライアントの初期化



// 環境変数の読み込み
dotenv.config()

// Firebase管理者の初期化
admin.initializeApp()

// グローバルエラーハンドラーを追加
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// expressアプリの作成
const app = express()

// ミドルウェアの設定
app.use(express.json())

// ルートハンドラー
app.get('/', (req, res) => {
  res.send('Firebase Functions are running')
})

// Cloud Functionsとしてエクスポート
export const hello = functions.onRequest(async (req, res) => {
  // Google Cloud Vision クライアントの初期化
  const client = new vision.ImageAnnotatorClient();
  const imageUrl = 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fsports.chosun.com%2Fnews%2Fhtml%2F2022%2F09%2F15%2F2022091601001006300059611.jpg&type=sc960_832';

  // 画像の分析
  let [result] = await client.annotateImage({
    image: { source: { imageUri: imageUrl } },
    features: [
      { type: 'LABEL_DETECTION' },
      { type: 'LANDMARK_DETECTION' },
      { type: 'FACE_DETECTION' },
      { type: 'OBJECT_LOCALIZATION' },
      { type: 'TEXT_DETECTION' },
      { type: 'DOCUMENT_TEXT_DETECTION' },
      { type: 'LOGO_DETECTION' },
      { type: 'IMAGE_PROPERTIES' }
    ],
  });

  // const labels = result.labelAnnotations.map((label) => label.description);

  
  // hakathon
  // const genAI = new GoogleGenerativeAI("AIzaSyB5g95y7UycwoyMQLRdXNF5jymwduQFgOE");
  
  // mimi project
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI("AIzaSyB5g95y7UycwoyMQLRdXNF5jymwduQFgOE");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `認知症の長谷川式で15点の人のため、情報を分析して関連質問を4つ作って欲しい。 ＃情報: ${JSON.stringify(result)}`;

  console.log(prompt);

  // const result = await model.generateContent(prompt);
  // console.log(result.response.text() );

  const generatedContent = await model.generateContent(prompt);
  console.log("------- ");
  console.log(generatedContent.response.text());

  res.send(generatedContent.response.text())
})

export const users = functions.onRequest(app)

// 他のコンテキストのエクスポート
export * from '@mimi-api/contexts/system'
export * from '@mimi-api/contexts/users'

console.log('Starting Firebase Functions')
console.log('Current environment:', process.env.NODE_ENV)
