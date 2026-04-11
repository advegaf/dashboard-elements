import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider } from './auth'
import { LoginPage } from './auth'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { ToastContext, useToastState } from './hooks/useToast'
import { ToastContainer } from './components/Toast/Toast'
import { AppSidebar } from './components/app-sidebar/AppSidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from './components/ui/sidebar'
import { Separator } from './components/ui/separator'
import { Agentation } from 'agentation'

function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-sm font-medium">Dashboard</h1>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

function DashboardStub() {
  return (
    <div className="p-12">
      <h2 className="text-2xl font-semibold mb-2">Dashboard rebuild in progress.</h2>
      <p className="text-muted-foreground">
        The new shadcn-based Overview and Analytics tabs are landing on this branch next.
      </p>
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
