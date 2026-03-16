import { createContext, useContext, useCallback, useState, useEffect } from 'react'

export type ToastType = 'success' | 'warning' | 'error'

export interface Toast {
  id: number
  message: string
  description?: string
  type: ToastType
  paused: boolean
  remaining: number
  exiting: boolean
}

export const DURATION = 3

let nextId = 0

export function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const hasActiveToasts = toasts.some(t => !t.paused && !t.exiting)

  useEffect(() => {
    if (!hasActiveToasts) return
    const interval = setInterval(() => {
      setToasts(prev =>
        prev.map(t => {
          if (t.paused || t.exiting) return t
          const next = t.remaining - 1
          if (next <= 0) return { ...t, exiting: true, paused: true }
          return { ...t, remaining: next }
        })
      )
    }, 1000)
    return () => clearInterval(interval)
  }, [hasActiveToasts])

  const addToast = useCallback(
    (title: string, opts?: { description?: string; type?: ToastType }) => {
      const id = nextId++
      setToasts(prev => [
        ...prev,
        {
          id,
          message: title,
          description: opts?.description,
          type: opts?.type ?? 'success',
          paused: false,
          remaining: DURATION,
          exiting: false,
        },
      ])
    },
    []
  )

  const startExitToast = useCallback((id: number) => {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, exiting: true, paused: true } : t)))
  }, [])

  const finalRemoveToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const cancelExitToast = useCallback((id: number) => {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, exiting: false, paused: false, remaining: DURATION } : t)))
  }, [])

  const pauseToast = useCallback((id: number) => {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, paused: true } : t)))
  }, [])

  return { toasts, addToast, startExitToast, finalRemoveToast, cancelExitToast, pauseToast }
}

interface ToastContextValue {
  addToast: (title: string, opts?: { description?: string; type?: ToastType }) => void
}

export const ToastContext = createContext<ToastContextValue>({ addToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}
