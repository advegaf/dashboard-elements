import { useState, useCallback } from 'react'
import { DndContext, closestCenter, closestCorners, useDroppable, type DragEndEvent, type DragOverEvent } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { useToast } from '../../hooks/useToast'
import { DashboardHeader } from '../../components/DashboardHeader/DashboardHeader'
import { WidgetShell } from '../../components/WidgetShell/WidgetShell'
import { WidgetBodyLayout } from '../../components/WidgetShell/WidgetBodyLayout'
import { WidgetSettingsDrawer } from '../../components/WidgetSettingsDrawer/WidgetSettingsDrawer'
import { WidgetPickerDrawer } from '../../components/WidgetPickerDrawer/WidgetPickerDrawer'
import { MrrChart } from '../../components/MrrCard/MrrChart'
import { RetentionChart } from '../../components/RetentionCard/RetentionChart'
import { SignupsChart } from '../../components/SignupsCard/SignupsChart'
import { CheckinsHeatmap } from '../../components/CheckinsCard/CheckinsHeatmap'
import { SalesBreakdownDonut } from '../../components/SalesBreakdownDonut/SalesBreakdownDonut'
import { FailedPaymentsBars } from '../../components/FailedPaymentsBars/FailedPaymentsBars'
import { RecentCheckInsCard } from '../../components/RecentCheckInsCard/RecentCheckInsCard'
import { Skeleton } from '../../components/ui/Skeleton/Skeleton'
import { useDashboardData, type DashboardDataResult } from '../../hooks/useDashboardData'
import { useDashboardWidgetConfig } from '../../hooks/useDashboardWidgetConfig'

import { colors } from '../../styles/colors'
import { COLOR_SCALE_RAW, SIZE_TO_COLSPAN, WIDGET_REGISTRY, resolveSliceColors, type WidgetConfig, type ContentRow } from '../../lib/widget-types'
import type { StatsTimeRange } from '../../components/TimeRangePicker/TimeRangePicker'
import styles from './DashboardPage.module.css'

// Severity: red → gold → orange → gray
const REASON_COLORS = [colors.danger, colors.warning, colors.urgency, colors.neutral]

/* ── KPI Widget Body ── */

function KpiWidgetBody({ widget, data }: { widget: WidgetConfig; data: DashboardDataResult }) {
  const { kpis, loading, dateRange } = data

  let label = ''
  let value = '-'
  let trend: { value: number; direction: 'up' | 'down' } | undefined
  let invertTrend = false

  switch (widget.type) {
    case 'revenue-kpi':
      label = 'Monthly Revenue'
      value = kpis?.revenue.value ?? '-'
      trend = kpis?.revenue.trend
      break
    case 'retention-kpi':
      label = 'Retention Rate'
      value = kpis?.retention.value ?? '-'
      trend = kpis?.retention.trend
      break
    case 'churn-risk-kpi':
      label = 'Churn Risk'
      value = kpis?.churnRisk ? String(kpis.churnRisk.total) : '-'
      trend = kpis?.churnRisk?.trend
      invertTrend = true
      break
    case 'signups-kpi':
      label = 'New Signups'
      value = kpis?.signups.value ?? '-'
      trend = kpis?.signups.trend
      break
  }

  const accentColor = COLOR_SCALE_RAW[widget.color]
  const chartVariant = widget.chartVariant as 'bar' | 'line' | 'area'

  const trendEl = trend && (
    <div
      className={styles.kpiTrend}
      data-direction={invertTrend ? (trend.direction === 'up' ? 'down' : 'up') : trend.direction}
    >
      <span className={styles.kpiArrow}>{trend.direction === 'up' ? '\u25B2' : '\u25BC'}</span>
      {trend.direction === 'up' ? '+' : ''}{trend.value}%
    </div>
  )

  if (loading) {
    return (
      <div className={styles.kpiBody}>
        <span className={styles.kpiLabel}>{label}</span>
        <Skeleton width={100} height={36} />
        <Skeleton width={60} height={14} />
      </div>
    )
  }

  // M-size: horizontal layout with mini chart
  if (widget.size === 'M') {
    let miniChart: React.ReactNode = null
    if (widget.type === 'revenue-kpi' && data.revenueSeries.length > 0) {
      miniChart = <MrrChart data={data.revenueSeries} accentColor={accentColor} variant={chartVariant} compact />
    } else if (widget.type === 'retention-kpi' && data.retentionSeries.length > 0) {
      miniChart = <RetentionChart data={data.retentionSeries} accentColor={accentColor} variant={chartVariant} compact />
    } else if (widget.type === 'signups-kpi' && data.signupSeries.length > 0) {
      miniChart = <SignupsChart data={data.signupSeries} accentColor={accentColor} variant={chartVariant} compact />
    }

    return (
      <div className={styles.kpiBodyM}>
        <div className={styles.kpiBodyMLeft}>
          <span className={styles.kpiLabel}>{label}</span>
          <div className={styles.kpiValue}>{value}</div>
          {trendEl}
          <span className={styles.kpiPeriod}>{dateRange}</span>
        </div>
        {miniChart && (
          <div className={styles.kpiBodyMRight}>
            {miniChart}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.kpiBody}>
      <span className={styles.kpiLabel}>{label}</span>
      <div className={styles.kpiValue}>{value}</div>
      {trendEl}
      <span className={styles.kpiPeriod}>{dateRange}</span>
    </div>
  )
}

/* ── Content Widget Body ── */

function ContentWidgetBody({ widget, data }: { widget: WidgetConfig; data: DashboardDataResult }) {
  const accentColor = COLOR_SCALE_RAW[widget.color]
  const { kpis, loading, errors, dateRange } = data
  const variant = widget.chartVariant as 'bar' | 'line' | 'area'

  switch (widget.type) {
    case 'revenue-chart': {
      const trend = !loading && kpis?.revenue.trend
        ? { label: `${kpis.revenue.trend.direction === 'up' ? '+' : ''}${kpis.revenue.trend.value}%`, direction: kpis.revenue.trend.direction }
        : undefined
      return (
        <WidgetBodyLayout
          title="Revenue Over Time"
          subtitle={!loading && kpis?.revenue.value ? `${kpis.revenue.value} \u2022 ${dateRange}` : dateRange}
          trend={trend}
          loading={loading}
        >
          <MrrChart data={data.revenueSeries} accentColor={accentColor} variant={variant} />
        </WidgetBodyLayout>
      )
    }

    case 'retention-chart':
      return (
        <WidgetBodyLayout title="Retention Over Time" subtitle={dateRange} loading={loading}>
          <RetentionChart data={data.retentionSeries} accentColor={accentColor} variant={variant} />
        </WidgetBodyLayout>
      )

    case 'signups-chart':
      return (
        <WidgetBodyLayout title="Signups Over Time" subtitle={dateRange} loading={loading}>
          <SignupsChart data={data.signupSeries} accentColor={accentColor} variant={variant} />
        </WidgetBodyLayout>
      )

    case 'sales-breakdown': {
      const slices = data.revenueSlices
      const totalCents = slices.reduce((sum, s) => sum + s.value, 0)
      const total = `$${(totalCents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
      const resolvedColors = resolveSliceColors(widget, WIDGET_REGISTRY[widget.type])

      return (
        <WidgetBodyLayout
          title="Revenue Breakdown"
          subtitle={dateRange}
          loading={loading}
          error={errors.payments ? 'Failed to load revenue data.' : undefined}
        >
          {slices.length === 0 ? (
            <p style={{ color: 'var(--color-text-subtle)', fontSize: 13 }}>No revenue data yet.</p>
          ) : (
            <SalesBreakdownDonut
              slices={slices}
              colors={resolvedColors}
              total={total}
            />
          )}
        </WidgetBodyLayout>
      )
    }

    case 'checkins-heatmap':
      return (
        <WidgetBodyLayout
          title="Check-ins Heatmap"
          subtitle={dateRange}
          loading={loading}
          error={errors.checkIns ? 'Failed to load check-in data.' : undefined}
        >
          <CheckinsHeatmap data={data.heatmapData} accentColor={accentColor} />
        </WidgetBodyLayout>
      )

    case 'failed-payments': {
      const fp = data.failedPayments
      // Invert trend: up (more failures) = bad, down (fewer) = good
      const fpTrend = fp.trend
        ? {
            label: `${fp.trend.direction === 'up' ? '+' : '-'}${fp.trend.value}%`,
            direction: (fp.trend.direction === 'up' ? 'down' : 'up') as 'up' | 'down',
          }
        : undefined

      return (
        <WidgetBodyLayout
          title="Failed Payments"
          subtitle={dateRange}
          trend={fpTrend}
          loading={loading}
          error={errors.payments ? 'Failed to load payment data.' : undefined}
        >
          {fp.totalCount === 0 ? (
            <p style={{ color: 'var(--color-text-subtle)', fontSize: 13 }}>No failed payments.</p>
          ) : (
            <FailedPaymentsBars
              totalAmount={fp.totalAmount}
              totalCount={fp.totalCount}
              trend={fp.trend}
              rows={fp.rows}
              colors={REASON_COLORS}
            />
          )}
        </WidgetBodyLayout>
      )
    }

    case 'recent-checkins':
      return (
        <RecentCheckInsCard
          checkIns={data.recentCheckIns}
          maxRows={8}
          loading={loading}
          error={errors.recent}
        />
      )

    default:
      return null
  }
}

/* ── Droppable Row Wrapper ── */

function DroppableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div ref={setNodeRef} data-droppable-row={id} data-over={isOver || undefined}>
      {children}
    </div>
  )
}

/* ── Add Widget Button ── */

function AddWidgetButton({ onClick }: { onClick: () => void }) {
  return (
    <button className={styles.addWidget} onClick={onClick}>
      <Plus size={20} />
      <span>Add Widget</span>
    </button>
  )
}

/* ── Helpers ── */

function getRowColSpan(row: ContentRow): number {
  return row.widgets.reduce((sum, w) => sum + SIZE_TO_COLSPAN[w.size], 0)
}

function findWidgetRow(contentRows: ContentRow[], widgetId: string): ContentRow | undefined {
  return contentRows.find(r => r.widgets.some(w => w.id === widgetId))
}

/* ── Dashboard Page ── */

export function DashboardPage() {
  const [timeRange, setTimeRange] = useState<StatsTimeRange>('30d')
  const dashData = useDashboardData(timeRange)
  const { addToast } = useToast()
  const {
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
  } = useDashboardWidgetConfig(addToast)

  /* ── KPI drag ── */

  function handleKpiDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = config.kpiRow.findIndex(w => w.id === active.id)
    const newIndex = config.kpiRow.findIndex(w => w.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) reorderKpiRow(oldIndex, newIndex)
  }

  /* ── Content cross-row drag ── */

  const handleContentDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const sourceRow = findWidgetRow(config.contentRows, activeId)
    if (!sourceRow) return

    // Determine target row: either the row containing the over widget, or the droppable row itself
    let targetRow = findWidgetRow(config.contentRows, overId)
    if (!targetRow) {
      targetRow = config.contentRows.find(r => r.id === overId)
    }
    if (!targetRow || sourceRow.id === targetRow.id) return

    // Find target index
    const overWidgetIndex = targetRow.widgets.findIndex(w => w.id === overId)
    const targetIndex = overWidgetIndex !== -1 ? overWidgetIndex : targetRow.widgets.length

    moveWidget(activeId, sourceRow.id, targetRow.id, targetIndex)
  }, [config.contentRows, moveWidget])

  const handleContentDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeRow = findWidgetRow(config.contentRows, activeId)
    if (!activeRow) return

    const overRow = findWidgetRow(config.contentRows, overId)

    if (overRow && activeRow.id === overRow.id) {
      // Same row reorder
      const oldIndex = activeRow.widgets.findIndex(w => w.id === activeId)
      const newIndex = activeRow.widgets.findIndex(w => w.id === overId)
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderContentRow(activeRow.id, oldIndex, newIndex)
      }
    }
    // Cross-row moves already handled in onDragOver
  }, [config.contentRows, reorderContentRow])

  const kpiColSpan = config.kpiRow.reduce((s, w) => s + SIZE_TO_COLSPAN[w.size], 0)

  return (
    <div className={styles.dashboard}>
      <DashboardHeader
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        isEditMode={isEditMode}
        onToggleEditMode={toggleEditMode}
        onResetLayout={resetToDefault}
      />

      {/* KPI Row */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleKpiDragEnd}>
        <SortableContext items={config.kpiRow.map(w => w.id)} strategy={horizontalListSortingStrategy}>
          <div className={styles.widgetGrid}>
            {config.kpiRow.map(widget => (
              <WidgetShell
                key={widget.id}
                widget={widget}
                isEditMode={isEditMode}
                onRemove={() => removeWidget(widget.id)}
                onSelect={() => selectWidget(widget.id)}
              >
                <KpiWidgetBody widget={widget} data={dashData} />
              </WidgetShell>
            ))}
            {isEditMode && kpiColSpan < 4 && (
              <AddWidgetButton onClick={() => openAddDrawer('kpi')} />
            )}
          </div>
        </SortableContext>
      </DndContext>

      {/* Content Rows — unified DndContext for cross-row drag */}
      <DndContext
        collisionDetection={closestCorners}
        onDragOver={handleContentDragOver}
        onDragEnd={handleContentDragEnd}
      >
        {config.contentRows.map(row => (
          <DroppableRow key={row.id} id={row.id}>
            <SortableContext
              id={row.id}
              items={row.widgets.map(w => w.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className={styles.widgetGrid}>
                {row.widgets.map(widget => (
                  <WidgetShell
                    key={widget.id}
                    widget={widget}
                    isEditMode={isEditMode}
                    onRemove={() => removeWidget(widget.id)}
                    onSelect={() => selectWidget(widget.id)}
                  >
                    <ContentWidgetBody widget={widget} data={dashData} />
                  </WidgetShell>
                ))}
                {isEditMode && getRowColSpan(row) < 4 && (
                  <AddWidgetButton onClick={() => openAddDrawer(row.id)} />
                )}
              </div>
            </SortableContext>
          </DroppableRow>
        ))}
      </DndContext>

      {/* Add Row button */}
      {isEditMode && config.contentRows.length < 3 && (
        <button className={styles.addRow} onClick={addRow}>
          <Plus size={16} />
          Add Row
        </button>
      )}

      {/* Settings Drawer */}
      {selectedWidget && (
        <WidgetSettingsDrawer
          widget={selectedWidget}
          onUpdate={(updates) => updateWidget(selectedWidget.id, updates)}
          onClose={() => selectWidget(null)}
        />
      )}

      {/* Picker Drawer */}
      {addDrawerZone && (
        <WidgetPickerDrawer
          zone={addDrawerZone}
          config={config}
          onAdd={addWidget}
          onClose={closeAddDrawer}
        />
      )}
    </div>
  )
}
