import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import z from 'zod'
import type { loginModel } from '../types/auth'
import type { PropertyType } from '../types'
import { loginUser, registerWithProperty } from '../api/axios'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { AlertCircle, Loader2, Building2, Eye, EyeOff } from 'lucide-react'
import { useAppStore } from '../lib/store'
import { cn } from '../lib/utils'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  validateSearch: z.object({
    redirectTo: z.string().default('/'),
  }),
  beforeLoad: async () => {},
})

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'BoardingHouse', label: 'Boarding House' },
  { value: 'Lodge', label: 'Lodge' },
  { value: 'Hotel', label: 'Hotel' },
  { value: 'Hostel', label: 'Hostel' },
]

function RouteComponent() {
  const { login } = useAppStore()
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const router = useRouter()

  const [tab, setTab] = useState<'signin' | 'register'>('signin')

  // ── Sign-in state ──────────────────────────────────────────────────────────
  const [credentials, setCredentials] = useState<loginModel>({ PhoneNumber: '', Password: '' })
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [showLoginPw, setShowLoginPw] = useState(false)

  // ── Register state ─────────────────────────────────────────────────────────
  const [reg, setReg] = useState({
    FirstName: '',
    LastName: '',
    PhoneNumber: '',
    Password: '',
    ConfirmPassword: '',
    PropertyName: '',
    PropertyType: 'BoardingHouse' as PropertyType,
  })
  const [regError, setRegError] = useState<string | null>(null)
  const [regLoading, setRegLoading] = useState(false)
  const [showRegPw, setShowRegPw] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setLoginLoading(true)
    try {
      const response = await loginUser(credentials)
      login(response, 'Manager')
      await router.invalidate()
      navigate({ to: search.redirectTo })
    } catch {
      setLoginError('Invalid phone number or password.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError(null)
    if (reg.Password !== reg.ConfirmPassword) {
      setRegError('Passwords do not match.')
      return
    }
    if (reg.Password.length < 8) {
      setRegError('Password must be at least 8 characters.')
      return
    }
    setRegLoading(true)
    try {
      const response = await registerWithProperty({
        FirstName: reg.FirstName,
        LastName: reg.LastName,
        PhoneNumber: reg.PhoneNumber,
        Password: reg.Password,
        PropertyName: reg.PropertyName,
        PropertyType: reg.PropertyType,
      })
      login(response, 'Manager')
      await router.invalidate()
      navigate({ to: '/' })
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.Message ||
        err?.response?.data?.errors?.[0]?.message ||
        'Registration failed. The phone number may already be registered.'
      setRegError(msg)
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Brand mark */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-stripe-purple text-white shadow-md">
            <Building2 className="size-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stripe-text-primary">property.zapps</h1>
          <p className="mt-1 text-sm text-stripe-text-secondary">Manage your properties efficiently</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-stripe-border bg-white shadow-sm">

          {/* Tab switcher */}
          <div className="flex border-b border-stripe-border">
            {([
              { id: 'signin', label: 'Sign In' },
              { id: 'register', label: 'Get Started' },
            ] as const).map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex-1 py-3.5 text-sm font-medium transition-colors first:rounded-tl-xl last:rounded-tr-xl',
                  tab === t.id
                    ? 'border-b-2 border-stripe-purple bg-stripe-purple/5 text-stripe-purple'
                    : 'text-stripe-text-secondary hover:bg-gray-50 hover:text-stripe-text-primary'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="px-6 py-6">

            {/* ── Sign In ── */}
            {tab === 'signin' && (
              <form onSubmit={handleLogin} className="space-y-4">
                {loginError && (
                  <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-600">
                    <AlertCircle className="size-4 shrink-0" />
                    {loginError}
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="text"
                    placeholder="0770012345"
                    value={credentials.PhoneNumber}
                    onChange={e => setCredentials(p => ({ ...p, PhoneNumber: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showLoginPw ? 'text' : 'password'}
                      value={credentials.Password}
                      onChange={e => setCredentials(p => ({ ...p, Password: e.target.value }))}
                      required
                      className="pr-9"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowLoginPw(v => !v)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stripe-text-secondary hover:text-stripe-text-primary"
                    >
                      {showLoginPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {loginLoading ? 'Signing in…' : 'Sign In'}
                </Button>
              </form>
            )}

            {/* ── Get Started (Register) ── */}
            {tab === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                {regError && (
                  <div className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2.5 text-sm text-red-600">
                    <AlertCircle className="size-4 shrink-0" />
                    {regError}
                  </div>
                )}

                {/* Account section */}
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary">
                    Your Account
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={reg.FirstName}
                        onChange={e => setReg(p => ({ ...p, FirstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={reg.LastName}
                        onChange={e => setReg(p => ({ ...p, LastName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <Label htmlFor="regPhone">Phone Number</Label>
                    <Input
                      id="regPhone"
                      type="text"
                      placeholder="0770012345"
                      value={reg.PhoneNumber}
                      onChange={e => setReg(p => ({ ...p, PhoneNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="regPw">Password</Label>
                      <div className="relative">
                        <Input
                          id="regPw"
                          type={showRegPw ? 'text' : 'password'}
                          placeholder="Min 8 chars"
                          value={reg.Password}
                          onChange={e => setReg(p => ({ ...p, Password: e.target.value }))}
                          required
                          className="pr-9"
                        />
                        <button
                          type="button"
                          tabIndex={-1}
                          onClick={() => setShowRegPw(v => !v)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stripe-text-secondary hover:text-stripe-text-primary"
                        >
                          {showRegPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPw">Confirm Password</Label>
                      <Input
                        id="confirmPw"
                        type={showRegPw ? 'text' : 'password'}
                        placeholder="Repeat"
                        value={reg.ConfirmPassword}
                        onChange={e => setReg(p => ({ ...p, ConfirmPassword: e.target.value }))}
                        required
                        className={reg.ConfirmPassword && reg.Password !== reg.ConfirmPassword ? 'border-red-400' : ''}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-stripe-border" />

                {/* Property section */}
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary">
                    Your First Property
                  </p>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="propName">Property Name</Label>
                      <Input
                        id="propName"
                        placeholder="e.g. Sunrise Hostel"
                        value={reg.PropertyName}
                        onChange={e => setReg(p => ({ ...p, PropertyName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="propType">Property Type</Label>
                      <select
                        id="propType"
                        value={reg.PropertyType}
                        onChange={e => setReg(p => ({ ...p, PropertyType: e.target.value as PropertyType }))}
                        className="h-9 w-full rounded-md border border-stripe-border bg-white px-3 text-sm text-stripe-text-primary focus:outline-none focus:ring-2 focus:ring-stripe-purple/40"
                      >
                        {PROPERTY_TYPES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={regLoading}>
                  {regLoading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {regLoading ? 'Creating account…' : 'Create Account & Property'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
