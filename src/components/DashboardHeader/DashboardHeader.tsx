import { useState, useRef, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { BellIcon } from 'lucide-animated'
import type { AnimatedIconHandle } from '../Sidebar/sidebarConfig'
import { useGreeting } from '../../hooks/useGreeting'
import { useAuthContext } from '../../auth/AuthContext'
import { TimeRangePicker, type StatsTimeRange } from '../TimeRangePicker/TimeRangePicker'
import styles from './DashboardHeader.module.css'

interface DashboardHeaderProps {
  timeRange: StatsTimeRange
  onTimeRangeChange: (value: StatsTimeRange) => void
}

const notifications = [
  { id: 1, text: '3 new members signed up today' },
  { id: 2, text: 'Monthly revenue report is ready' },
  { id: 3, text: 'Check-in streak: 12 days running' },
]

export function DashboardHeader({ timeRange, onTimeRangeChange }: DashboardHeaderProps) {
  const { user } = useAuthContext()
  const userName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'there'
  const greeting = useGreeting(userName)
  const today = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const bellRef = useRef<AnimatedIconHandle>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notifOpen])

  return (
    <>
      <div className={styles.breadcrumbBar}>
        <div className={styles.breadcrumbLeft}>
          <span>Dashboard</span>
          <span className={styles.breadcrumbSeparator}>
            <ChevronRight size={14} />
          </span>
          <span>Overview</span>
        </div>
        <div className={styles.breadcrumbRight}>
          <div className={styles.notifWrapper} ref={notifRef}>
            <button
              className={styles.notifButton}
              aria-label="Notifications"
              onClick={() => setNotifOpen((v) => !v)}
              onMouseEnter={() => bellRef.current?.startAnimation()}
              onMouseLeave={() => bellRef.current?.stopAnimation()}
            >
              <BellIcon ref={bellRef} size={18} />
              <span className={styles.notifDot} />
            </button>
            {notifOpen && (
              <div className={styles.notifDropdown}>
                {notifications.map((n) => (
                  <div key={n.id} className={styles.notifItem}>
                    {n.text}
                  </div>
                ))}
              </div>
            )}
          </div>
          <TimeRangePicker value={timeRange} onChange={onTimeRangeChange} />
        </div>
      </div>
      <div className={styles.header}>
        <h1 className={styles.greeting}>{greeting}</h1>
        <p className={styles.date}>{today}</p>
      </div>
    </>
  )
}
