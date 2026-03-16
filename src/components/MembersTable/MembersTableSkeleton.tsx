import { Skeleton } from '../ui/Skeleton/Skeleton'
import styles from './MembersTable.module.css'

const ROWS = 8
const widths = ['60%', '80%', '50%', '40%']

export function MembersTableSkeleton() {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.checkboxCol}>
              <Skeleton width={16} height={16} borderRadius={4} />
            </th>
            {Array.from({ length: 6 }, (_, i) => (
              <th key={i}>
                <Skeleton width={60 + i * 10} height={10} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: ROWS }, (_, row) => (
            <tr key={row}>
              <td className={styles.checkboxCol}>
                <Skeleton width={16} height={16} borderRadius={4} />
              </td>
              <td>
                <div className={styles.memberCell}>
                  <Skeleton width={28} height={28} borderRadius="50%" />
                  <Skeleton width={120} height={14} />
                </div>
              </td>
              {widths.map((w, i) => (
                <td key={i}>
                  <Skeleton width={w} height={14} />
                </td>
              ))}
              <td>
                <Skeleton width="30%" height={14} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
