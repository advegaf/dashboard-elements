import { RevenueChart } from './RevenueChart'
import { SignupsChart } from './SignupsChart'
import { PlanDonutChart } from './PlanDonutChart'
import type {
  PlanSlice,
  RevenuePoint,
  SignupPoint,
} from '@/hooks/useOverviewData'

interface ChartRowProps {
  revenueSeries: RevenuePoint[]
  signupSeries: SignupPoint[]
  revenueByPlan: PlanSlice[]
}

export function ChartRow({ revenueSeries, signupSeries, revenueByPlan }: ChartRowProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <RevenueChart data={revenueSeries} />
      <SignupsChart data={signupSeries} />
      <PlanDonutChart data={revenueByPlan} />
    </div>
  )
}
