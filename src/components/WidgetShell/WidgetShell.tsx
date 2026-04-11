import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripHorizontal, X } from 'lucide-react'
import { SIZE_TO_COLSPAN, COLOR_SCALE_RAW, type WidgetConfig } from '../../lib/widget-types'
import styles from './WidgetShell.module.css'

interface WidgetShellProps {
  widget: WidgetConfig
  isEditMode: boolean
  onRemove: () => void
  onSelect: () => void
  children: React.ReactNode
}

export function WidgetShell({ widget, isEditMode, onRemove, onSelect, children }: WidgetShellProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditMode })

  const style: React.CSSProperties = {
    gridColumn: `span ${SIZE_TO_COLSPAN[widget.size]}`,
    '--glow-color': COLOR_SCALE_RAW[widget.color] ?? undefined,
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties

  return (
    <div
      ref={setNodeRef}
      className={styles.shell}
      style={style}
      data-edit={isEditMode || undefined}
      data-dragging={isDragging || undefined}
      onClick={isEditMode ? onSelect : undefined}
      {...attributes}
    >
      {isEditMode && (
        <>
          <div className={styles.dragHandle} {...listeners}>
            <GripHorizontal size={14} />
          </div>
          <button
            className={styles.removeBtn}
            onClick={(e) => { e.stopPropagation(); onRemove() }}
          >
            <X size={14} />
          </button>
        </>
      )}
      <div className={styles.body}>
        {children}
      </div>
    </div>
  )
}
