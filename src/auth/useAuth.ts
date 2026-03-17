import { useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthContext } from './AuthContext'

export function useAuth() {
  const { session, user, loading } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()

  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const redirectTo = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    setActionLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setActionLoading(false)
    if (error) {
      setError(error.message)
    } else {
      navigate(redirectTo, { replace: true })
    }
  }, [navigate, redirectTo])

  const signInWithOtp = useCallback(async (email: string): Promise<boolean> => {
    setActionLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/dashboard' },
    })
    setActionLoading(false)
    if (error) {
      setError(error.message)
      return false
    }
    return true
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    setActionLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    setActionLoading(false)
    if (error) {
      setError(error.message)
    } else {
      navigate(redirectTo, { replace: true })
    }
  }, [navigate, redirectTo])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }, [navigate])

  const resetPassword = useCallback(async (email: string): Promise<boolean> => {
    setActionLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    setActionLoading(false)
    if (error) {
      setError(error.message)
      return false
    }
    return true
  }, [])

  return {
    session,
    user,
    loading,
    actionLoading,
    error,
    clearError,
    signInWithPassword,
    signInWithOtp,
    signUp,
    signOut,
    resetPassword,
  }
}
