import * as dotenv from 'dotenv'
dotenv.config()

import * as admin from 'firebase-admin'

let firebaseApp: admin.app.App | undefined = undefined
export function initializeFirebase() {
  if (firebaseApp) {
    return firebaseApp
  }
  const config: admin.AppOptions = {
    projectId: process.env.APP_FIREBASE_PROJECT_ID,
    credential: admin.credential.applicationDefault(),
  }
  firebaseApp = admin.initializeApp(config)
  return firebaseApp
}

export const getFirebaseAdmin = () => ({
  auth: admin.auth(initializeFirebase()),
})
