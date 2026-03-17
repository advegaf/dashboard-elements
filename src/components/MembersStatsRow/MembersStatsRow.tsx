import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X, Plus } from 'lucide-react'
import { useMembersState, type StatsTimeRange } from '../../context/MembersContext'
import type { StatCardConfig, StatCardKey } from '../../hooks/useStatsCardsConfig'
import styles from './MembersStatsRow.module.css'

const TIME_RANGE_SUBTITLES: Record<StatsTimeRange, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  'all': 'All time',
}

interface Stats {
  total: number
  active: number
  frozen: number
  cancelled: number
  newInPeriod: number
  atRisk: number
  pastDue: number
  avgVisitsPerWeek: number
  revenueInPeriod: number
}

function formatValue(key: StatCardKey, value: number): string {
  switch (key) {
    case 'revenueInPeriod':
      return `$${value.toLocaleString()}`
    case 'avgVisitsPerWeek':
      return value.toFixed(1)
    default:
      return String(value)
  }
}

interface SortableStatCardProps {
  card: StatCardConfig
  value: string
  subtitle: string
  isEditMode: boolean
  onRemove: () => void
}

function SortableStatCard({ card, value, subtitle, isEditMode, onRemove }: SortableStatCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.key })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    '--stat-color': card.color,
  } as React.CSSProperties

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.card} ${isEditMode && !isDragging ? styles.jiggle : ''} ${isDragging ? styles.dragging : ''}`}
      {...attributes}
    >
      <div className={styles.glowClip} />
      {isEditMode && (
        <>
          <button className={styles.dragHandle} {...listeners}>
            <GripVertical size={14} />
          </button>
          <button className={styles.removeBtn} onClick={onRemove}>
            <X size={12} />
          </button>
        </>
      )}
      <div className={styles.titleRow}>
        <h3 className={styles.title}>{card.label}</h3>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      <p className={styles.value}>{value}</p>
    </div>
  )
}

interface Props {
  activeCards: StatCardConfig[]
  isEditMode: boolean
  stats: Stats
  onReorder: (from: number, to: number) => void
  onRemove: (key: StatCardKey) => void
  onOpenPicker: () => void
}

export function MembersStatsRow({ activeCards, isEditMode, stats, onReorder, onRemove, onOpenPicker }: Props) {
  const state = useMembersState()
  const timeLabel = TIME_RANGE_SUBTITLES[state.statsTimeRange]

  if (activeCards.length === 0 && !isEditMode) return null

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = activeCards.findIndex(c => c.key === active.id)
    const newIndex = activeCards.findIndex(c => c.key === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex)
    }
  }

  const colCount = activeCards.length + (isEditMode && activeCards.length < 5 ? 1 : 0)

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={activeCards.map(c => c.key)} strategy={horizontalListSortingStrategy}>
        <div
          className={styles.row}
          style={{ gridTemplateColumns: `repeat(${colCount || 1}, 1fr)` }}
        >
          {activeCards.map(card => (
            <SortableStatCard
              key={card.key}
              card={card}
              value={formatValue(card.key, stats[card.key])}
              subtitle={card.timeAware ? timeLabel : 'Current'}
              isEditMode={isEditMode}
              onRemove={() => onRemove(card.key)}
            />
          ))}
          {isEditMode && activeCards.length < 5 && (
            <button className={styles.addCard} onClick={onOpenPicker}>
              <Plus size={20} />
              <span>Add Card</span>
            </button>
          )}
        </div>
      </SortableContext>
    </DndContext>
  )
}
