import { Outlet, createRootRouteWithContext, useLocation } from '@tanstack/react-router'
import { Sidebar } from '../components/layout/Sidebar'
import { TopBar } from '../components/layout/TopBar'

export type userRole = 'manager' | 'client' | "";

export type userState = {
  token: string;
  expiry: Date;
  role: userRole;
}

export type RouterContext = {
  role: userRole;
  userState: userState;
  login: (token: string, expiry: Date, role: userRole) => void;
  logout: () => void;
  isManager: boolean;
  isClient: boolean;
  isAuthenticated: boolean;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  // Login page doesn't get the dashboard layout
  if (isLoginPage) {
    return <Outlet />
  }

  // All other pages get the dashboard layout with sidebar and topbar
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-white">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
