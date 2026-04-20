import { Outlet, createRootRouteWithContext, useLocation } from '@tanstack/react-router'
import { Sidebar } from '../components/layout/Sidebar'
import { TopBar } from '../components/layout/TopBar'
import { useAppStore } from '../lib/store'

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
  const { isSidebarOpen, toggleSidebar } = useAppStore()

  if (isLoginPage) {
    return <Outlet />
  }

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
      <TopBar onToggleSidebar={toggleSidebar} />

      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* Mobile backdrop — closes sidebar on tap */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 md:hidden"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}

        <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

        {/* Main content — no wrapper padding so Dashboard fills height correctly */}
        <main className="flex-1 min-h-0 overflow-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
