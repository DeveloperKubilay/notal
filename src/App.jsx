import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { WorkspaceProvider } from './contexts/WorkspaceProvider.jsx'
import { useAuth } from './hooks/useAuth.js'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={(
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            )}
          />
          <Route
            path="/*"
            element={(
              <ProtectedRoute>
                <WorkspaceProvider>
                  <DashboardPage />
                </WorkspaceProvider>
              </ProtectedRoute>
            )}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-300" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return children
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-300" />
      </div>
    )
  }

  if (user) return <Navigate to="/" replace />

  return children
}

export default App
