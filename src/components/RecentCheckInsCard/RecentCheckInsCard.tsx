import { Skeleton } from '../ui/Skeleton/Skeleton'
import { formatDate } from '../../data/members'
import type { RecentCheckIn } from '../../lib/dashboard-aggregations'
import styles from './RecentCheckInsCard.module.css'

interface RecentCheckInsCardProps {
  checkIns: RecentCheckIn[]
  maxRows?: number
  loading?: boolean
  error?: Error
}

export function RecentCheckInsCard({ checkIns, maxRows, loading, error }: RecentCheckInsCardProps) {
  const today = formatDate(new Date())
  const rowHeight = 50
  const wrapperStyle = maxRows
    ? { maxHeight: `${maxRows * rowHeight}px` }
    : undefined

  return (
    <div className={styles.card} style={{ '--glow': '148, 163, 184' } as React.CSSProperties}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>Recent Check-Ins</h2>
        <p className={styles.subtitle}>Member activity log &middot; {today}</p>
      </div>

      {loading ? (
        <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} width="100%" height={40} borderRadius={4} />
          ))}
        </div>
      ) : error ? (
        <p style={{ color: '#FF9592', padding: '16px 0', fontSize: 13 }}>Failed to load recent check-ins.</p>
      ) : checkIns.length === 0 ? (
        <p style={{ color: 'rgba(255,255,255,0.5)', padding: '16px 0', fontSize: 13 }}>No check-ins recorded yet.</p>
      ) : (
        <div className={styles.tableContainer}>
          <div className={styles.tableWrapper} style={wrapperStyle}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Check-in Time</th>
                  <th>Membership</th>
                  <th>Billing</th>
                </tr>
              </thead>
              <tbody>
                {checkIns.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className={styles.memberCell}>
                        <img
                          className={styles.avatar}
                          src={row.avatarUrl}
                          alt={row.name}
                        />
                        <span className={styles.memberName}>{row.name}</span>
                      </div>
                    </td>
                    <td>{row.time}</td>
                    <td>
                      <span className={styles.membershipPill}>{row.membership}</span>
                    </td>
                    <td>
                      <span
                        className={styles.paymentPill}
                        data-status={row.billingStatus === 'Current' ? 'processed' : row.billingStatus === 'Past due' ? 'failed' : 'pending'}
                      >
                        {row.billingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
