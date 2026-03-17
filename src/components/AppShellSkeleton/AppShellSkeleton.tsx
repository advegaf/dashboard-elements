import { Skeleton } from '../ui/Skeleton/Skeleton'
import appStyles from '../../App.module.css'
import styles from './AppShellSkeleton.module.css'

function SidebarSkeleton() {
  return (
    <div className={styles.sidebarSkeleton}>
      <div className={styles.logoArea}>
        <Skeleton width={80} height={20} />
      </div>

      {/* Nav group 1 */}
      <div className={styles.navGroup}>
        <div className={styles.navGroupLabel}>
          <Skeleton width={60} height={10} />
        </div>
        <div className={styles.navItemRow}>
          <Skeleton width={16} height={16} borderRadius={4} />
          <Skeleton width={100} height={12} />
        </div>
        <div className={styles.navItemRow}>
          <Skeleton width={16} height={16} borderRadius={4} />
          <Skeleton width={80} height={12} />
        </div>
      </div>

      {/* Nav group 2 */}
      <div className={styles.navGroup}>
        <div className={styles.navGroupLabel}>
          <Skeleton width={70} height={10} />
        </div>
        <div className={styles.navItemRow}>
          <Skeleton width={16} height={16} borderRadius={4} />
          <Skeleton width={90} height={12} />
        </div>
        <div className={styles.navItemRow}>
          <Skeleton width={16} height={16} borderRadius={4} />
          <Skeleton width={110} height={12} />
        </div>
        <div className={styles.navItemRow}>
          <Skeleton width={16} height={16} borderRadius={4} />
          <Skeleton width={75} height={12} />
        </div>
      </div>

      {/* Nav group 3 */}
      <div className={styles.navGroup}>
        <div className={styles.navGroupLabel}>
          <Skeleton width={50} height={10} />
        </div>
        <div className={styles.navItemRow}>
          <Skeleton width={16} height={16} borderRadius={4} />
          <Skeleton width={85} height={12} />
        </div>
        <div className={styles.navItemRow}>
          <Skeleton width={16} height={16} borderRadius={4} />
          <Skeleton width={95} height={12} />
        </div>
      </div>

      {/* User profile area */}
      <div className={styles.userArea}>
        <Skeleton width={32} height={32} borderRadius="50%" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Skeleton width={100} height={12} />
          <Skeleton width={140} height={10} />
        </div>
      </div>
    </div>
  )
}

function DashboardHeaderSkeleton() {
  return (
    <div className={styles.headerArea}>
      <Skeleton width={200} height={28} borderRadius={8} />
      <div style={{ marginTop: 6 }}>
        <Skeleton width={140} height={14} />
      </div>
    </div>
  )
}

function CardSkeleton({ height = 140 }: { height?: number }) {
  return (
    <div className={styles.cardSkeleton}>
      <Skeleton width={120} height={14} />
      <Skeleton width={80} height={10} />
      <Skeleton width="100%" height={height} borderRadius={8} />
    </div>
  )
}

export function AppShellSkeleton() {
  return (
    <>
      <div className={appStyles.sidebarContainer}>
        <SidebarSkeleton />
      </div>
      <div className={appStyles.contentArea}>
        <DashboardHeaderSkeleton />
        <div className={styles.kpiGrid}>
          <CardSkeleton height={80} />
          <CardSkeleton height={80} />
          <CardSkeleton height={80} />
          <CardSkeleton height={80} />
        </div>
        <div className={styles.vizGrid}>
          <CardSkeleton height={180} />
          <CardSkeleton height={180} />
          <CardSkeleton height={180} />
        </div>
        <div className={styles.bottomGrid}>
          <CardSkeleton height={200} />
          <CardSkeleton height={200} />
        </div>
      </div>
    </>
  )
}
