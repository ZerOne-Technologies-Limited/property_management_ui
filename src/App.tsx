import { createRouter, RouterProvider } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { useRouterContextState } from "./lib/use-router-context-state"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const router = createRouter({
  routeTree: routeTree,
  defaultPendingMs: 0,
  context: {
    role: "",
    userState: {
      token: "",
      expiry: new Date(),
      role: ""
    },
    login: () => { },
    logout: () => { },
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

const queryClient = new QueryClient()

function App() {
  const routeRouterContext = useRouterContextState()
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} context={routeRouterContext} />
    </QueryClientProvider>
  )
}

export default App
