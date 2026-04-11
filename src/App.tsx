import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from './auth'
import { LoginPage } from './auth'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { ToastContext, useToastState } from './hooks/useToast'
import { ToastContainer } from './components/Toast/Toast'
import { Agentation } from 'agentation'

function AppLayout() {
  return <Outlet />
}

function DashboardStub() {
  return (
    <div style={{ padding: 48, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Dashboard rebuild in progress.</h1>
      <p>New shadcn-based dashboard landing next on this branch.</p>
    </div>
  )
}

function App() {
  const { toasts, addToast, startExitToast, finalRemoveToast, cancelExitToast, pauseToast } = useToastState()

  return (
    <AuthProvider>
      <ToastContext.Provider value={{ addToast }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardStub />} />
          </Route>
        </Routes>
        <ToastContainer
          toasts={toasts}
          onRemove={startExitToast}
          onFinalRemove={finalRemoveToast}
          onCancelExit={cancelExitToast}
          onPause={pauseToast}
        />
        {import.meta.env.DEV && <Agentation />}
      </ToastContext.Provider>
    </AuthProvider>
  )
}

export default App
