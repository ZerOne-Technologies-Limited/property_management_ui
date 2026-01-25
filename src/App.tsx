import { createRouter, RouterProvider } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { useRouterContextState } from "./lib/use-router-context-state"

const router = createRouter({
  routeTree: routeTree,
  defaultPendingMs: 0,
  context: {
    role: null,
    login: () => {},
    logout: () => {},
    isManager: false,
    isClient: false,
    isAuthenticated: false,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function App() {
  const routeRouterContext = useRouterContextState()
  return <RouterProvider router={router} context={routeRouterContext} />
}

export default App
