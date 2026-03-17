import { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useAuthContext } from './AuthContext'
import { AppShellSkeleton } from '../components/AppShellSkeleton/AppShellSkeleton'
import appStyles from '../App.module.css'
import type { ReactNode } from 'react'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuthContext()
  const location = useLocation()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (!loading) {
      setTimedOut(false)
      return
    }
    const timer = setTimeout(() => setTimedOut(true), 10_000)
    return () => clearTimeout(timer)
  }, [loading])

  if (loading && timedOut) {
    return (
      <div className={appStyles.appLayout}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100vh', gap: 16 }}>
          <p style={{ color: 'var(--color-danger)', fontSize: 14 }}>
            Authentication is taking longer than expected.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 9999,
              color: 'var(--color-text-secondary)',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!session && !loading) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'flex', height: '100vh', width: '100%' }}
          className={appStyles.appLayout}
        >
          <AppShellSkeleton />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'flex', height: '100vh', width: '100%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
