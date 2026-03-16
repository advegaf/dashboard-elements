import { describe, it, expect } from 'vitest'
import {
  computeDateRange,
  aggregateKpis,
  aggregateRevenueSeries,
  aggregateSignupSeries,
  aggregateHeatmap,
  aggregateCheckinPeriods,
  mapRecentCheckIns,
  type MemberSummaryRow,
  type PaymentEventRow,
  type CheckInEventRow,
  type RecentCheckInRow,
} from '../dashboard-aggregations'

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
    expect(sinceDaysAgo).toBeCloseTo(7, 0)
    const extDaysAgo = (Date.now() - r.extendedSince!.getTime()) / 86400000
    expect(extDaysAgo).toBeCloseTo(14, 0)
  })

  it('returns 30-day range', () => {
    const r = computeDateRange('30d')
    const sinceDaysAgo = (Date.now() - r.since!.getTime()) / 86400000
    expect(sinceDaysAgo).toBeCloseTo(30, 0)
  })

  it('returns 90-day range', () => {
    const r = computeDateRange('90d')
    const sinceDaysAgo = (Date.now() - r.since!.getTime()) / 86400000
    expect(sinceDaysAgo).toBeCloseTo(90, 0)
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
    const kpis = aggregateKpis(members, payments, checkIns, '30d')
    expect(kpis.retention).toBeDefined()
    expect(kpis.revenue).toBeDefined()
    expect(kpis.visits).toBeDefined()
    expect(kpis.signups).toBeDefined()
  })

  it('retention is non-cancelled / total as percentage', () => {
    const kpis = aggregateKpis(members, payments, checkIns, '30d')
    // 4 non-cancelled / 5 total = 80%
    expect(kpis.retention.value).toBe('80.0%')
  })

  it('revenue value reflects succeeded payments in current period', () => {
    const kpis = aggregateKpis(members, payments, checkIns, '30d')
    // $50 + $30 = $80 in last 30d (both are within range)
    expect(kpis.revenue.value).toBe('$80')
  })

  it('sparklines have 8 buckets', () => {
    const kpis = aggregateKpis(members, payments, checkIns, '30d')
    expect(kpis.retention.sparkline).toHaveLength(8)
    expect(kpis.revenue.sparkline).toHaveLength(8)
    expect(kpis.visits.sparkline).toHaveLength(8)
    expect(kpis.signups.sparkline).toHaveLength(8)
  })

  it('no trends for "all" range', () => {
    const kpis = aggregateKpis(members, payments, checkIns, 'all')
    expect(kpis.revenue.trend).toBeUndefined()
    expect(kpis.visits.trend).toBeUndefined()
    expect(kpis.signups.trend).toBeUndefined()
  })

  it('handles empty arrays', () => {
    const kpis = aggregateKpis([], [], [], '30d')
    expect(kpis.retention.value).toBe('0.0%')
    expect(kpis.revenue.value).toBe('$0')
    expect(kpis.visits.value).toBe('0.0')
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
    const series = aggregateRevenueSeries(payments, '30d')
    expect(series).toHaveLength(8)
    expect(series[0]).toHaveProperty('name')
    expect(series[0]).toHaveProperty('gray')
    expect(series[0]).toHaveProperty('revenue')
  })

  it('returns 8 zero buckets for empty array', () => {
    const series = aggregateRevenueSeries([], '30d')
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
    const series = aggregateRevenueSeries(payments, 'all')
    expect(series).toHaveLength(8)
    const total = series.reduce((s, b) => s + b.revenue, 0)
    expect(total).toBeCloseTo(0.1, 1) // $100 / 100000 = 0.1 in $k
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
    const series = aggregateSignupSeries(members, '30d')
    expect(series).toHaveLength(10)
    expect(series[0]).toHaveProperty('name')
    expect(series[0]).toHaveProperty('value')
  })

  it('returns 10 zero buckets for empty array', () => {
    const series = aggregateSignupSeries([], '30d')
    expect(series).toHaveLength(10)
    series.forEach(b => expect(b.value).toBe(0))
  })

  it('total matches input count for "all" range', () => {
    const members: MemberSummaryRow[] = [
      makeMember('active', 50),
      makeMember('frozen', 100),
      makeMember('active', 200),
    ]
    const series = aggregateSignupSeries(members, 'all')
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
