import { useState, useCallback, useMemo } from 'react'

export type StatCardKey =
  | 'total'
  | 'active'
  | 'frozen'
  | 'cancelled'
  | 'newInPeriod'
  | 'atRisk'
  | 'pastDue'
  | 'avgVisitsPerWeek'
  | 'revenueInPeriod'
  | 'retentionRate'

export interface StatCardConfig {
  key: StatCardKey
  label: string
  color: string
  timeAware: boolean
}

export const ALL_CARD_TYPES: StatCardConfig[] = [
  { key: 'total', label: 'Total Members', color: '148,163,184', timeAware: false },
  { key: 'active', label: 'Active Members', color: '34,197,94', timeAware: false },
  { key: 'frozen', label: 'Frozen Members', color: '234,179,8', timeAware: false },
  { key: 'cancelled', label: 'Cancelled Members', color: '239,68,68', timeAware: false },
  { key: 'newInPeriod', label: 'New Members', color: '148,163,184', timeAware: true },
  { key: 'atRisk', label: 'Members at Risk', color: '249,115,22', timeAware: false },
  { key: 'pastDue', label: 'Past Due', color: '239,68,68', timeAware: false },
  { key: 'avgVisitsPerWeek', label: 'Avg Visits/Week', color: '59,130,246', timeAware: false },
  { key: 'revenueInPeriod', label: 'Revenue this Period', color: '16,185,129', timeAware: true },
  { key: 'retentionRate', label: 'Retention Rate', color: '168,85,247', timeAware: true },
]

const STORAGE_KEY = 'members-stats-cards-config'
const DEFAULT_KEYS: StatCardKey[] = ['total', 'active', 'frozen', 'cancelled', 'newInPeriod']

function loadConfig(): StatCardKey[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as StatCardKey[]
      if (Array.isArray(parsed) && parsed.every(k => ALL_CARD_TYPES.some(t => t.key === k))) {
        return parsed
      }
    }
  } catch {}
  return DEFAULT_KEYS
}

function saveConfig(keys: StatCardKey[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
}

export function useStatsCardsConfig() {
  const [activeKeys, setActiveKeys] = useState<StatCardKey[]>(loadConfig)
  const [isEditMode, setIsEditMode] = useState(false)

  const activeCards = useMemo(
    () => activeKeys.map(key => ALL_CARD_TYPES.find(t => t.key === key)!).filter(Boolean),
    [activeKeys]
  )

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev)
  }, [])

  const reorderCards = useCallback((fromIndex: number, toIndex: number) => {
    setActiveKeys(prev => {
      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      saveConfig(next)
      return next
    })
  }, [])

  const removeCard = useCallback((key: StatCardKey) => {
    setActiveKeys(prev => {
      const next = prev.filter(k => k !== key)
      saveConfig(next)
      return next
    })
  }, [])

  const addCard = useCallback((key: StatCardKey) => {
    setActiveKeys(prev => {
      if (prev.length >= 5 || prev.includes(key)) return prev
      const next = [...prev, key]
      saveConfig(next)
      return next
    })
  }, [])

  return { activeCards, isEditMode, toggleEditMode, reorderCards, removeCard, addCard }
}
