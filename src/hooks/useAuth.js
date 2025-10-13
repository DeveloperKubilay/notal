import { useContext } from 'react'
import { AuthContext } from '../contexts/auth-context.js'

function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export { useAuth }
