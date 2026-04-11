import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { AuthProvider } from './auth'
import { LoginPage } from './auth'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { MembersProvider } from './context/MembersContext'
import { ToastContext, useToastState } from './hooks/useToast'
import { ToastContainer } from './components/Toast/Toast'
import { Sidebar } from './components/Sidebar/Sidebar'
import { DashboardPage } from './pages/DashboardPage/DashboardPage'
import { MembersPage } from './pages/MembersPage/MembersPage'
import { SidebarPlayground } from './pages/SidebarPlayground/SidebarPlayground'

import { Agentation } from 'agentation'
import styles from './App.module.css'

function AppLayout() {
  const location = useLocation()
  const activeItem = location.pathname.includes('/members') ? 'members' : 'dashboard'

  return (
    <div className={styles.appLayout}>
      <div className={styles.sidebarContainer}>
        <Sidebar activeItem={activeItem} />
      </div>
      <main className={styles.contentArea}>
        <Outlet />
      </main>
    </div>
  )
}

function App() {
  const { toasts, addToast, startExitToast, finalRemoveToast, cancelExitToast, pauseToast } = useToastState()

  return (
    <AuthProvider>
      <MembersProvider>
        <ToastContext.Provider value={{ addToast }}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<LoginPage />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/members" element={<MembersPage />} />
            </Route>
            <Route path="/sidebar" element={<SidebarPlayground />} />
          </Routes>
          <ToastContainer toasts={toasts} onRemove={startExitToast} onFinalRemove={finalRemoveToast} onCancelExit={cancelExitToast} onPause={pauseToast} />
          {import.meta.env.DEV && <Agentation />}
        </ToastContext.Provider>
      </MembersProvider>
    </AuthProvider>
  )
}

export default App
