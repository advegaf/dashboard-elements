import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from './useAuth'
import { AuthLayout } from './AuthLayout'
import styles from './LoginPage.module.css'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function LedgrLogo() {
  return (
    <svg className={styles.logo} viewBox="0 0 621 482" fill="none">
      <rect width="621" height="138" fill="#fff" />
      <rect x="151" y="344" width="470" height="138" fill="#fff" />
      <rect y="172" width="470" height="138" fill="#fff" />
      <rect x="495" y="172" width="126" height="138" fill="#fff" />
      <rect y="344" width="126" height="138" fill="#fff" />
    </svg>
  )
}

const viewVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signInWithPassword, signInWithOtp, signUp, resetPassword, actionLoading, error, clearError } = useAuth()

  const view = location.pathname === '/signup' ? 'signup' : 'login'
  const [loginMethod, setLoginMethod] = useState<'password' | 'magic-link'>('password')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirm, setSignupConfirm] = useState('')

  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [showSignupPassword, setShowSignupPassword] = useState(false)
  const [showSignupConfirm, setShowSignupConfirm] = useState(false)

  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const isLoginValid = loginMethod === 'magic-link'
    ? emailRegex.test(loginEmail)
    : emailRegex.test(loginEmail) && loginPassword.length > 0
  const passwordsMatch = signupPassword === signupConfirm
  const isSignupValid =
    emailRegex.test(signupEmail) && signupPassword.length > 0 && passwordsMatch

  const switchView = (v: 'login' | 'signup') => {
    clearError()
    setMagicLinkSent(false)
    setResetSent(false)
    navigate(v === 'signup' ? '/signup' : '/login', { replace: true })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    if (loginMethod === 'magic-link') {
      const ok = await signInWithOtp(loginEmail)
      if (ok) setMagicLinkSent(true)
    } else {
      await signInWithPassword(loginEmail, loginPassword)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    await signUp(signupEmail, signupPassword)
  }

  const handleForgotPassword = async () => {
    clearError()
    if (!emailRegex.test(loginEmail)) return
    const ok = await resetPassword(loginEmail)
    if (ok) setResetSent(true)
  }

  return (
    <AuthLayout>
      <LedgrLogo />

      <AnimatePresence mode="popLayout">
        {view === 'login' ? (
          <motion.div
            key="login"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
            style={{ width: '100%' }}
          >
            <h1 className={styles.heading}>Log in to <strong>LEDGR</strong></h1>
            <p className={styles.subtext}>
              Don&apos;t have an account?{' '}
              <button
                className={styles.subtextLink}
                onClick={() => switchView('signup')}
              >
                Sign up
              </button>
            </p>

            <div className={styles.tabBar}>
              <button
                className={loginMethod === 'password' ? styles.tabActive : styles.tab}
                onClick={() => { setLoginMethod('password'); clearError(); setMagicLinkSent(false) }}
              >
                Password
              </button>
              <button
                className={loginMethod === 'magic-link' ? styles.tabActive : styles.tab}
                onClick={() => { setLoginMethod('magic-link'); clearError(); setResetSent(false) }}
              >
                Magic Link
              </button>
            </div>

            <form onSubmit={handleLogin} className={styles.formFields}>
              <label className={styles.field}>
                <span>Email</span>
                <input
                  type="email"
                  placeholder="arnold@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </label>

              {loginMethod === 'password' && (
                <div className={styles.field}>
                  <div className={styles.passwordRow}>
                    <span>Password</span>
                    <button
                      type="button"
                      className={styles.forgotLink}
                      onClick={handleForgotPassword}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className={styles.passwordWrapper}>
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {error && <p className={styles.errorMessage}>{error}</p>}
              {magicLinkSent && <p className={styles.successMessage}>Magic link sent! Check your email.</p>}
              {resetSent && <p className={styles.successMessage}>Password reset link sent! Check your email.</p>}

              <button
                type="submit"
                className={styles.ctaButton}
                disabled={!isLoginValid || actionLoading}
              >
                {actionLoading
                  ? 'Logging in...'
                  : loginMethod === 'magic-link'
                    ? 'Send Magic Link'
                    : 'Log In'}
              </button>
            </form>

            <p className={styles.footer}>
              By signing in, you agree to our{' '}
              <a href="#" className={styles.footerLink}>Terms</a> and{' '}
              <a href="#" className={styles.footerLink}>Privacy Policy</a>.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="signup"
            variants={viewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
            style={{ width: '100%' }}
          >
            <h1 className={styles.heading}>Create your <strong>LEDGR</strong> account</h1>
            <p className={styles.subtext}>
              Already have an account?{' '}
              <button
                className={styles.subtextLink}
                onClick={() => switchView('login')}
              >
                Log in
              </button>
            </p>

            <form onSubmit={handleSignup} className={styles.formFields}>
              <label className={styles.field}>
                <span>Email</span>
                <input
                  type="email"
                  placeholder="arnold@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
              </label>
              <div className={styles.field}>
                <span>Password</span>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                  >
                    {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className={styles.field}>
                <span>Confirm Password</span>
                <div className={styles.passwordWrapper}>
                  <input
                    type={showSignupConfirm ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={signupConfirm}
                    onChange={(e) => setSignupConfirm(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowSignupConfirm(!showSignupConfirm)}
                  >
                    {showSignupConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <p className={styles.errorMessage}>{error}</p>}

              <button
                type="submit"
                className={styles.ctaButton}
                disabled={!isSignupValid || actionLoading}
              >
                {actionLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className={styles.footer}>
              By signing up, you agree to our{' '}
              <a href="#" className={styles.footerLink}>Terms</a> and{' '}
              <a href="#" className={styles.footerLink}>Privacy Policy</a>.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  )
}
