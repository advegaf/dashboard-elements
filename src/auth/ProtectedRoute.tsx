import { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useAuthContext } from './AuthContext'
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100vh', gap: 16, fontFamily: 'system-ui, sans-serif' }}>
        <p style={{ fontSize: 14 }}>Authentication is taking longer than expected.</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: '1px solid #ddd',
            borderRadius: 9999,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
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
          style={{ display: 'flex', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}
        >
          <span style={{ fontSize: 13, color: '#999' }}>Loading…</span>
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
