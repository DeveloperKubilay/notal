import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRightCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.js'

const MotionForm = motion.form

function LoginPage() {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register({ email, password, displayName })
      }
    } catch (authError) {
      setError(authError.message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'))
    setError('')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-black px-6 py-12">
      <MotionForm
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-10 shadow-2xl"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-semibold text-white">Notal</h1>
          <p className="text-sm text-slate-400">Planını oluştur, notlarını yönet, kendini test et.</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="email">
              E-posta
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
              required
            />
          </div>
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="displayName">
                Adın
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-slate-400" htmlFor="password">
              Şifre
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 focus:border-indigo-400 focus:outline-none"
              required
              minLength={6}
            />
          </div>
          {error && <p className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-500/50 bg-indigo-500/20 px-4 py-3 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/30 disabled:cursor-not-allowed disabled:text-slate-500"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRightCircle className="h-4 w-4" />}
            {mode === 'login' ? 'Giriş Yap' : 'Kaydol'}
          </button>
        </div>
        <button
          type="button"
          onClick={switchMode}
          className="w-full text-center text-xs text-slate-400 underline-offset-4 hover:underline"
        >
          {mode === 'login' ? 'Hesabın yok mu? Kaydol' : 'Zaten hesabın var mı? Giriş yap'}
        </button>
      </MotionForm>
    </div>
  )
}

export default LoginPage
