import type { User } from '@supabase/supabase-js'

export function getTimeGreeting(now: Date = new Date()): string {
  const hour = now.getHours()
  if (hour >= 5 && hour < 12) return 'Good morning'
  if (hour >= 12 && hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function getFirstName(user: User | null): string | null {
  if (!user) return null

  const metadata = user.user_metadata as Record<string, unknown> | undefined
  const rawFullName = metadata?.full_name ?? metadata?.name
  if (typeof rawFullName === 'string' && rawFullName.trim().length > 0) {
    return capitalize(rawFullName.trim().split(/\s+/)[0])
  }

  const emailPrefix = user.email?.split('@')[0]
  if (emailPrefix && emailPrefix.length > 0) return capitalize(emailPrefix)

  return null
}

export function getActionCopy(count: number): string {
  if (count === 0) return 'All clear — nothing to triage'
  if (count === 1) return '1 account needs your attention'
  return `${count} accounts need your attention`
}

function capitalize(s: string): string {
  return s[0].toUpperCase() + s.slice(1)
}
