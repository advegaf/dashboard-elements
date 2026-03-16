import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDownIcon, GripHorizontalIcon } from 'lucide-animated'
import type { NavItem, NavSection, SidebarProps, AnimatedIconHandle } from './sidebarConfig'
import { NAV_SECTIONS, FOOTER_ITEMS, USER_PROFILE } from './sidebarConfig'
import { LedgrLogo } from './LedgrLogo'
import styles from './Sidebar.module.css'

function NavButton({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon
  const iconRef = useRef<AnimatedIconHandle>(null)
  return (
    <button
      className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
    >
      {Icon && <Icon ref={iconRef} size={18} />}
      <span className={styles.navItemLabel}>{item.label}</span>
      {item.badge != null && <span className={styles.badge}>{item.badge}</span>}
    </button>
  )
}

function SidebarSection({
  section,
  activeItem,
  collapsed,
  onToggle,
}: {
  section: NavSection
  activeItem: string
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span>{section.title}</span>
        {section.collapsible && (
          <button className={styles.collapseToggle} onClick={onToggle}>
            <motion.div
              animate={{ rotate: collapsed ? -90 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{ display: 'flex' }}
            >
              <ChevronDownIcon size={14} />
            </motion.div>
          </button>
        )}
      </div>
      {section.collapsible ? (
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              style={{ overflow: 'hidden' }}
            >
              {section.items.map((item) => (
                <NavButton
                  key={item.id}
                  item={item}
                  isActive={activeItem === item.id}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        section.items.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeItem === item.id}
          />
        ))
      )}
    </div>
  )
}

export function Sidebar({ activeItem }: SidebarProps) {
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set()
  )

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <nav className={styles.sidebar} aria-label="Main navigation">
      <LedgrLogo className={styles.brandLogo} />

      <div className={styles.navArea}>
        {NAV_SECTIONS.map((section) => (
          <SidebarSection
            key={section.id}
            section={section}
            activeItem={activeItem}
            collapsed={collapsedSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
          />
        ))}
      </div>

      <div className={styles.divider} />

      <div className={styles.footer}>
        {FOOTER_ITEMS.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeItem === item.id}
          />
        ))}

        <div className={styles.userProfile}>
          <div className={styles.userInitials}>
            {USER_PROFILE.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{USER_PROFILE.name}</div>
            <div className={styles.userEmail}>{USER_PROFILE.email}</div>
          </div>
          <button className={styles.overflowBtn} aria-label="More options">
            <GripHorizontalIcon size={16} />
          </button>
        </div>
      </div>
    </nav>
  )
}
