import { colors } from '../styles/colors'

// === Sizes ===

export type WidgetSize = 'S' | 'M' | 'L'

export const SIZE_TO_COLSPAN: Record<WidgetSize, number> = {
  S: 1,
  M: 2,
  L: 4,
}

// === Color scale ===

export const COLOR_SCALE_RAW: Record<string, string> = {
  success: colors.success,
  danger: colors.danger,
  warning: colors.warning,
  info: colors.info,
  accent: colors.accent,
  urgency: colors.urgency,
  revenue: colors.revenue,
  neutral: colors.neutral,
}

// === Widget types ===

export type WidgetType =
  | 'revenue-kpi'
  | 'retention-kpi'
  | 'churn-risk-kpi'
  | 'signups-kpi'
  | 'revenue-chart'
  | 'retention-chart'
  | 'signups-chart'
  | 'checkins-heatmap'
  | 'sales-breakdown'
  | 'failed-payments'
  | 'recent-checkins'

export interface WidgetConfig {
  id: string
  type: WidgetType
  size: WidgetSize
  color: string
  chartVariant?: string
}

export interface ContentRow {
  id: string
  widgets: WidgetConfig[]
}

export interface DashboardWidgetConfig {
  kpiRow: WidgetConfig[]
  contentRows: ContentRow[]
}

// === Registry ===

export interface WidgetMeta {
  label: string
  category: 'kpi' | 'content'
  defaultSize: WidgetSize
  defaultColor: string
  sliceColors?: string[]
}

export const WIDGET_REGISTRY: Record<WidgetType, WidgetMeta> = {
  'revenue-kpi': { label: 'Revenue', category: 'kpi', defaultSize: 'S', defaultColor: 'revenue' },
  'retention-kpi': { label: 'Retention', category: 'kpi', defaultSize: 'S', defaultColor: 'success' },
  'churn-risk-kpi': { label: 'Churn Risk', category: 'kpi', defaultSize: 'S', defaultColor: 'danger' },
  'signups-kpi': { label: 'New Signups', category: 'kpi', defaultSize: 'S', defaultColor: 'info' },
  'revenue-chart': { label: 'Revenue Chart', category: 'content', defaultSize: 'M', defaultColor: 'revenue' },
  'retention-chart': { label: 'Retention Chart', category: 'content', defaultSize: 'M', defaultColor: 'success' },
  'signups-chart': { label: 'Signups Chart', category: 'content', defaultSize: 'M', defaultColor: 'info' },
  'checkins-heatmap': { label: 'Check-ins Heatmap', category: 'content', defaultSize: 'L', defaultColor: 'accent' },
  'sales-breakdown': {
    label: 'Revenue Breakdown',
    category: 'content',
    defaultSize: 'M',
    defaultColor: 'success',
    sliceColors: [colors.success, colors.info, colors.warning],
  },
  'failed-payments': { label: 'Failed Payments', category: 'content', defaultSize: 'M', defaultColor: 'danger' },
  'recent-checkins': { label: 'Recent Check-ins', category: 'content', defaultSize: 'M', defaultColor: 'accent' },
}

// === Helpers ===

export function resolveSliceColors(widget: WidgetConfig, meta: WidgetMeta): string[] {
  if (meta.sliceColors) return meta.sliceColors
  const base = COLOR_SCALE_RAW[widget.color] ?? colors.neutral
  return [base, colors.info, colors.warning]
}
