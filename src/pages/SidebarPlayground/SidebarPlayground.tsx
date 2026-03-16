import { Sidebar } from '../../components/Sidebar/Sidebar'
import styles from './SidebarPlayground.module.css'

export function SidebarPlayground() {
  return (
    <div className={styles.page}>
      <Sidebar activeItem="members" />
    </div>
  )
}
