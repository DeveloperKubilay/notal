import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { GoogleGenerativeAI } from '@google/generative-ai'

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
const firebaseStorage = firebaseApp ? getStorage(firebaseApp) : null

let firebaseAnalytics = null
let genAI = null
let geminiModel = null

if (typeof window !== 'undefined' && firebaseApp) {
  isSupported()
    .then((supported) => {
      if (supported) firebaseAnalytics = getAnalytics(firebaseApp)
    })
    .catch(() => {})

  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (geminiApiKey) {
    try {
      genAI = new GoogleGenerativeAI(geminiApiKey)
      geminiModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
    } catch (error) {
      console.error('Gemini modeli başlatılamadı', error)
    }
  }
}

async function sendMessageToModel(message = 'Hello') {
  if (!geminiModel) {
    return 'AI yapılandırması eksik. .env.local dosyasına VITE_GEMINI_API_KEY ekle. https://aistudio.google.com/app/apikey adresinden API key alabilirsin.'
  }

  try {
    const result = await geminiModel.generateContent(message)
    const response = result.response
    const text = response.text()
    console.log('Gemini modelinden cevap alındı:', text)
    return text
  } catch (error) {
    console.error('Gemini modeli hata verdi', error)
    return 'Bir sorundan dolayı cevap veremiyorum. API key geçerli mi kontrol et.'
  }
}

export { firebaseAnalytics, firebaseApp, firebaseAuth, firebaseStorage, firestore, sendMessageToModel }
