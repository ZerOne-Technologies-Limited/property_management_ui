import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import z from 'zod'
import type { loginModel } from '../types/auth'
import type { PropertyType } from '../types'
import { loginUser, registerWithProperty } from '../api/axios'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  AlertCircle,
  Loader2,
  Building2,
  Eye,
  EyeOff,
  ShieldCheck,
  BarChart3,
  Users,
  CheckCircle2,
} from 'lucide-react'
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

const FEATURES = [
  { icon: Building2, text: 'Manage multiple properties from one place' },
  { icon: Users, text: 'Track tenants, rooms and payments with ease' },
  { icon: BarChart3, text: 'Get financial insights at a glance' },
  { icon: ShieldCheck, text: 'Role-based access for your team' },
]

function RouteComponent() {
  const { login } = useAppStore()
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const router = useRouter()

  const [tab, setTab] = useState<'signin' | 'register'>('signin')

  // ── Sign-in state ────────────────────────────────────────────────────────────
  const [credentials, setCredentials] = useState<loginModel>({ PhoneNumber: '', Password: '' })
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [showLoginPw, setShowLoginPw] = useState(false)

  // ── Register state ───────────────────────────────────────────────────────────
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

  const pwMismatch = reg.ConfirmPassword.length > 0 && reg.Password !== reg.ConfirmPassword

  return (
    <div className="flex min-h-screen">
      {/* ── Left branding panel (hidden on mobile) ────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between p-10 xl:p-14"
        style={{ background: 'linear-gradient(145deg, #1A2B42 0%, #0F1E32 60%, #0d1928 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#635BFF]">
            <Building2 className="size-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">property.zapps</span>
        </div>

        {/* Hero copy */}
        <div>
          <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
            Property management,<br />
            <span style={{ color: '#635BFF' }}>simplified.</span>
          </h2>
          <p className="mt-4 text-base text-slate-400 leading-relaxed max-w-sm">
            Everything you need to run your boarding houses, hostels, and lodges — in one clean dashboard.
          </p>

          <ul className="mt-10 space-y-4">
            {FEATURES.map(({ text }) => (
              <li key={text} className="flex items-center gap-3">
                <CheckCircle2 className="size-5 shrink-0" style={{ color: '#635BFF' }} />
                <span className="text-sm text-slate-300">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-600">© {new Date().getFullYear()} property.zapps</p>
      </div>

      {/* ── Right form panel ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#F8F9FB] px-4 py-10 sm:px-8">
        {/* Mobile logo */}
        <div className="mb-8 flex flex-col items-center lg:hidden">
          <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-[#635BFF] shadow-md">
            <Building2 className="size-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-stripe-text-primary">property.zapps</h1>
          <p className="mt-1 text-sm text-stripe-text-secondary">Manage your properties efficiently</p>
        </div>

        {/* Card */}
        <div className="w-full max-w-[400px]">

          {/* Form card with built-in tab header */}
          <div className="rounded-lg border border-stripe-border bg-white shadow-sm overflow-hidden">

            {/* Tab strip */}
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
                    'flex-1 py-3.5 text-xs font-semibold transition-colors',
                    tab === t.id
                      ? 'border-b-2 border-[#635BFF] text-[#635BFF] bg-[#635BFF]/5'
                      : 'text-stripe-text-secondary hover:text-stripe-text-primary hover:bg-gray-50'
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="px-5 py-5">

              {/* ── Sign In ── */}
              {tab === 'signin' && (
                <form onSubmit={handleLogin} className="space-y-3">
                  {loginError && (
                    <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-600">
                      <AlertCircle className="size-3.5 shrink-0" />
                      {loginError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label htmlFor="phone" className="text-xs font-medium text-stripe-text-secondary">Phone Number</label>
                    <Input
                      id="phone"
                      type="text"
                      placeholder="0770012345"
                      value={credentials.PhoneNumber}
                      onChange={e => setCredentials(p => ({ ...p, PhoneNumber: e.target.value }))}
                      required
                      autoComplete="tel"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="password" className="text-xs font-medium text-stripe-text-secondary">Password</label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showLoginPw ? 'text' : 'password'}
                        value={credentials.Password}
                        onChange={e => setCredentials(p => ({ ...p, Password: e.target.value }))}
                        required
                        autoComplete="current-password"
                        className="h-8 pr-8 text-sm"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowLoginPw(v => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stripe-text-secondary hover:text-stripe-text-primary"
                      >
                        {showLoginPw ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="mt-1 h-8 w-full bg-[#635BFF] hover:bg-[#5248e8] text-white text-xs font-semibold"
                    disabled={loginLoading}
                  >
                    {loginLoading ? (
                      <><Loader2 className="mr-1.5 size-3.5 animate-spin" />Signing in…</>
                    ) : 'Sign In'}
                  </Button>

                  <p className="pt-1 text-center text-xs text-stripe-text-secondary">
                    No account yet?{' '}
                    <button type="button" onClick={() => setTab('register')} className="font-medium text-[#635BFF] hover:underline">
                      Get started free
                    </button>
                  </p>
                </form>
              )}

              {/* ── Get Started (Register) ── */}
              {tab === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3">
                  {regError && (
                    <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-600">
                      <AlertCircle className="size-3.5 shrink-0" />
                      {regError}
                    </div>
                  )}

                  {/* Account fields */}
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-stripe-text-secondary">Your Account</p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label htmlFor="firstName" className="text-xs font-medium text-stripe-text-secondary">First Name</label>
                      <Input id="firstName" placeholder="John" value={reg.FirstName}
                        onChange={e => setReg(p => ({ ...p, FirstName: e.target.value }))} required className="h-8 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="lastName" className="text-xs font-medium text-stripe-text-secondary">Last Name</label>
                      <Input id="lastName" placeholder="Doe" value={reg.LastName}
                        onChange={e => setReg(p => ({ ...p, LastName: e.target.value }))} required className="h-8 text-sm" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="regPhone" className="text-xs font-medium text-stripe-text-secondary">Phone Number</label>
                    <Input id="regPhone" type="text" placeholder="0770012345" value={reg.PhoneNumber}
                      onChange={e => setReg(p => ({ ...p, PhoneNumber: e.target.value }))} required autoComplete="tel" className="h-8 text-sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label htmlFor="regPw" className="text-xs font-medium text-stripe-text-secondary">Password</label>
                      <div className="relative">
                        <Input id="regPw" type={showRegPw ? 'text' : 'password'} placeholder="Min 8 chars"
                          value={reg.Password} onChange={e => setReg(p => ({ ...p, Password: e.target.value }))}
                          required autoComplete="new-password" className="h-8 pr-8 text-sm" />
                        <button type="button" tabIndex={-1} onClick={() => setShowRegPw(v => !v)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stripe-text-secondary hover:text-stripe-text-primary">
                          {showRegPw ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="confirmPw" className="text-xs font-medium text-stripe-text-secondary">Confirm</label>
                      <Input id="confirmPw" type={showRegPw ? 'text' : 'password'} placeholder="Repeat"
                        value={reg.ConfirmPassword} onChange={e => setReg(p => ({ ...p, ConfirmPassword: e.target.value }))}
                        required autoComplete="new-password"
                        className={cn('h-8 text-sm', pwMismatch && 'border-red-400 focus-visible:ring-red-300')} />
                    </div>
                  </div>
                  {pwMismatch && <p className="text-[11px] text-red-500">Passwords don't match.</p>}

                  {/* Divider */}
                  <div className="flex items-center gap-2 py-0.5">
                    <div className="h-px flex-1 bg-stripe-border" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-stripe-text-secondary">First Property</span>
                    <div className="h-px flex-1 bg-stripe-border" />
                  </div>

                  {/* Property fields */}
                  <div className="space-y-1">
                    <label htmlFor="propName" className="text-xs font-medium text-stripe-text-secondary">Property Name</label>
                    <Input id="propName" placeholder="e.g. Sunrise Hostel" value={reg.PropertyName}
                      onChange={e => setReg(p => ({ ...p, PropertyName: e.target.value }))} required className="h-8 text-sm" />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="propType" className="text-xs font-medium text-stripe-text-secondary">Property Type</label>
                    <select id="propType" value={reg.PropertyType}
                      onChange={e => setReg(p => ({ ...p, PropertyType: e.target.value as PropertyType }))}
                      className="h-8 w-full rounded-md border border-stripe-border bg-white px-2.5 text-sm text-stripe-text-primary focus:outline-none focus:ring-2 focus:ring-[#635BFF]/40"
                    >
                      {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  <Button type="submit"
                    className="mt-1 h-8 w-full bg-[#635BFF] hover:bg-[#5248e8] text-white text-xs font-semibold"
                    disabled={regLoading}>
                    {regLoading ? (
                      <><Loader2 className="mr-1.5 size-3.5 animate-spin" />Creating account…</>
                    ) : 'Create Account & Property'}
                  </Button>

                  <p className="pt-1 text-center text-xs text-stripe-text-secondary">
                    Already have an account?{' '}
                    <button type="button" onClick={() => setTab('signin')} className="font-medium text-[#635BFF] hover:underline">
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
