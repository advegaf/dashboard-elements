import { useState } from 'react'
import { motion } from 'motion/react'
import { DashboardHeader } from '../../components/DashboardHeader/DashboardHeader'
import { KpiCard } from '../../components/KpiCard/KpiCard'
import { SalesCard } from '../../components/SalesCard/SalesCard'
import { CheckinsCard } from '../../components/CheckinsCard/CheckinsCard'
import { SignupsCard } from '../../components/SignupsCard/SignupsCard'
import { PlaceholderCard } from '../../components/PlaceholderCard/PlaceholderCard'
import { CopilotCard } from '../../components/CopilotCard/CopilotCard'
import { RecentCheckInsCard } from '../../components/RecentCheckInsCard/RecentCheckInsCard'
import { useDashboardData } from '../../hooks/useDashboardData'
import type { StatsTimeRange } from '../../components/TimeRangePicker/TimeRangePicker'
import styles from './DashboardPage.module.css'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
}

const kpiRowVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
}

export function DashboardPage() {
  const [timeRange, setTimeRange] = useState<StatsTimeRange>('30d')
  const {
    kpis, revenueSeries, revenueSummary, signupSeries,
    heatmapData, checkinPeriods, recentCheckIns,
    dateRange, loading, errors,
  } = useDashboardData(timeRange)

  return (
    <motion.div
      className={styles.dashboard}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <DashboardHeader
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
      </motion.div>

      <motion.div className={styles.kpiRow} variants={kpiRowVariants}>
        <motion.div variants={itemVariants}>
          <KpiCard
            title="Retention Rate"
            value={kpis?.retention.value ?? '—'}
            trend={kpis?.retention.trend}
            sparklineData={kpis?.retention.sparkline}
            sparklineColor="#A855F7"
            glowColor="168, 85, 247"
            loading={loading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            title="MRR"
            value={kpis?.revenue.value ?? '—'}
            trend={kpis?.revenue.trend}
            sparklineData={kpis?.revenue.sparkline}
            sparklineColor="#10B981"
            glowColor="16, 185, 129"
            loading={loading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <KpiCard
            title="Avg Visits/Week"
            value={kpis?.visits.value ?? '—'}
            trend={kpis?.visits.trend}
            sparklineData={kpis?.visits.sparkline}
            sparklineColor="#3B82F6"
            glowColor="59, 130, 246"
            loading={loading}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <SignupsCard
            data={signupSeries}
            total={kpis?.signups.value ?? '—'}
            trend={kpis?.signups.trend}
            dateRange={dateRange}
            loading={loading}
            error={errors.members}
          />
        </motion.div>
      </motion.div>

      <motion.div className={styles.vizRow} variants={itemVariants}>
        <SalesCard
          data={revenueSeries}
          summary={revenueSummary}
          dateRange={dateRange}
          loading={loading}
          error={errors.payments}
        />
        <CheckinsCard
          heatmapData={heatmapData}
          summaryRows={checkinPeriods}
          dateRange={dateRange}
          loading={loading}
          error={errors.checkIns}
        />
        <PlaceholderCard />
      </motion.div>

      <motion.div className={styles.bottomRow} variants={itemVariants}>
        <RecentCheckInsCard
          checkIns={recentCheckIns}
          maxRows={8}
          loading={loading}
          error={errors.recent}
        />
        <CopilotCard />
      </motion.div>
    </motion.div>
  )
}
