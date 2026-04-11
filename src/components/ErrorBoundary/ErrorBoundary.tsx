import { Component, type ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { AlertCircleIcon } from '@hugeicons/core-free-icons'
import styles from './ErrorBoundary.module.css'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <HugeiconsIcon icon={AlertCircleIcon} size={48} strokeWidth={2} className={styles.icon} />
          <h1 className={styles.heading}>Something went wrong</h1>
          {this.state.error && (
            <code className={styles.code}>{this.state.error.message}</code>
          )}
          <div className={styles.actions}>
            <button
              className={styles.reloadBtn}
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
            <a href="/dashboard" className={styles.dashboardLink}>
              Go to Dashboard
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
