import { useEffect, useMemo, useState } from 'react'
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { firebaseAuth } from '../lib/firebase.js'
import { AuthContext } from './auth-context.js'

function ensureAuthInstance() {
  if (!firebaseAuth) throw new Error('Firebase configuration missing. Check environment variables.')
  return firebaseAuth
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const auth = ensureAuthInstance()
    setPersistence(auth, browserLocalPersistence).catch(() => {})
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
      setInitializing(false)
    })
    return () => unsubscribe()
  }, [])

  const value = useMemo(() => {
    const auth = ensureAuthInstance()
    const googleProvider = new GoogleAuthProvider()

    const loginWithGoogle = async () => {
      setLoading(true)
      try {
        const credentials = await signInWithPopup(auth, googleProvider)
        return credentials
      } finally {
        setLoading(false)
      }
    }

    const logout = async () => {
      setLoading(true)
      try {
        await signOut(auth)
      } finally {
        setLoading(false)
      }
    }

    return {
      user,
      loading,
      initializing,
      loginWithGoogle,
      logout,
    }
  }, [user, loading, initializing])

  if (initializing) return null

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

