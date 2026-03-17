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
    <div className={styles.card} style={{ '--glow-color': 'var(--gray-9)' } as React.CSSProperties}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>Recent Check-Ins</h2>
        <p className={styles.subtitle}>Member activity log &middot; {today}</p>
      </div>

      {loading ? (
        <div style={{ padding: '16px 0' }}>
          {/* Header row */}
          <div style={{ display: 'flex', gap: 16, padding: '8px 0', marginBottom: 8 }}>
            <Skeleton width={120} height={10} />
            <Skeleton width={90} height={10} />
            <Skeleton width={80} height={10} />
            <Skeleton width={60} height={10} />
          </div>
          {/* Data rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                <Skeleton width={32} height={32} borderRadius="50%" />
                <Skeleton width={110} height={12} />
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
                  <Skeleton width={70} height={12} />
                  <Skeleton width={60} height={20} borderRadius={9999} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <p style={{ color: 'var(--color-danger)', padding: '16px 0', fontSize: 13 }}>Failed to load recent check-ins.</p>
      ) : checkIns.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)', padding: '16px 0', fontSize: 13 }}>No check-ins recorded yet.</p>
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
                        data-status={row.billingStatus === 'Current' ? 'processed' : row.billingStatus === 'Past Due' ? 'failed' : 'pending'}
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
