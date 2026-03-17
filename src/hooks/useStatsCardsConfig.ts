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

export interface StatCardConfig {
  key: StatCardKey
  label: string
  color: string
  timeAware: boolean
}

export const ALL_CARD_TYPES: StatCardConfig[] = [
  { key: 'total', label: 'Total Members', color: 'var(--gray-9)', timeAware: false },
  { key: 'active', label: 'Active Members', color: 'var(--color-success)', timeAware: false },
  { key: 'frozen', label: 'Frozen Members', color: 'var(--color-warning)', timeAware: false },
  { key: 'cancelled', label: 'Cancelled Members', color: 'var(--color-danger)', timeAware: false },
  { key: 'newInPeriod', label: 'New Members', color: 'var(--gray-9)', timeAware: true },
  { key: 'atRisk', label: 'Members at Risk', color: 'var(--color-urgency)', timeAware: false },
  { key: 'pastDue', label: 'Past Due', color: 'var(--color-danger)', timeAware: false },
  { key: 'avgVisitsPerWeek', label: 'Avg Visits/Week', color: 'var(--color-info)', timeAware: false },
  { key: 'revenueInPeriod', label: 'Revenue this Period', color: 'var(--color-revenue)', timeAware: true },
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
