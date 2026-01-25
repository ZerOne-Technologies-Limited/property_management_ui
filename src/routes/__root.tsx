import * as React from 'react'
import { Link, Outlet, createRootRouteWithContext } from '@tanstack/react-router'

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
  return (
    <React.Fragment>
      <nav className="p-4 bg-gray-800 text-white flex gap-4">
        <Link to="/" className="font-bold hover:text-gray-300">Home</Link>
        <Link to="/property" className="hover:text-gray-300">Properties</Link>
        <Link to="/rooms" className="hover:text-gray-300">Rooms</Link>
        <Link to="/students" className="hover:text-gray-300">Students</Link>
        <Link to="/transactions" className="hover:text-gray-300">Transactions</Link>
      </nav>
      <div className="container mx-auto p-4">
        <Outlet />
      </div>
    </React.Fragment>
  )
}
