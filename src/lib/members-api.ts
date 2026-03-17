import { supabase } from './supabase'
import type { Member, MemberPlan, MemberStatus } from '../data/members'
import { fallbackAvatarUrl } from '../utils/avatar'
import { capitalize } from '../utils/strings'

// Cached gym data for the current user
let cachedGymData: { gymId: string; timezone: string } | null = null

const SUBSCRIPTION_SELECT = `*, subscriptions(status, created_at, membership_plans(name))`

type SubscriptionRow = {
  status: string
  created_at: string
  membership_plans: { name: string } | null
}

type MemberRow = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  status: string
  joined_at: string
  last_visit_at: string | null
  total_visits: number
  emergency_contact: string | null
  avatar_url: string | null
  billing_status: string | null
  next_payment: string | null
  payment_method: string | null
  revenue: number
  notes: string | null
  subscriptions: SubscriptionRow[]
}

function resolvePlan(subscriptions: SubscriptionRow[] | null): MemberPlan {
  if (!subscriptions || subscriptions.length === 0) return 'Monthly'
  const active = subscriptions.find(s => s.status === 'active')
  const sub = active ?? subscriptions[0]
  const planName = sub.membership_plans?.name ?? 'Monthly'
  if (planName === '10-Class Pack') return 'Class Pack'
  return planName as MemberPlan
}

function throwSupabaseError(error: { code?: string; message: string }, action: string): never {
  if (error.code === '42501' || error.message.includes('permission')) {
    throw new Error('Permission denied.')
  }
  throw new Error(`Failed to ${action}: ${error.message}`)
}

function mapDbToMember(row: MemberRow): Member {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email ?? '',
    phone: row.phone ?? '',
    plan: resolvePlan(row.subscriptions),
    status: capitalize(row.status) as MemberStatus,
    joined: row.joined_at.slice(0, 10),
    lastVisit: row.last_visit_at ? row.last_visit_at.slice(0, 10) : '—',
    totalVisits: row.total_visits,
    emergencyContact: row.emergency_contact ?? '',
    avatarUrl: row.avatar_url ?? fallbackAvatarUrl(row.full_name),
    billingStatus: (row.billing_status ? capitalize(row.billing_status) : 'Pending') as Member['billingStatus'],
    nextPayment: row.next_payment ?? '—',
    paymentMethod: row.payment_method ?? '',
    revenue: row.revenue,
    notes: row.notes ?? '',
    checkInHistory: [],
  }
}

function mapMemberToDb(updates: Partial<Member>): Record<string, unknown> {
  const map: Record<string, unknown> = {}
  if (updates.name !== undefined) map.full_name = updates.name
  if (updates.email !== undefined) map.email = updates.email
  if (updates.phone !== undefined) map.phone = updates.phone
  if (updates.status !== undefined) map.status = updates.status.toLowerCase()
  if (updates.notes !== undefined) map.notes = updates.notes
  if (updates.emergencyContact !== undefined) map.emergency_contact = updates.emergencyContact
  if (updates.avatarUrl !== undefined) map.avatar_url = updates.avatarUrl
  if (updates.joined !== undefined) map.joined_at = updates.joined
  if (updates.lastVisit !== undefined && updates.lastVisit !== '—') map.last_visit_at = updates.lastVisit
  if (updates.totalVisits !== undefined) map.total_visits = updates.totalVisits
  if (updates.billingStatus !== undefined) map.billing_status = updates.billingStatus.toLowerCase()
  if (updates.nextPayment !== undefined && updates.nextPayment !== '—') map.next_payment = updates.nextPayment
  if (updates.paymentMethod !== undefined) map.payment_method = updates.paymentMethod
  if (updates.revenue !== undefined) map.revenue = updates.revenue
  return map
}

export async function getGymId(): Promise<string> {
  if (cachedGymData) return cachedGymData.gymId

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('gym_id')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('Account setup incomplete — no gym profile found.')
  }

  const { data: gym } = await supabase
    .from('gyms')
    .select('timezone')
    .eq('id', profile.gym_id)
    .single()

  cachedGymData = {
    gymId: profile.gym_id,
    timezone: gym?.timezone ?? 'UTC',
  }
  return cachedGymData.gymId
}

export async function getGymTimezone(): Promise<string> {
  if (cachedGymData) return cachedGymData.timezone
  await getGymId()
  return cachedGymData!.timezone
}

export async function fetchMembers(): Promise<Member[]> {
  const gymId = await getGymId()

  const { data, error } = await supabase
    .from('members')
    .select(SUBSCRIPTION_SELECT)
    .eq('gym_id', gymId)
    .order('created_at', { ascending: false })

  if (error) {
    throwSupabaseError(error, 'load members')
  }

  if ((!data || data.length === 0)) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()
      if (!profile) {
        throw new Error('Account setup incomplete — no gym profile found.')
      }
    }
  }

  return (data ?? []).map(row => mapDbToMember(row as unknown as MemberRow))
}

export async function addMember(memberData: {
  name: string
  email: string
  phone: string
  status: string
  notes: string
  emergencyContact: string
  avatarUrl: string
  joined: string
}): Promise<Member> {
  const gymId = await getGymId()

  const { data: row, error } = await supabase
    .from('members')
    .insert({
      gym_id: gymId,
      full_name: memberData.name,
      email: memberData.email || null,
      phone: memberData.phone || null,
      status: (memberData.status?.toLowerCase() ?? 'active') as 'active' | 'frozen' | 'cancelled' | 'past_due',
      notes: memberData.notes || null,
      emergency_contact: memberData.emergencyContact || null,
      avatar_url: memberData.avatarUrl || null,
      joined_at: memberData.joined,
    })
    .select(SUBSCRIPTION_SELECT)
    .single()

  if (error) {
    throwSupabaseError(error, 'add member')
  }

  return mapDbToMember(row as unknown as MemberRow)
}

export async function updateMember(id: string, updates: Partial<Member>): Promise<Member> {
  const dbUpdates = mapMemberToDb(updates)

  const { data: row, error } = await supabase
    .from('members')
    .update(dbUpdates)
    .eq('id', id)
    .select(SUBSCRIPTION_SELECT)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Member not found — it may have been deleted.')
    }
    throwSupabaseError(error, 'update member')
  }

  if (!row) {
    throw new Error('Member not found — it may have been deleted.')
  }

  return mapDbToMember(row as unknown as MemberRow)
}

export async function bulkUpdateStatus(ids: string[], status: MemberStatus): Promise<Member[]> {
  const { error } = await supabase
    .from('members')
    .update({ status: status.toLowerCase() as 'active' | 'frozen' | 'cancelled' | 'past_due' })
    .in('id', ids)

  if (error) {
    throwSupabaseError(error, 'update members')
  }

  const { data } = await supabase
    .from('members')
    .select(SUBSCRIPTION_SELECT)
    .in('id', ids)

  return (data ?? []).map(row => mapDbToMember(row as unknown as MemberRow))
}

export async function fetchCheckInHistory(memberId: string): Promise<{ date: string; time: string; type: string }[]> {
  const gymId = await getGymId()

  const { data, error } = await supabase
    .from('access_events')
    .select('result, scanned_at')
    .eq('member_id', memberId)
    .eq('gym_id', gymId)
    .eq('result', 'granted')
    .order('scanned_at', { ascending: false })
    .limit(20)

  if (error) return []

  return (data ?? []).map(row => {
    const dt = new Date(row.scanned_at)
    return {
      date: dt.toISOString().slice(0, 10),
      time: dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      type: 'Gym',
    }
  })
}

export function clearGymIdCache() {
  cachedGymData = null
}
