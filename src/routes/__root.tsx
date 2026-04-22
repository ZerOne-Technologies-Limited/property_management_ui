import { useEffect } from 'react'
import { Outlet, createRootRouteWithContext, useLocation } from '@tanstack/react-router'
import { Sidebar } from '../components/layout/Sidebar'
import { TopBar } from '../components/layout/TopBar'
import { useAppStore } from '../lib/store'
import { OnboardingTour } from '../components/layout/OnboardingTour'
import { trackUmamiPageview } from '../lib/umami'

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

function UmamiRouteListener() {
  const location = useLocation()
  const searchDep =
    typeof location.search === 'string'
      ? location.search
      : JSON.stringify(location.search ?? {})

  useEffect(() => {
    if (typeof window === 'undefined') return
    trackUmamiPageview(window.location.pathname, window.location.search)
  }, [location.pathname, searchDep])
  return null
}

function RootComponent() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login' || location.pathname === '/demo'
  const { isSidebarOpen, toggleSidebar } = useAppStore()

  return (
    <>
      <UmamiRouteListener />
      {isLoginPage ? (
        <Outlet />
      ) : (
        <div className="flex h-screen w-full flex-col overflow-hidden bg-white">
          <TopBar onToggleSidebar={toggleSidebar} />

          <div className="relative flex flex-1 min-h-0 overflow-hidden">
            {isSidebarOpen && (
              <div
                className="fixed inset-0 z-20 bg-black/40 md:hidden"
                onClick={toggleSidebar}
                aria-hidden="true"
              />
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

            <main className="flex-1 min-h-0 overflow-auto bg-white">
              <Outlet />
            </main>
          </div>

          <OnboardingTour />
        </div>
      )}
    </>
  )
}
