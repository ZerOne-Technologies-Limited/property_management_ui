import { createFileRoute } from '@tanstack/react-router'
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { HierarchyGrid } from '../components/dashboard/HierarchyGrid';
import { DrawerManager } from '../components/layout/DrawerManager';

export const Route = createFileRoute('/')({
  component: Dashboard,
  beforeLoad: ({ context }) => {
    // Simple mock auth guard
    if (!context.isAuthenticated && !localStorage.getItem('bhd-storage')) {
      // In real app we check store or token
      // throw redirect({ to: '/login' })
    }
  }
})

function Dashboard() {
  return (
    <DashboardLayout>
      <HierarchyGrid />
      <DrawerManager />
    </DashboardLayout>
  )
}

