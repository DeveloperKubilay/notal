import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId']
const firebaseApp = requiredKeys.every((key) => Boolean(firebaseConfig[key]))
  ? initializeApp(firebaseConfig)
  : null

const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null
const firestore = firebaseApp ? getFirestore(firebaseApp) : null

let firebaseAnalytics = null
let firebaseAI = null
let geminiModel = null

if (typeof window !== 'undefined' && firebaseApp) {
  isSupported()
    .then((supported) => {
      if (supported) firebaseAnalytics = getAnalytics(firebaseApp)
    })
    .catch(() => {})

  try {
    firebaseAI = getAI(firebaseApp, { backend: new GoogleAIBackend() })
    geminiModel = getGenerativeModel(firebaseAI, { model: 'gemini-2.5-flash' })
  } catch (error) {
    console.error('Gemini modeli başlatılamadı', error)
    firebaseAI = null
    geminiModel = null
  }
}

async function sendMessageToModel(message = 'Hello') {
  if (!geminiModel) return 'AI yapılandırması eksik. Firebase projesinde Gemini erişimini kontrol et.'

  try {
    const result = await geminiModel.generateContent(message)
    const response = await result.response
    const text = response.text()
    return text
  } catch (error) {
    console.error('Gemini modeli hata verdi', error)
    return 'Bir sorundan dolayı cevap veremiyorum. Mesaj fazla uzun olabilir.'
  }
}

export { firebaseAI, firebaseAnalytics, firebaseApp, firebaseAuth, firestore, sendMessageToModel }
