import { X } from 'lucide-react'
import { COLOR_SCALE_RAW, WIDGET_REGISTRY, type WidgetConfig, type WidgetSize } from '../../lib/widget-types'
import styles from './WidgetSettingsDrawer.module.css'

interface WidgetSettingsDrawerProps {
  widget: WidgetConfig
  onUpdate: (updates: Partial<WidgetConfig>) => void
  onClose: () => void
}

const SIZES: WidgetSize[] = ['S', 'M', 'L']
const SIZE_LABELS: Record<WidgetSize, string> = { S: 'Small', M: 'Medium', L: 'Large' }
const VARIANTS = ['bar', 'line', 'area'] as const

export function WidgetSettingsDrawer({ widget, onUpdate, onClose }: WidgetSettingsDrawerProps) {
  const meta = WIDGET_REGISTRY[widget.type]
  const isChart = widget.type.endsWith('-chart')

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.drawer}>
        <div className={styles.header}>
          <span className={styles.title}>{meta?.label ?? 'Widget'} Settings</span>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Size */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Size</span>
            <div className={styles.sizeRow}>
              {SIZES.map(s => (
                <button
                  key={s}
                  className={styles.sizeBtn}
                  data-active={widget.size === s || undefined}
                  onClick={() => onUpdate({ size: s })}
                >
                  {SIZE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Color</span>
            <div className={styles.colorGrid}>
              {Object.entries(COLOR_SCALE_RAW).map(([key, value]) => (
                <button
                  key={key}
                  className={styles.colorSwatch}
                  style={{ backgroundColor: value }}
                  data-active={widget.color === key || undefined}
                  onClick={() => onUpdate({ color: key })}
                  title={key}
                />
              ))}
            </div>
          </div>

          {/* Chart variant */}
          {isChart && (
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Chart Style</span>
              <div className={styles.variantRow}>
                {VARIANTS.map(v => (
                  <button
                    key={v}
                    className={styles.variantBtn}
                    data-active={widget.chartVariant === v || undefined}
                    onClick={() => onUpdate({ chartVariant: v })}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
