import './libs/utils/setup'
import * as functions from 'firebase-functions/v2/https'
import * as admin from 'firebase-admin'
import express from 'express'
import dotenv from 'dotenv'

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
export const hello = functions.onRequest((req, res) => {
  res.send('Hello from Firebase!')
})

export const users = functions.onRequest(app)

// 他のコンテキストのエクスポート
export * from '@mimi-api/contexts/system'
export * from '@mimi-api/contexts/users'

console.log('Starting Firebase Functions')
console.log('Current environment:', process.env.NODE_ENV)
