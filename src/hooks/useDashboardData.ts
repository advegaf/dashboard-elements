import { useState, useEffect, useRef, useCallback } from 'react'
import type { StatsTimeRange } from '../lib/dashboard-aggregations'
import { fetchDashboardData } from '../lib/dashboard-api'
import {
  aggregateKpis,
  aggregateRevenueSeries,
  aggregateRevenueSlices,
  aggregateSignupSeries,
  aggregateRetentionSeries,
  aggregateHeatmap,
  aggregateCheckinPeriods,
  aggregateFailedPayments,
  mapRecentCheckIns,
  computeDateRange,
  type KpiData,
  type RevenueBucket,
  type RevenueSlice,
  type SignupBucket,
  type RetentionBucket,
  type SummaryRow,
  type RecentCheckIn,
  type FailedPaymentData,
} from '../lib/dashboard-aggregations'
import { fallbackAvatarUrl } from '../utils/avatar'

// ─── Flip to false (or delete this block) to use live Supabase data ────
const USE_MOCK_DATA = true

function getMockData(timeRange: StatsTimeRange): DashboardState {
  void timeRange

  const kpis: KpiData = {
    retention: {
      value: '94.2%',
      trend: { value: 2.1, direction: 'up' },
      sparkline: [91.5, 92.0, 92.8, 93.1, 93.5, 93.8, 94.0, 94.2],
      memberCount: 247,
    },
    revenue: {
      value: '$24,500',
      trend: { value: 5.8, direction: 'up' },
      sparkline: [205, 212, 218, 224, 231, 236, 241, 245],
    },
    churnRisk: {
      total: 14,
      critical: 3,
      high: 4,
      medium: 7,
      trend: { value: 21.4, direction: 'up' },
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

  const revenueSlices: RevenueSlice[] = [
    { label: 'Memberships', value: 1456700, formatted: '$14,567', change: '+5.4%', positive: true },
    { label: 'Personal Training', value: 1145700, formatted: '$11,457', change: '+3.6%', positive: true },
    { label: 'Retail & Merch', value: 378900, formatted: '$3,789', change: '-4.0%', positive: false },
  ]

  const retentionSeries: RetentionBucket[] = [
    { name: 'Feb 5', value: 91.5 },
    { name: 'Feb 9', value: 92.0 },
    { name: 'Feb 12', value: 92.8 },
    { name: 'Feb 15', value: 93.1 },
    { name: 'Feb 18', value: 93.5 },
    { name: 'Feb 21', value: 93.8 },
    { name: 'Feb 24', value: 94.0 },
    { name: 'Feb 27', value: 93.6 },
    { name: 'Mar 2', value: 93.9 },
    { name: 'Mar 5', value: 94.2 },
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

  const checkinPeriods: SummaryRow[] = [
    { label: 'Morning (6\u201311 AM)', value: '1,245', change: '+8.2%', positive: true },
    { label: 'Afternoon (12\u20134 PM)', value: '876', change: '-2.1%', positive: false },
    { label: 'Evening (5\u20139 PM)', value: '2,035', change: '+18.7%', positive: true },
  ]

  const avatar = (name: string) => fallbackAvatarUrl(name)

  const failedPayments: FailedPaymentData = {
    totalAmount: '$2,847',
    totalAmountCents: 284700,
    totalCount: 12,
    trend: { value: 12.5, direction: 'up' },
    rows: [
      { label: 'Expired Card', count: 4, amount: '$1,200', amountCents: 120000 },
      { label: 'Insufficient Funds', count: 5, amount: '$1,047', amountCents: 104700 },
      { label: 'Card Declined', count: 2, amount: '$400', amountCents: 40000 },
      { label: 'Processing Error', count: 1, amount: '$200', amountCents: 20000 },
    ],
  }

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
    revenueSlices,
    signupSeries,
    retentionSeries,
    heatmapData,
    checkinPeriods,
    recentCheckIns,
    failedPayments,
    loading: false,
    errors: {},
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
  revenueSlices: RevenueSlice[]
  signupSeries: SignupBucket[]
  retentionSeries: RetentionBucket[]
  heatmapData: number[][]
  checkinPeriods: SummaryRow[]
  recentCheckIns: RecentCheckIn[]
  failedPayments: FailedPaymentData
  dateRange: string
  loading: boolean
  errors: DashboardErrors
  refetch: () => void
}

interface DashboardState {
  kpis: KpiData | null
  revenueSeries: RevenueBucket[]
  revenueSlices: RevenueSlice[]
  signupSeries: SignupBucket[]
  retentionSeries: RetentionBucket[]
  heatmapData: number[][]
  checkinPeriods: SummaryRow[]
  recentCheckIns: RecentCheckIn[]
  failedPayments: FailedPaymentData
  loading: boolean
  errors: DashboardErrors
}

const initialState: DashboardState = {
  kpis: null,
  revenueSeries: [],
  revenueSlices: [],
  signupSeries: [],
  retentionSeries: [],
  heatmapData: [],
  checkinPeriods: [],
  recentCheckIns: [],
  failedPayments: { totalAmount: '$0', totalAmountCents: 0, totalCount: 0, rows: [] },
  loading: true,
  errors: {},
}

export function useDashboardData(timeRange: StatsTimeRange): DashboardDataResult {
  const [data, setData] = useState<DashboardState>(initialState)
  const abortRef = useRef<AbortController | null>(null)
  const requestRef = useRef(0)

  const { label: dateRange } = computeDateRange(timeRange)

  const fetchData = useCallback(async () => {
    if (USE_MOCK_DATA) {
      setData(getMockData(timeRange))
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    const requestId = ++requestRef.current

    setData(prev => ({ ...prev, loading: true, errors: {} }))

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

      const range = computeDateRange(timeRange)

      setData({
        kpis: aggregateKpis(members, payments, checkIns, range),
        revenueSeries: aggregateRevenueSeries(payments, range),
        revenueSlices: aggregateRevenueSlices(payments, timeRange, range),
        signupSeries: aggregateSignupSeries(members, range),
        retentionSeries: aggregateRetentionSeries(members, range),
        heatmapData: aggregateHeatmap(checkIns, raw.timezone),
        checkinPeriods: aggregateCheckinPeriods(checkIns, raw.timezone),
        recentCheckIns: mapRecentCheckIns(recent),
        failedPayments: aggregateFailedPayments(payments, timeRange, range),
        loading: false,
        errors: newErrors,
      })
    } catch (err) {
      if (requestRef.current !== requestId) return
      if ((err as Error).name === 'AbortError') return
      setData(prev => ({ ...prev, loading: false, errors: { members: err as Error } }))
    }
  }, [timeRange])

  useEffect(() => {
    fetchData()
    return () => { abortRef.current?.abort() }
  }, [fetchData])

  return {
    ...data,
    dateRange,
    refetch: fetchData,
  }
}
