import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react'
import {
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Alert02Icon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons'
import { AnimatePresence, motion } from 'motion/react'
import { DURATION, type Toast as ToastData, type ToastType } from '../../hooks/useToast'
import styles from './Toast.module.css'

interface Props {
  toasts: ToastData[]
  onRemove: (id: number) => void
  onFinalRemove: (id: number) => void
  onCancelExit: (id: number) => void
  onPause: (id: number) => void
}

const icons: Record<ToastType, IconSvgElement> = {
  success: CheckmarkCircle02Icon,
  warning: Alert02Icon,
  error: AlertCircleIcon,
}

export function ToastContainer({ toasts, onRemove, onFinalRemove, onCancelExit, onPause }: Props) {
  if (toasts.length === 0) return null

  return (
    <div className={styles.container} role="status" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map(t => {
          const icon = icons[t.type]
          return (
            <motion.div
              key={t.id}
              className={styles.toast}
              data-type={t.type}
              initial={{ opacity: 0 }}
              animate={{ opacity: t.exiting ? 0 : 1 }}
              transition={{
                opacity: {
                  duration: t.exiting ? 0.6 : 0.5,
                  ease: t.exiting ? 'easeOut' : 'easeIn',
                },
                layout: { duration: 0.4 },
              }}
              layout
              onAnimationComplete={(definition: { opacity?: number }) => {
                if (definition.opacity === 0) {
                  onFinalRemove(t.id)
                }
              }}
            >
              <div className={styles.toastBody}>
                <div className={styles.icon} data-type={t.type}>
                  <HugeiconsIcon icon={icon} size={20} strokeWidth={2} />
                </div>
                <div className={styles.content}>
                  <span className={styles.title}>{t.message}</span>
                  {t.description && (
                    <span className={styles.description}>{t.description}</span>
                  )}
                </div>
                <button
                  className={styles.close}
                  aria-label="Close notification"
                  onClick={() => t.exiting ? onFinalRemove(t.id) : onRemove(t.id)}
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={14} strokeWidth={2} />
                </button>
              </div>
              {!t.paused && (
                <div className={styles.countdown}>
                  <span className={styles.countdownText}>
                    This message will close in {t.remaining} second{t.remaining !== 1 ? 's' : ''}.{' '}
                    <strong
                      className={styles.clickToStop}
                      onClick={() => t.exiting ? onCancelExit(t.id) : onPause(t.id)}
                    >
                      Click to stop.
                    </strong>
                  </span>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressBar}
                      data-type={t.type}
                      style={{ width: `${(t.remaining / DURATION) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
