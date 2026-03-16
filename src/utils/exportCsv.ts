import type { Member } from '../data/members'

function csvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function exportMembersCsv(members: Member[], filenamePrefix: string) {
  const headers = ['Name', 'Email', 'Phone', 'Plan', 'Status', 'Joined', 'Last Visit', 'Total Visits', 'Revenue', 'Notes']
  const rows = members.map(m => [
    csvField(m.name),
    csvField(m.email),
    csvField(m.phone),
    csvField(m.plan),
    csvField(m.status),
    csvField(m.joined),
    csvField(m.lastVisit),
    String(m.totalVisits),
    String(m.revenue),
    csvField(m.notes),
  ])
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `${filenamePrefix}-${date}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
