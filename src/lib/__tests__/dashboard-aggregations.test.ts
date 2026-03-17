import { describe, it, expect } from 'vitest'
import {
  computeDateRange,
  aggregateKpis,
  aggregateRevenueSeries,
  aggregateRevenueSlices,
  aggregateFailedPayments,
  toSummaryRows,
  aggregateSignupSeries,
  aggregateHeatmap,
  aggregateCheckinPeriods,
  mapRecentCheckIns,
  type DateRange,
  type MemberSummaryRow,
  type PaymentEventRow,
  type CheckInEventRow,
  type RecentCheckInRow,
} from '../dashboard-aggregations'

function range(tr: '7d' | '30d' | '90d' | 'all'): DateRange {
  return computeDateRange(tr)
}

// ── Helpers ─────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function makeMember(status: string, daysAgoJoined: number): MemberSummaryRow {
  return { status, joined_at: daysAgo(daysAgoJoined) }
}

function makePayment(amountCents: number, status: string, daysAgoCreated: number, eventType = 'subscription'): PaymentEventRow {
  return { amount_cents: amountCents, status, created_at: daysAgo(daysAgoCreated), event_type: eventType }
}

function makeCheckIn(daysAgoScanned: number, utcHour = 10): CheckInEventRow {
  const d = new Date()
  d.setDate(d.getDate() - daysAgoScanned)
  d.setUTCHours(utcHour, 0, 0, 0)
  return { scanned_at: d.toISOString() }
}

// ── computeDateRange ────────────────────────────────────────────────────

describe('computeDateRange', () => {
  it('returns nulls for "all"', () => {
    const r = computeDateRange('all')
    expect(r.since).toBeNull()
    expect(r.extendedSince).toBeNull()
    expect(r.label).toBe('All time')
  })

  it('returns 7-day range', () => {
    const r = computeDateRange('7d')
    expect(r.since).toBeInstanceOf(Date)
    expect(r.extendedSince).toBeInstanceOf(Date)
    const sinceDaysAgo = (Date.now() - r.since!.getTime()) / 86400000
    // since snaps to midnight, so actual difference is 7-8 days
    expect(sinceDaysAgo).toBeGreaterThanOrEqual(7)
    expect(sinceDaysAgo).toBeLessThan(8.1)
    const extDaysAgo = (Date.now() - r.extendedSince!.getTime()) / 86400000
    expect(extDaysAgo).toBeGreaterThanOrEqual(14)
    expect(extDaysAgo).toBeLessThan(15.1)
  })

  it('returns 30-day range', () => {
    const r = computeDateRange('30d')
    const sinceDaysAgo = (Date.now() - r.since!.getTime()) / 86400000
    expect(sinceDaysAgo).toBeGreaterThanOrEqual(30)
    expect(sinceDaysAgo).toBeLessThan(31.1)
  })

  it('returns 90-day range', () => {
    const r = computeDateRange('90d')
    const sinceDaysAgo = (Date.now() - r.since!.getTime()) / 86400000
    expect(sinceDaysAgo).toBeGreaterThanOrEqual(90)
    expect(sinceDaysAgo).toBeLessThan(91.1)
  })

  it('label is non-empty for bounded ranges', () => {
    expect(computeDateRange('7d').label).toContain(' - ')
    expect(computeDateRange('30d').label).toContain(' - ')
    expect(computeDateRange('90d').label).toContain(' - ')
  })
})

// ── aggregateKpis ───────────────────────────────────────────────────────

describe('aggregateKpis', () => {
  const members: MemberSummaryRow[] = [
    makeMember('active', 5),
    makeMember('active', 10),
    makeMember('active', 20),
    makeMember('frozen', 15),
    makeMember('cancelled', 25),
  ]

  const payments: PaymentEventRow[] = [
    makePayment(5000, 'succeeded', 3),
    makePayment(3000, 'succeeded', 12),
    makePayment(1000, 'failed', 5),
  ]

  const checkIns: CheckInEventRow[] = [
    makeCheckIn(1), makeCheckIn(2), makeCheckIn(3),
    makeCheckIn(10), makeCheckIn(15), makeCheckIn(20),
  ]

  it('returns all four KPI values', () => {
    const kpis = aggregateKpis(members, payments, checkIns, range('30d'))
    expect(kpis.retention).toBeDefined()
    expect(kpis.revenue).toBeDefined()
    expect(kpis.churnRisk).toBeDefined()
    expect(kpis.signups).toBeDefined()
  })

  it('retention is non-cancelled / total as percentage', () => {
    const kpis = aggregateKpis(members, payments, checkIns, range('30d'))
    // 4 non-cancelled / 5 total = 80%
    expect(kpis.retention.value).toBe('80.0%')
  })

  it('revenue value reflects succeeded payments in current period', () => {
    const kpis = aggregateKpis(members, payments, checkIns, range('30d'))
    // $50 + $30 = $80 in last 30d (both are within range)
    expect(kpis.revenue.value).toBe('$80')
  })

  it('sparklines have 8 buckets', () => {
    const kpis = aggregateKpis(members, payments, checkIns, range('30d'))
    expect(kpis.retention.sparkline).toHaveLength(8)
    expect(kpis.revenue.sparkline).toHaveLength(8)
    expect(kpis.signups.sparkline).toHaveLength(8)
  })

  it('no trends for "all" range', () => {
    const kpis = aggregateKpis(members, payments, checkIns, range('all'))
    expect(kpis.revenue.trend).toBeUndefined()
    expect(kpis.churnRisk.trend).toBeUndefined()
    expect(kpis.signups.trend).toBeUndefined()
  })

  it('handles empty arrays', () => {
    const kpis = aggregateKpis([], [], [], range('30d'))
    expect(kpis.retention.value).toBe('0.0%')
    expect(kpis.revenue.value).toBe('$0')
    expect(kpis.churnRisk.total).toBe(0)
    expect(kpis.signups.value).toBe('0')
    expect(kpis.retention.sparkline).toHaveLength(8)
  })
})

// ── aggregateRevenueSeries ──────────────────────────────────────────────

describe('aggregateRevenueSeries', () => {
  it('returns 8 buckets', () => {
    const payments: PaymentEventRow[] = [
      makePayment(5000, 'succeeded', 3),
      makePayment(3000, 'succeeded', 10),
    ]
    const series = aggregateRevenueSeries(payments, range('30d'))
    expect(series).toHaveLength(8)
    expect(series[0]).toHaveProperty('name')
    expect(series[0]).toHaveProperty('gray')
    expect(series[0]).toHaveProperty('revenue')
  })

  it('returns 8 zero buckets for empty array', () => {
    const series = aggregateRevenueSeries([], range('30d'))
    expect(series).toHaveLength(8)
    series.forEach(b => {
      expect(b.gray).toBe(0)
      expect(b.revenue).toBe(0)
    })
  })

  it('works with "all" time range', () => {
    const payments: PaymentEventRow[] = [
      makePayment(10000, 'succeeded', 100),
    ]
    const series = aggregateRevenueSeries(payments, range('all'))
    expect(series).toHaveLength(8)
    const total = series.reduce((s, b) => s + b.revenue, 0)
    expect(total).toBeCloseTo(0.1, 1) // $100 / 100000 = 0.1 in $k
  })
})

// ── aggregateRevenueSlices ──────────────────────────────────────────────

describe('aggregateRevenueSlices', () => {
  it('groups payments by event_type correctly', () => {
    const payments: PaymentEventRow[] = [
      makePayment(5000, 'succeeded', 3, 'membership'),
      makePayment(3000, 'succeeded', 5, 'membership'),
      makePayment(2000, 'succeeded', 4, 'personal_training'),
    ]
    const slices = aggregateRevenueSlices(payments, '30d')
    expect(slices).toHaveLength(2)
    expect(slices[0].label).toBe('Membership')
    expect(slices[1].label).toBe('Personal training')
  })

  it('returns raw numeric value field', () => {
    const payments: PaymentEventRow[] = [
      makePayment(5000, 'succeeded', 3, 'membership'),
      makePayment(3000, 'succeeded', 5, 'membership'),
    ]
    const slices = aggregateRevenueSlices(payments, '30d')
    expect(slices[0].value).toBe(8000)
  })

  it('computes formatted string', () => {
    const payments: PaymentEventRow[] = [
      makePayment(150000, 'succeeded', 3, 'membership'),
    ]
    const slices = aggregateRevenueSlices(payments, '30d')
    expect(slices[0].formatted).toBe('$1,500')
  })

  it('computes trends vs prior period', () => {
    const payments: PaymentEventRow[] = [
      makePayment(5000, 'succeeded', 3, 'membership'),   // current 30d
      makePayment(3000, 'succeeded', 45, 'membership'),  // prior 30d
    ]
    const slices = aggregateRevenueSlices(payments, '30d')
    expect(slices[0].change).toContain('+')
    expect(slices[0].positive).toBe(true)
  })

  it('handles empty payments array', () => {
    const slices = aggregateRevenueSlices([], '30d')
    expect(slices).toEqual([])
  })

  it('handles "all" time range', () => {
    const payments: PaymentEventRow[] = [
      makePayment(5000, 'succeeded', 3, 'membership'),
    ]
    const slices = aggregateRevenueSlices(payments, 'all')
    expect(slices).toHaveLength(1)
    // With 'all' range, prior period is empty so trend computes vs 0
    expect(slices[0].change).toBe('+100%')
  })

  it('single event_type returns 1 slice', () => {
    const payments: PaymentEventRow[] = [
      makePayment(5000, 'succeeded', 3, 'retail'),
      makePayment(2000, 'succeeded', 5, 'retail'),
    ]
    const slices = aggregateRevenueSlices(payments, '30d')
    expect(slices).toHaveLength(1)
    expect(slices[0].label).toBe('Retail')
  })
})

// ── toSummaryRows ───────────────────────────────────────────────────────

describe('toSummaryRows', () => {
  it('maps RevenueSlice fields to SummaryRow fields', () => {
    const slices = [
      { label: 'Membership', value: 5000, formatted: '$50', change: '+10%', positive: true },
      { label: 'Retail', value: 2000, formatted: '$20', change: '-5%', positive: false },
    ]
    const rows = toSummaryRows(slices)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual({ label: 'Membership', value: '$50', change: '+10%', positive: true })
    expect(rows[1]).toEqual({ label: 'Retail', value: '$20', change: '-5%', positive: false })
  })
})

// ── aggregateSignupSeries ───────────────────────────────────────────────

describe('aggregateSignupSeries', () => {
  it('returns 10 buckets', () => {
    const members: MemberSummaryRow[] = [
      makeMember('active', 3),
      makeMember('active', 10),
      makeMember('active', 20),
    ]
    const series = aggregateSignupSeries(members, range('30d'))
    expect(series).toHaveLength(10)
    expect(series[0]).toHaveProperty('name')
    expect(series[0]).toHaveProperty('value')
  })

  it('returns 10 zero buckets for empty array', () => {
    const series = aggregateSignupSeries([], range('30d'))
    expect(series).toHaveLength(10)
    series.forEach(b => expect(b.value).toBe(0))
  })

  it('total matches input count for "all" range', () => {
    const members: MemberSummaryRow[] = [
      makeMember('active', 50),
      makeMember('frozen', 100),
      makeMember('active', 200),
    ]
    const series = aggregateSignupSeries(members, range('all'))
    const total = series.reduce((s, b) => s + b.value, 0)
    expect(total).toBe(3)
  })
})

// ── aggregateHeatmap ────────────────────────────────────────────────────

describe('aggregateHeatmap', () => {
  it('returns 7×24 grid of zeros for empty input', () => {
    const grid = aggregateHeatmap([], 'America/New_York')
    expect(grid).toHaveLength(7)
    grid.forEach(row => {
      expect(row).toHaveLength(24)
      row.forEach(v => expect(v).toBe(0))
    })
  })

  it('populates cells for check-in data', () => {
    const checkIns: CheckInEventRow[] = [
      makeCheckIn(1, 10),
      makeCheckIn(1, 10),
      makeCheckIn(1, 14),
    ]
    const grid = aggregateHeatmap(checkIns, 'UTC')
    const totalCheckIns = grid.flat().reduce((a, b) => a + b, 0)
    expect(totalCheckIns).toBe(3)
  })

  it('falls back to browser timezone for invalid tz', () => {
    const checkIns: CheckInEventRow[] = [makeCheckIn(1, 10)]
    const grid = aggregateHeatmap(checkIns, 'Invalid/Timezone')
    const totalCheckIns = grid.flat().reduce((a, b) => a + b, 0)
    expect(totalCheckIns).toBe(1)
  })

  it('respects timezone for hour grouping', () => {
    // Create a check-in at a specific UTC time
    const d = new Date()
    d.setUTCHours(15, 0, 0, 0) // 3 PM UTC = 10 AM EST
    const checkIns: CheckInEventRow[] = [{ scanned_at: d.toISOString() }]

    const gridUTC = aggregateHeatmap(checkIns, 'UTC')
    const gridEST = aggregateHeatmap(checkIns, 'America/New_York')

    // Both should have exactly 1 check-in total
    expect(gridUTC.flat().reduce((a, b) => a + b, 0)).toBe(1)
    expect(gridEST.flat().reduce((a, b) => a + b, 0)).toBe(1)

    // But in different hour columns (unless we can't determine the exact offset)
    const utcHour = gridUTC.flat().findIndex(v => v > 0)
    const estHour = gridEST.flat().findIndex(v => v > 0)
    // They should differ (EST is UTC-5 or UTC-4)
    if (utcHour >= 0 && estHour >= 0) {
      expect(utcHour).not.toBe(estHour)
    }
  })
})

// ── aggregateCheckinPeriods ─────────────────────────────────────────────

describe('aggregateCheckinPeriods', () => {
  it('returns 3 period rows', () => {
    const rows = aggregateCheckinPeriods([], 'UTC')
    expect(rows).toHaveLength(3)
    expect(rows[0].label).toContain('Morning')
    expect(rows[1].label).toContain('Afternoon')
    expect(rows[2].label).toContain('Evening')
  })

  it('returns zero values for empty input', () => {
    const rows = aggregateCheckinPeriods([], 'UTC')
    rows.forEach(r => expect(r.value).toBe('0'))
  })

  it('categorizes by hour correctly', () => {
    const checkIns: CheckInEventRow[] = [
      makeCheckIn(1, 8),   // Morning
      makeCheckIn(1, 9),   // Morning
      makeCheckIn(1, 14),  // Afternoon
      makeCheckIn(1, 18),  // Evening
      makeCheckIn(1, 19),  // Evening
      makeCheckIn(1, 20),  // Evening
    ]
    const rows = aggregateCheckinPeriods(checkIns, 'UTC')
    expect(rows[0].value).toBe('2')  // Morning
    expect(rows[1].value).toBe('1')  // Afternoon
    expect(rows[2].value).toBe('3')  // Evening
  })
})

// ── mapRecentCheckIns ───────────────────────────────────────────────────

describe('mapRecentCheckIns', () => {
  it('maps rows to RecentCheckIn objects', () => {
    const rows: RecentCheckInRow[] = [{
      id: 'ev-1',
      scanned_at: new Date().toISOString(),
      members: {
        full_name: 'Jane Doe',
        avatar_url: null,
        status: 'active',
        billing_status: 'current',
        subscriptions: [{ membership_plans: { name: 'Annual' } }],
      },
    }]

    const result = mapRecentCheckIns(rows)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Jane Doe')
    expect(result[0].membership).toBe('Annual')
    expect(result[0].billingStatus).toBe('Current')
    expect(result[0].avatarUrl).toContain('ui-avatars.com')
  })

  it('returns empty array for empty input', () => {
    expect(mapRecentCheckIns([])).toEqual([])
  })

  it('uses avatar_url when provided', () => {
    const rows: RecentCheckInRow[] = [{
      id: 'ev-2',
      scanned_at: new Date().toISOString(),
      members: {
        full_name: 'John',
        avatar_url: 'https://example.com/photo.jpg',
        status: 'active',
        billing_status: null,
        subscriptions: [],
      },
    }]

    const result = mapRecentCheckIns(rows)
    expect(result[0].avatarUrl).toBe('https://example.com/photo.jpg')
    expect(result[0].membership).toBe('No Plan')
    expect(result[0].billingStatus).toBe('Pending')
  })
})

// ── aggregateFailedPayments ───────────────────────────────────────────

describe('aggregateFailedPayments', () => {
  function makeFailedPayment(amountCents: number, daysAgoCreated: number, reason?: string): PaymentEventRow {
    return {
      amount_cents: amountCents,
      status: 'failed',
      created_at: daysAgo(daysAgoCreated),
      event_type: 'subscription',
      failure_reason: reason,
    }
  }

  it('aggregates failed payments by reason with correct counts and amounts', () => {
    const payments: PaymentEventRow[] = [
      makeFailedPayment(5000, 3, 'expired_card'),
      makeFailedPayment(3000, 5, 'expired_card'),
      makeFailedPayment(2000, 4, 'insufficient_funds'),
      makePayment(10000, 'succeeded', 2),
    ]
    const result = aggregateFailedPayments(payments, '30d')
    expect(result.totalCount).toBe(3)
    expect(result.totalAmountCents).toBe(10000)
    expect(result.totalAmount).toBe('$100')
    expect(result.rows).toHaveLength(2)
    // Sorted by amount descending
    expect(result.rows[0].label).toBe('Expired Card')
    expect(result.rows[0].count).toBe(2)
    expect(result.rows[0].amountCents).toBe(8000)
    expect(result.rows[1].label).toBe('Insufficient Funds')
    expect(result.rows[1].count).toBe(1)
  })

  it('returns zero totals and empty rows when no failures exist', () => {
    const payments: PaymentEventRow[] = [
      makePayment(5000, 'succeeded', 3),
      makePayment(3000, 'succeeded', 5),
    ]
    const result = aggregateFailedPayments(payments, '30d')
    expect(result.totalCount).toBe(0)
    expect(result.totalAmount).toBe('$0')
    expect(result.totalAmountCents).toBe(0)
    expect(result.rows).toHaveLength(0)
  })

  it('buckets missing failure_reason as "Unknown"', () => {
    const payments: PaymentEventRow[] = [
      makeFailedPayment(5000, 3),  // no failure_reason
      makeFailedPayment(2000, 5),  // no failure_reason
    ]
    const result = aggregateFailedPayments(payments, '30d')
    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].label).toBe('Unknown')
  })

  it('only includes failures within current time range', () => {
    const payments: PaymentEventRow[] = [
      makeFailedPayment(5000, 3, 'expired_card'),   // within 7d
      makeFailedPayment(3000, 10, 'expired_card'),  // outside 7d
    ]
    const result = aggregateFailedPayments(payments, '7d')
    expect(result.totalCount).toBe(1)
    expect(result.totalAmountCents).toBe(5000)
  })

  it('computes trend comparing current vs prior period', () => {
    const payments: PaymentEventRow[] = [
      makeFailedPayment(5000, 3, 'expired_card'),   // current 30d
      makeFailedPayment(3000, 45, 'expired_card'),  // prior 30d
    ]
    const result = aggregateFailedPayments(payments, '30d')
    expect(result.trend).toBeDefined()
    expect(result.trend!.direction).toBe('up')
    // (5000 - 3000) / 3000 ≈ 66.7%
    expect(result.trend!.value).toBeCloseTo(66.7, 0)
  })

  it('returns no trend for "all" time range', () => {
    const payments: PaymentEventRow[] = [
      makeFailedPayment(5000, 3, 'expired_card'),
    ]
    const result = aggregateFailedPayments(payments, 'all')
    expect(result.trend).toBeUndefined()
  })

  it('maps known failure reason codes to display labels', () => {
    const payments: PaymentEventRow[] = [
      makeFailedPayment(1000, 3, 'expired_card'),
      makeFailedPayment(1000, 3, 'insufficient_funds'),
      makeFailedPayment(1000, 3, 'generic_decline'),
      makeFailedPayment(1000, 3, 'processing_error'),
    ]
    const result = aggregateFailedPayments(payments, '30d')
    const labels = result.rows.map(r => r.label)
    expect(labels).toContain('Expired Card')
    expect(labels).toContain('Insufficient Funds')
    expect(labels).toContain('Card Declined')
    expect(labels).toContain('Processing Error')
  })
})
