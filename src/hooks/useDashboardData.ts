import { useState, useEffect, useRef, useCallback } from 'react'
import type { StatsTimeRange } from '../context/MembersContext'
import { fetchDashboardData } from '../lib/dashboard-api'
import {
  aggregateKpis,
  aggregateRevenueSeries,
  aggregateRevenueSummary,
  aggregateSignupSeries,
  aggregateHeatmap,
  aggregateCheckinPeriods,
  mapRecentCheckIns,
  computeDateRange,
  type KpiData,
  type RevenueBucket,
  type SignupBucket,
  type SummaryRow,
  type RecentCheckIn,
  type CheckinPeriodRow,
} from '../lib/dashboard-aggregations'

// ─── Flip to false (or delete this block) to use live Supabase data ────
const USE_MOCK_DATA = true

function getMockData(timeRange: StatsTimeRange): DashboardDataResult {
  const { label: dateRange } = computeDateRange(timeRange)

  const kpis: KpiData = {
    retention: {
      value: '94.2%',
      trend: { value: 2.1, direction: 'up' },
      sparkline: [91.5, 92.0, 92.8, 93.1, 93.5, 93.8, 94.0, 94.2],
    },
    revenue: {
      value: '$24,500',
      trend: { value: 5.8, direction: 'up' },
      sparkline: [205, 212, 218, 224, 231, 236, 241, 245],
    },
    visits: {
      value: '3.2',
      trend: { value: 14.3, direction: 'up' },
      sparkline: [2.6, 2.7, 2.8, 2.9, 3.0, 3.0, 3.1, 3.2],
    },
    signups: {
      value: '47',
      trend: { value: 12.5, direction: 'up' },
      sparkline: [3, 5, 4, 6, 7, 5, 8, 9],
    },
  }

  const revenueSeries: RevenueBucket[] = [
    { name: 'Feb 5', gray: 3.2, revenue: 1.8 },
    { name: 'Feb 9', gray: 4.5, revenue: 2.4 },
    { name: 'Feb 13', gray: 3.8, revenue: 2.1 },
    { name: 'Feb 17', gray: 5.1, revenue: 3.0 },
    { name: 'Feb 21', gray: 4.2, revenue: 2.5 },
    { name: 'Feb 25', gray: 4.8, revenue: 2.8 },
    { name: 'Mar 1', gray: 5.5, revenue: 3.2 },
    { name: 'Mar 5', gray: 5.8, revenue: 3.5 },
  ]

  const revenueSummary: SummaryRow[] = [
    { label: 'Memberships', value: '$14,567', change: '+5.4%', positive: true },
    { label: 'Personal Training', value: '$11,457', change: '+3.6%', positive: true },
    { label: 'Retail & Merch', value: '$3,789', change: '-4.0%', positive: false },
  ]

  const signupSeries: SignupBucket[] = [
    { name: 'Feb 5', value: 5 },
    { name: 'Feb 8', value: 7 },
    { name: 'Feb 11', value: 4 },
    { name: 'Feb 14', value: 9 },
    { name: 'Feb 17', value: 6 },
    { name: 'Feb 20', value: 8 },
    { name: 'Feb 23', value: 10 },
    { name: 'Feb 26', value: 7 },
    { name: 'Mar 1', value: 12 },
    { name: 'Mar 5', value: 15 },
  ]

  // Realistic gym heatmap: 7 days × 24 hours (Mon–Sun)
  const heatmapData: number[][] = [
    [2, 1, 1, 1, 2, 8, 35, 42, 28, 15, 12, 18, 22, 16, 10, 8, 18, 38, 45, 30, 15, 8, 3, 2],
    [1, 1, 1, 1, 2, 7, 32, 40, 25, 14, 10, 16, 20, 14, 9, 7, 16, 35, 42, 28, 14, 7, 3, 1],
    [2, 1, 1, 2, 2, 9, 38, 44, 30, 16, 13, 19, 24, 18, 12, 9, 20, 40, 48, 32, 16, 9, 4, 2],
    [1, 1, 1, 1, 1, 6, 30, 38, 24, 13, 10, 15, 19, 13, 8, 6, 15, 33, 40, 26, 12, 6, 3, 1],
    [2, 1, 1, 1, 2, 8, 34, 40, 26, 14, 11, 17, 21, 15, 10, 8, 22, 36, 38, 24, 10, 5, 3, 2],
    [3, 2, 2, 1, 1, 2, 5, 12, 22, 28, 25, 20, 16, 12, 8, 6, 4, 3, 3, 2, 1, 1, 2, 3],
    [4, 3, 2, 1, 1, 1, 3, 8, 18, 24, 22, 18, 14, 10, 6, 4, 3, 2, 2, 1, 1, 1, 1, 2],
  ]

  const checkinPeriods: CheckinPeriodRow[] = [
    { label: 'Morning (6\u201311 AM)', value: '1,245', change: '+8.2%', positive: true },
    { label: 'Afternoon (12\u20134 PM)', value: '876', change: '-2.1%', positive: false },
    { label: 'Evening (5\u20139 PM)', value: '2,035', change: '+18.7%', positive: true },
  ]

  const avatar = (name: string) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=64&bold=true`

  const recentCheckIns: RecentCheckIn[] = [
    { id: '1', name: 'Sarah Mitchell', avatarUrl: avatar('Sarah Mitchell'), time: '5:15 AM', membership: 'Annual', billingStatus: 'Current' },
    { id: '2', name: 'James Cooper', avatarUrl: avatar('James Cooper'), time: '5:42 AM', membership: 'Monthly', billingStatus: 'Current' },
    { id: '3', name: 'Diana Reyes', avatarUrl: avatar('Diana Reyes'), time: '6:08 AM', membership: 'Annual', billingStatus: 'Current' },
    { id: '4', name: 'Marcus Johnson', avatarUrl: avatar('Marcus Johnson'), time: '6:33 AM', membership: 'Monthly', billingStatus: 'Past Due' },
    { id: '5', name: 'Emily Zhang', avatarUrl: avatar('Emily Zhang'), time: '7:01 AM', membership: 'Annual', billingStatus: 'Current' },
    { id: '6', name: 'Robert Akins', avatarUrl: avatar('Robert Akins'), time: '7:28 AM', membership: 'Day Pass', billingStatus: 'Pending' },
    { id: '7', name: 'Priya Sharma', avatarUrl: avatar('Priya Sharma'), time: '8:05 AM', membership: 'Monthly', billingStatus: 'Current' },
    { id: '8', name: 'Tyler Brooks', avatarUrl: avatar('Tyler Brooks'), time: '8:34 AM', membership: 'Annual', billingStatus: 'Current' },
    { id: '9', name: 'Natalie Owens', avatarUrl: avatar('Natalie Owens'), time: '9:12 AM', membership: 'Monthly', billingStatus: 'Current' },
    { id: '10', name: 'Kevin Duarte', avatarUrl: avatar('Kevin Duarte'), time: '9:42 AM', membership: 'Day Pass', billingStatus: 'Past Due' },
  ]

  return {
    kpis,
    revenueSeries,
    revenueSummary,
    signupSeries,
    heatmapData,
    checkinPeriods,
    recentCheckIns,
    dateRange,
    loading: false,
    errors: {},
    refetch: () => {},
  }
}
// ─── End mock data block ───────────────────────────────────────────────

interface DashboardErrors {
  members?: Error
  payments?: Error
  checkIns?: Error
  recent?: Error
}

export interface DashboardDataResult {
  kpis: KpiData | null
  revenueSeries: RevenueBucket[]
  revenueSummary: SummaryRow[]
  signupSeries: SignupBucket[]
  heatmapData: number[][]
  checkinPeriods: CheckinPeriodRow[]
  recentCheckIns: RecentCheckIn[]
  dateRange: string
  loading: boolean
  errors: DashboardErrors
  refetch: () => void
}

export function useDashboardData(timeRange: StatsTimeRange): DashboardDataResult {
  if (USE_MOCK_DATA) return getMockData(timeRange)

  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState<KpiData | null>(null)
  const [revenueSeries, setRevenueSeries] = useState<RevenueBucket[]>([])
  const [revenueSummary, setRevenueSummary] = useState<SummaryRow[]>([])
  const [signupSeries, setSignupSeries] = useState<SignupBucket[]>([])
  const [heatmapData, setHeatmapData] = useState<number[][]>([])
  const [checkinPeriods, setCheckinPeriods] = useState<CheckinPeriodRow[]>([])
  const [recentCheckIns, setRecentCheckIns] = useState<RecentCheckIn[]>([])
  const [errors, setErrors] = useState<DashboardErrors>({})

  const abortRef = useRef<AbortController | null>(null)
  const requestRef = useRef(0)

  const { label: dateRange } = computeDateRange(timeRange)

  const fetchData = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const requestId = ++requestRef.current

    setLoading(true)
    setErrors({})

    try {
      const raw = await fetchDashboardData(timeRange, controller.signal)

      if (requestRef.current !== requestId) return

      const newErrors: DashboardErrors = {}
      if (raw.members.error) newErrors.members = raw.members.error
      if (raw.payments.error) newErrors.payments = raw.payments.error
      if (raw.checkIns.error) newErrors.checkIns = raw.checkIns.error
      if (raw.recentCheckIns.error) newErrors.recent = raw.recentCheckIns.error

      const members = raw.members.data ?? []
      const payments = raw.payments.data ?? []
      const checkIns = raw.checkIns.data ?? []
      const recent = raw.recentCheckIns.data ?? []

      setKpis(aggregateKpis(members, payments, checkIns, timeRange))
      setRevenueSeries(aggregateRevenueSeries(payments, timeRange))
      setRevenueSummary(aggregateRevenueSummary(payments, timeRange))
      setSignupSeries(aggregateSignupSeries(members, timeRange))
      setHeatmapData(aggregateHeatmap(checkIns, raw.timezone))
      setCheckinPeriods(aggregateCheckinPeriods(checkIns, raw.timezone))
      setRecentCheckIns(mapRecentCheckIns(recent))
      setErrors(newErrors)
    } catch (err) {
      if (requestRef.current !== requestId) return
      if ((err as Error).name === 'AbortError') return
      setErrors({ members: err as Error })
    } finally {
      if (requestRef.current === requestId) {
        setLoading(false)
      }
    }
  }, [timeRange])

  useEffect(() => {
    fetchData()
    return () => { abortRef.current?.abort() }
  }, [fetchData])

  return {
    kpis,
    revenueSeries,
    revenueSummary,
    signupSeries,
    heatmapData,
    checkinPeriods,
    recentCheckIns,
    dateRange,
    loading,
    errors,
    refetch: fetchData,
  }
}
