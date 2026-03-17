import { useState } from 'react'
import { motion } from 'motion/react'
import { DashboardHeader } from '../../components/DashboardHeader/DashboardHeader'
import { ChurnRiskCard } from '../../components/ChurnRiskCard/ChurnRiskCard'
import { SalesCard } from '../../components/SalesCard/SalesCard'
import { CheckinsCard } from '../../components/CheckinsCard/CheckinsCard'
import { SignupsCard } from '../../components/SignupsCard/SignupsCard'
import { MrrCard } from '../../components/MrrCard/MrrCard'
import { RetentionCard } from '../../components/RetentionCard/RetentionCard'
import { FailedPaymentsCard } from '../../components/FailedPaymentsCard/FailedPaymentsCard'
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
    kpis, revenueSeries, revenueSlices, signupSeries, retentionSeries,
    heatmapData, checkinPeriods, recentCheckIns, failedPayments,
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
          <MrrCard
            data={revenueSeries}
            value={kpis?.revenue.value ?? '—'}
            trend={kpis?.revenue.trend}
            dateRange={dateRange}
            loading={loading}
            error={errors.payments}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <RetentionCard
            data={retentionSeries}
            rate={kpis?.retention.value ?? '—'}
            memberCount={kpis?.retention.memberCount ?? 0}
            trend={kpis?.retention.trend}
            dateRange={dateRange}
            loading={loading}
            error={errors.members}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <ChurnRiskCard
            data={kpis?.churnRisk ?? null}
            dateRange={dateRange}
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
          data={revenueSlices}
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
        <FailedPaymentsCard
          data={failedPayments}
          dateRange={dateRange}
          loading={loading}
          error={errors.payments}
        />
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
