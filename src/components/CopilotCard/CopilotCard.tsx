import { Globe } from 'lucide-react'
import { AnimatedPlus } from '../ui/animated-plus'
import { AnimatedMic } from '../ui/animated-mic'
import { AnimatedAudioLines } from '../ui/animated-audio-lines'
import { formatDate } from '../../data/members'
import styles from './CopilotCard.module.css'

export function CopilotCard() {
  const today = formatDate(new Date())

  return (
    <div className={styles.card} style={{ '--glow': '148, 163, 184' } as React.CSSProperties}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>LEDGR Copilot</h2>
        <p className={styles.subtitle}>{today}</p>
      </div>

      <div className={styles.centerContent}>
        <div className={styles.orbContainer}>
          <div className={styles.orbWrapper}>
            <div className={styles.orbGlow} />
            <div className={styles.orb} />
          </div>
        </div>

        <p className={styles.heading}>How can I help you grow your gym today?</p>
      </div>

      <div className={styles.chips}>
        <button className={styles.chip}>Top membership plan?</button>
        <button className={styles.chip}>Why fewer check-ins?</button>
      </div>

      <div className={styles.inputArea}>
        <div className={styles.inputPlaceholder}>Need quick insights....</div>
        <div className={styles.inputToolbar}>
          <div className={styles.toolbarLeft}>
            <button className={styles.iconButton}><AnimatedPlus size={18} /></button>
            <button className={`${styles.iconButton} ${styles.globeButton}`}><Globe size={18} /></button>
            <button className={styles.iconButton}><AnimatedMic size={18} /></button>
          </div>
          <button className={styles.sendButton}><AnimatedAudioLines size={18} /></button>
        </div>
      </div>
    </div>
  )
}
