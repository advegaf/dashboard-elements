import { X } from 'lucide-react'
import { WIDGET_REGISTRY, COLOR_SCALE_RAW, type WidgetType, type DashboardWidgetConfig } from '../../lib/widget-types'
import styles from './WidgetPickerDrawer.module.css'

interface WidgetPickerDrawerProps {
  zone: string
  config: DashboardWidgetConfig
  onAdd: (widgetType: string, zone: string) => void
  onClose: () => void
}

export function WidgetPickerDrawer({ zone, config, onAdd, onClose }: WidgetPickerDrawerProps) {
  const isKpiZone = zone === 'kpi'
  const category = isKpiZone ? 'kpi' : 'content'

  // Collect all widget types already in use
  const usedTypes = new Set<string>()
  config.kpiRow.forEach(w => usedTypes.add(w.type))
  config.contentRows.forEach(r => r.widgets.forEach(w => usedTypes.add(w.type)))

  const options = (Object.entries(WIDGET_REGISTRY) as [WidgetType, typeof WIDGET_REGISTRY[WidgetType]][])
    .filter(([, meta]) => meta.category === category)

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.drawer}>
        <div className={styles.header}>
          <span className={styles.title}>Add Widget</span>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.body}>
          {options.map(([type, meta]) => {
            const disabled = usedTypes.has(type)
            return (
              <button
                key={type}
                className={styles.widgetOption}
                data-disabled={disabled || undefined}
                onClick={() => {
                  if (!disabled) {
                    onAdd(type, zone)
                  }
                }}
              >
                <span
                  className={styles.colorDot}
                  style={{ backgroundColor: COLOR_SCALE_RAW[meta.defaultColor] }}
                />
                {meta.label}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
