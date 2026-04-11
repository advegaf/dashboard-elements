import { useMemo, useState } from 'react'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ActionIssueType, ActionQueueRow } from '@/hooks/useOverviewData'

type FilterValue = ActionIssueType | 'all'

const filterOptions: { label: string; value: FilterValue }[] = [
  { label: 'All',         value: 'all' },
  { label: 'Past due',    value: 'past-due' },
  { label: 'Failed card', value: 'failed-card' },
  { label: 'At risk',     value: 'at-risk' },
]

const issueLabels: Record<ActionIssueType, string> = {
  'past-due':    'Past due',
  'failed-card': 'Failed card',
  'at-risk':     'At risk',
}

const actionButtonLabels: Record<ActionIssueType, string> = {
  'past-due':    'Call',
  'failed-card': 'Retry',
  'at-risk':     'Message',
}

export function ActionQueue({ rows }: { rows: ActionQueueRow[] }) {
  const [filter, setFilter] = useState<FilterValue>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? rows : rows.filter((row) => row.issueType === filter)),
    [rows, filter],
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Action queue ({filtered.length})</CardTitle>
        <CardAction>
          <Select value={filter} onValueChange={(value) => setFilter(value as FilterValue)}>
            <SelectTrigger size="sm" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Member</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Amount / Days</TableHead>
              <TableHead>Last activity</TableHead>
              <TableHead className="pr-6 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                  Nothing to triage. Clean house.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="pl-6 font-medium">{row.memberName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{issueLabels[row.issueType]}</Badge>
                  </TableCell>
                  <TableCell>
                    {row.amount ?? (row.days !== undefined ? `${row.days}d` : '—')}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.lastActivity}</TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button size="sm" variant="outline">
                      {actionButtonLabels[row.issueType]}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
