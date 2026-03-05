import { SalesCard } from './components/SalesCard/SalesCard'
import { SignupsCard } from './components/SignupsCard/SignupsCard'
import { CheckinsCard } from './components/CheckinsCard/CheckinsCard'
import { Agentation } from 'agentation'
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.page}>
      <SalesCard />
      <SignupsCard />
      <CheckinsCard />
      {import.meta.env.DEV && <Agentation />}
    </div>
  )
}

export default App
