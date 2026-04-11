import { useState, useCallback, useMemo } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import {
  WIDGET_REGISTRY,
  type WidgetConfig,
  type WidgetType,
  type DashboardWidgetConfig,
} from '../lib/widget-types'

const STORAGE_KEY = 'dashboard-widget-config'

let _nextId = 1
function uid() {
  return `w-${Date.now()}-${_nextId++}`
}

const DEFAULT_CONFIG: DashboardWidgetConfig = {
  kpiRow: [
    { id: 'kpi-revenue', type: 'revenue-kpi', size: 'S', color: 'revenue' },
    { id: 'kpi-retention', type: 'retention-kpi', size: 'S', color: 'success' },
    { id: 'kpi-churn', type: 'churn-risk-kpi', size: 'S', color: 'danger' },
    { id: 'kpi-signups', type: 'signups-kpi', size: 'S', color: 'info' },
  ],
  contentRows: [
    {
      id: 'row-1',
      widgets: [
        { id: 'c-revenue', type: 'revenue-chart', size: 'M', color: 'revenue', chartVariant: 'area' },
        { id: 'c-sales', type: 'sales-breakdown', size: 'M', color: 'success' },
      ],
    },
    {
      id: 'row-2',
      widgets: [
        { id: 'c-retention', type: 'retention-chart', size: 'M', color: 'success', chartVariant: 'line' },
        { id: 'c-failed', type: 'failed-payments', size: 'M', color: 'danger' },
      ],
    },
  ],
}

function loadConfig(): DashboardWidgetConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DashboardWidgetConfig
      if (parsed.kpiRow && parsed.contentRows) return parsed
    }
  } catch {}
  return structuredClone(DEFAULT_CONFIG)
}

function saveConfig(config: DashboardWidgetConfig) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function useDashboardWidgetConfig(
  addToast: (title: string, opts?: { description?: string; type?: 'success' | 'warning' | 'error' }) => void,
) {
  const [config, setConfig] = useState<DashboardWidgetConfig>(loadConfig)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null)
  const [addDrawerZone, setAddDrawerZone] = useState<string | null>(null)

  const update = useCallback((fn: (prev: DashboardWidgetConfig) => DashboardWidgetConfig) => {
    setConfig(prev => {
      const next = fn(prev)
      saveConfig(next)
      return next
    })
  }, [])

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev)
    setSelectedWidgetId(null)
    setAddDrawerZone(null)
  }, [])

  const selectWidget = useCallback((id: string | null) => {
    setSelectedWidgetId(id)
  }, [])

  const openAddDrawer = useCallback((zone: string) => {
    setAddDrawerZone(zone)
  }, [])

  const closeAddDrawer = useCallback(() => {
    setAddDrawerZone(null)
  }, [])

  // KPI row reorder
  const reorderKpiRow = useCallback((from: number, to: number) => {
    update(prev => ({
      ...prev,
      kpiRow: arrayMove(prev.kpiRow, from, to),
    }))
  }, [update])

  // Content row reorder (same row)
  const reorderContentRow = useCallback((rowId: string, from: number, to: number) => {
    update(prev => ({
      ...prev,
      contentRows: prev.contentRows.map(row =>
        row.id === rowId
          ? { ...row, widgets: arrayMove(row.widgets, from, to) }
          : row,
      ),
    }))
  }, [update])

  // Move widget across rows
  const moveWidget = useCallback((widgetId: string, sourceRowId: string, targetRowId: string, targetIndex: number) => {
    update(prev => {
      const sourceRow = prev.contentRows.find(r => r.id === sourceRowId)
      const targetRow = prev.contentRows.find(r => r.id === targetRowId)
      if (!sourceRow || !targetRow) return prev

      const widget = sourceRow.widgets.find(w => w.id === widgetId)
      if (!widget) return prev

      return {
        ...prev,
        contentRows: prev.contentRows.map(row => {
          if (row.id === sourceRowId) {
            return { ...row, widgets: row.widgets.filter(w => w.id !== widgetId) }
          }
          if (row.id === targetRowId) {
            const next = [...row.widgets]
            next.splice(targetIndex, 0, widget)
            return { ...row, widgets: next }
          }
          return row
        }),
      }
    })
  }, [update])

  // Remove widget
  const removeWidget = useCallback((widgetId: string) => {
    update(prev => {
      // Check KPI row
      if (prev.kpiRow.some(w => w.id === widgetId)) {
        return { ...prev, kpiRow: prev.kpiRow.filter(w => w.id !== widgetId) }
      }
      // Check content rows
      return {
        ...prev,
        contentRows: prev.contentRows.map(row => ({
          ...row,
          widgets: row.widgets.filter(w => w.id !== widgetId),
        })),
      }
    })
    if (selectedWidgetId === widgetId) setSelectedWidgetId(null)
  }, [update, selectedWidgetId])

  // Add widget
  const addWidget = useCallback((widgetType: string, zone: string) => {
    const meta = WIDGET_REGISTRY[widgetType as WidgetType]
    if (!meta) return

    const widget: WidgetConfig = {
      id: uid(),
      type: widgetType as WidgetType,
      size: meta.defaultSize,
      color: meta.defaultColor,
      chartVariant: meta.category === 'content' ? 'area' : undefined,
    }

    update(prev => {
      if (zone === 'kpi') {
        return { ...prev, kpiRow: [...prev.kpiRow, widget] }
      }
      return {
        ...prev,
        contentRows: prev.contentRows.map(row =>
          row.id === zone ? { ...row, widgets: [...row.widgets, widget] } : row,
        ),
      }
    })

    setAddDrawerZone(null)
  }, [update])

  // Update widget
  const updateWidget = useCallback((widgetId: string, updates: Partial<WidgetConfig>) => {
    update(prev => {
      const mapWidget = (w: WidgetConfig) =>
        w.id === widgetId ? { ...w, ...updates } : w

      return {
        ...prev,
        kpiRow: prev.kpiRow.map(mapWidget),
        contentRows: prev.contentRows.map(row => ({
          ...row,
          widgets: row.widgets.map(mapWidget),
        })),
      }
    })
  }, [update])

  // Add content row
  const addRow = useCallback(() => {
    update(prev => ({
      ...prev,
      contentRows: [...prev.contentRows, { id: `row-${uid()}`, widgets: [] }],
    }))
  }, [update])

  // Reset to default
  const resetToDefault = useCallback(() => {
    const fresh = structuredClone(DEFAULT_CONFIG)
    setConfig(fresh)
    saveConfig(fresh)
    setSelectedWidgetId(null)
    setAddDrawerZone(null)
    addToast('Layout reset', { description: 'Dashboard restored to default layout.', type: 'success' })
  }, [addToast])

  // Resolve selected widget
  const selectedWidget = useMemo(() => {
    if (!selectedWidgetId) return null
    const kpi = config.kpiRow.find(w => w.id === selectedWidgetId)
    if (kpi) return kpi
    for (const row of config.contentRows) {
      const found = row.widgets.find(w => w.id === selectedWidgetId)
      if (found) return found
    }
    return null
  }, [selectedWidgetId, config])

  return {
    config,
    isEditMode,
    selectedWidget,
    addDrawerZone,
    toggleEditMode,
    reorderKpiRow,
    reorderContentRow,
    moveWidget,
    removeWidget,
    addWidget,
    updateWidget,
    addRow,
    resetToDefault,
    selectWidget,
    openAddDrawer,
    closeAddDrawer,
  }
}
