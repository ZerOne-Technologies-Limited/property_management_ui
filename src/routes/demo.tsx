import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import {
  Search, Bell, Settings, Menu, Building2, Home, Receipt, Users, UserCog,
  User, X, ChevronDown, ChevronRight, MessageCircle, MoreVertical, Plus,
  Edit, ArrowRight, BadgeCheck, ChevronsUpDown, Printer, Download, Filter,
  Crown, Shield, Eye, Trash2, ChevronUp,
} from 'lucide-react'
import { cn } from '../lib/utils'

export const Route = createFileRoute('/demo')({
  component: DemoPage,
})

// ─── Types & mock data ────────────────────────────────────────────────────────

type DemoPage = 'home' | 'tenants' | 'transactions' | 'users'
type PropertyUserRole = 'Owner' | 'CoManager' | 'Viewer'

const PROPERTY = { id: '1', name: 'Sunrise Hostel' }

const ROOMS = [
  { id: '1', name: 'Room 101', capacity: 2 },
  { id: '2', name: 'Room 102', capacity: 2 },
  { id: '3', name: 'Room 201', capacity: 1 },
  { id: '4', name: 'Room 202', capacity: 2 },
]

const TENANTS = [
  { id: '1', firstName: 'Chanda',  lastName: 'Mutale',   phone: '0971 234 501', roomId: '1', room: 'Room 101', total: 2400 },
  { id: '2', firstName: 'Bwalya',  lastName: 'Ngosa',    phone: '0971 234 502', roomId: '1', room: 'Room 101', total: 1800 },
  { id: '3', firstName: 'Temwa',   lastName: 'Phiri',    phone: '0971 234 503', roomId: '2', room: 'Room 102', total: 3100 },
  { id: '4', firstName: 'Mwamba',  lastName: 'Banda',    phone: '0971 234 504', roomId: '2', room: 'Room 102', total: 1600 },
  { id: '5', firstName: 'Nkandu',  lastName: 'Luo',      phone: '0971 234 505', roomId: '4', room: 'Room 202', total: 2200 },
  { id: '6', firstName: 'Mumba',   lastName: 'Chisenga', phone: '0971 234 506', roomId: '4', room: 'Room 202', total: 0    },
  { id: '7', firstName: 'Kapya',   lastName: 'Kaoma',    phone: '0971 234 507', roomId: null, room: '',        total: 0    },
]

const TRANSACTIONS = [
  { id: 2001, ref: '#2001', tenant: 'Chanda Mutale',   room: 'Room 101', property: 'Sunrise Hostel', amount: 2400, date: '12-Apr-2026', time: '09:15', notes: 'April rent' },
  { id: 2002, ref: '#2002', tenant: 'Bwalya Ngosa',    room: 'Room 101', property: 'Sunrise Hostel', amount: 1800, date: '11-Apr-2026', time: '10:30', notes: 'April rent' },
  { id: 2003, ref: '#2003', tenant: 'Temwa Phiri',     room: 'Room 102', property: 'Sunrise Hostel', amount: 3100, date: '10-Apr-2026', time: '14:00', notes: 'April + utilities' },
  { id: 2004, ref: '#2004', tenant: 'Mwamba Banda',    room: 'Room 102', property: 'Sunrise Hostel', amount: 1600, date: '09-Apr-2026', time: '08:45', notes: 'Partial payment' },
  { id: 2005, ref: '#2005', tenant: 'Nkandu Luo',      room: 'Room 202', property: 'Sunrise Hostel', amount: 2200, date: '08-Apr-2026', time: '11:20', notes: 'April rent' },
  { id: 2006, ref: '#2006', tenant: 'Mumba Chisenga',  room: 'Room 202', property: 'Sunrise Hostel', amount: 2800, date: '07-Apr-2026', time: '16:05', notes: 'April rent' },
  { id: 2007, ref: '#2007', tenant: 'Chanda Mutale',   room: 'Room 101', property: 'Sunrise Hostel', amount: 2400, date: '15-Mar-2026', time: '09:00', notes: 'March rent' },
  { id: 2008, ref: '#2008', tenant: 'Bwalya Ngosa',    room: 'Room 101', property: 'Sunrise Hostel', amount: 1800, date: '14-Mar-2026', time: '10:00', notes: 'March rent' },
]

const USERS: { id: string; name: string; phone: string; role: PropertyUserRole; isSelf: boolean }[] = [
  { id: '1', name: 'Admin User',      phone: '0971 000 001', role: 'Owner',     isSelf: true  },
  { id: '2', name: 'Chipo Banda',     phone: '0971 000 002', role: 'CoManager', isSelf: false },
  { id: '3', name: 'Mulenga Sakala',  phone: '0971 000 003', role: 'Viewer',    isSelf: false },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtK(n: number) { return `K${n.toLocaleString()}` }

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700', 'bg-cyan-100 text-cyan-700',
]
function avatarColor(id: string) {
  const n = parseInt(id, 10) || id.charCodeAt(0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

const ROLE_META: Record<PropertyUserRole, { label: string; icon: React.ReactNode; color: string }> = {
  Owner:     { label: 'Owner',      icon: <Crown className="size-3" />,  color: 'bg-amber-50 text-amber-700 border-amber-200' },
  CoManager: { label: 'Co-Manager', icon: <Shield className="size-3" />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  Viewer:    { label: 'Viewer',     icon: <Eye className="size-3" />,    color: 'bg-gray-100 text-gray-600 border-gray-200' },
}

function RoleBadge({ role }: { role: PropertyUserRole }) {
  const m = ROLE_META[role]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', m.color)}>
      {m.icon}{m.label}
    </span>
  )
}

// ─── Shell components ─────────────────────────────────────────────────────────

function DemoTopBar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  return (
    <div className="sticky top-0 z-30 flex h-14 w-full items-center gap-3 border-b border-stripe-header/20 bg-stripe-header px-4">
      <button className="flex size-8 items-center justify-center rounded-md text-white/80 hover:bg-white/10 md:hidden" onClick={onToggleSidebar}>
        <Menu className="size-5" />
      </button>
      <span className="text-base font-semibold text-white sm:text-lg">ProprtMng</span>
      <div className="flex-1" />
      <div className="relative hidden w-56 md:block lg:w-64">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
        <input readOnly className="h-8 w-full rounded-md border-0 bg-white/10 pl-9 text-sm text-white placeholder:text-white/60 focus:outline-none" placeholder="Search..." />
      </div>
      <div className="flex items-center gap-1">
        <button className="flex size-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10"><Bell className="size-4" /></button>
        <button className="hidden size-8 items-center justify-center rounded-full text-white/80 hover:bg-white/10 md:flex"><Settings className="size-4" /></button>
        <div className="flex size-8 items-center justify-center rounded-full bg-white/10 text-white"><span className="text-xs font-semibold">AD</span></div>
      </div>
    </div>
  )
}

const NAV_ITEMS: { label: string; icon: React.ElementType; page: DemoPage }[] = [
  { label: 'Home',         icon: Home,    page: 'home'         },
  { label: 'Tenants',      icon: Users,   page: 'tenants'      },
  { label: 'Transactions', icon: Receipt, page: 'transactions' },
  { label: 'Users',        icon: UserCog, page: 'users'        },
]

function DemoSidebar({ isOpen, onClose, activePage, onNavigate }: {
  isOpen: boolean; onClose: () => void
  activePage: DemoPage; onNavigate: (p: DemoPage) => void
}) {
  return (
    <aside className={cn(
      'flex w-64 shrink-0 flex-col border-r border-stripe-border bg-stripe-sidebar',
      'fixed inset-y-0 left-0 z-30 transition-transform duration-200 ease-in-out',
      isOpen ? 'translate-x-0' : '-translate-x-full',
      'md:relative md:inset-y-auto md:left-auto md:z-auto md:translate-x-0 md:h-auto',
    )}>
      <div className="flex h-14 items-center justify-between border-b border-stripe-border px-4">
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-stripe-purple" />
          <span className="text-base font-semibold text-stripe-text-primary">ProprtMng</span>
        </div>
        <button className="flex size-8 items-center justify-center rounded-md text-stripe-text-secondary hover:bg-white/50 md:hidden" onClick={onClose}>
          <X className="size-4" />
        </button>
      </div>

      <div className="border-b border-stripe-border px-4 py-3">
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-stripe-text-secondary">Property</label>
        <button className="flex h-9 w-full items-center justify-between rounded-md border border-stripe-border bg-white px-3 text-sm font-medium text-stripe-text-primary hover:bg-gray-50">
          <span className="truncate">{PROPERTY.name}</span>
          <ChevronsUpDown className="ml-2 size-3.5 shrink-0 text-stripe-text-secondary" />
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-3">
        {NAV_ITEMS.map(({ label, icon: Icon, page }) => (
          <button key={page} onClick={() => { onNavigate(page); onClose() }}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
              activePage === page ? 'bg-stripe-purple-light text-stripe-purple' : 'text-stripe-text-primary hover:bg-white/50',
            )}
          >
            <Icon className="size-4" />{label}
          </button>
        ))}
      </nav>

      <div className="border-t border-stripe-border px-3 py-3">
        <div className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-stripe-text-primary hover:bg-white/50">
          <User className="size-4" />Profile
        </div>
      </div>
    </aside>
  )
}

// ─── Home (HierarchyGrid replica) ─────────────────────────────────────────────

function DemoTenantRow({ t }: { t: { id: string; firstName: string; lastName: string; phone: string; total: number; payments?: number[] } }) {
  return (
    <div className="group items-center border-t border-gray-100 transition-colors hover:bg-gray-50 grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-2.5 sm:grid-cols-8 sm:gap-4 sm:px-4">
      <div className="flex items-center gap-2 min-w-0 pl-6 sm:col-span-3 sm:pl-8">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <User className="size-3.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900 leading-tight">{t.firstName} {t.lastName}</p>
          <p className="truncate text-[10px] text-gray-400">{t.phone}</p>
        </div>
        <a href="#" onClick={e => e.preventDefault()} className="shrink-0 flex size-6 items-center justify-center rounded-full text-green-600 hover:bg-green-50">
          <MessageCircle className="size-3.5" />
        </a>
      </div>
      <div className="hidden sm:flex sm:col-span-2 items-center gap-1">
        {t.total > 0
          ? <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">{fmtK(t.total)}</span>
          : <span className="text-xs text-gray-300">No payments</span>
        }
      </div>
      <div className="sm:col-span-2">
        <span className={cn('font-mono text-sm font-semibold tabular-nums', t.total > 0 ? 'text-emerald-700' : 'text-gray-400')}>
          {t.total > 0 ? fmtK(t.total) : '—'}
        </span>
      </div>
      <div className="flex justify-end items-center gap-1 sm:col-span-1">
        <button className="flex size-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100"><Plus className="size-3.5" /></button>
        <button className="flex size-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100"><MoreVertical className="size-3.5" /></button>
      </div>
    </div>
  )
}

function DemoRoomRow({ room }: { room: typeof ROOMS[0] }) {
  const [expanded, setExpanded] = useState(true)
  const tenants = TENANTS.filter(t => t.roomId === room.id)
  const pct = (tenants.length / room.capacity) * 100

  return (
    <div className="border-b border-gray-100 last:border-0">
      <div onClick={() => setExpanded(v => !v)}
        className={cn('group cursor-pointer items-center transition-colors hover:bg-blue-50/30 grid grid-cols-[auto_1fr_auto] gap-2 px-3 py-3 sm:grid-cols-8 sm:gap-4 sm:px-4', expanded && 'bg-blue-50/30')}>
        <div className="flex items-center gap-2 sm:col-span-3">
          <button className="flex size-6 shrink-0 items-center justify-center rounded text-gray-400">
            {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          </button>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-bold text-gray-900">{room.name}</h4>
            <p className="text-[10px] text-gray-400 sm:hidden">{tenants.length}/{room.capacity} occupied</p>
          </div>
        </div>
        <div className="hidden sm:col-span-2 sm:flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">{tenants.length} / {room.capacity}</span>
          <div className="h-1.5 w-16 rounded-full bg-gray-200">
            <div className={cn('h-1.5 rounded-full', pct >= 100 ? 'bg-red-500' : 'bg-blue-500')} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="hidden sm:block sm:col-span-2"><span className="text-sm text-gray-300">—</span></div>
        <div className="flex justify-end sm:col-span-1">
          <div className="flex gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100" onClick={e => e.stopPropagation()}>
            <button className="flex size-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100"><Plus className="size-4" /></button>
            <button className="flex size-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100"><Edit className="size-4" /></button>
          </div>
        </div>
      </div>
      {expanded && (
        <div className="bg-gray-50">
          {tenants.map(t => <DemoTenantRow key={t.id} t={t} />)}
          {tenants.length === 0 && <div className="p-4 text-center text-sm text-gray-500">No tenants assigned to this room.</div>}
          <div className="flex items-center justify-between bg-gray-100 px-12 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <span>Occupancy: {Math.round(pct)}%</span>
          </div>
        </div>
      )}
    </div>
  )
}

function DemoHome() {
  const [search, setSearch] = useState('')
  const filtered = ROOMS.map(r => ({ ...r, _tenants: TENANTS.filter(t => t.roomId === r.id && (!search.trim() || `${t.firstName} ${t.lastName}`.toLowerCase().includes(search.toLowerCase()))) }))
    .filter(r => !search.trim() || r._tenants.length > 0)

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 border-b border-stripe-border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stripe-border/50 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2">
            <div className="flex overflow-hidden rounded-md border border-stripe-border text-xs font-medium">
              {['Month', 'Week', 'Custom'].map((m, i) => (
                <button key={m} className={cn('px-3 py-1.5 transition-colors', i === 0 ? 'bg-stripe-purple text-white' : 'bg-white text-stripe-text-secondary hover:bg-stripe-sidebar')}>{m}</button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button className="flex size-7 items-center justify-center rounded-md text-stripe-text-secondary hover:bg-gray-100"><ChevronRight className="size-3.5 rotate-180" /></button>
              <span className="min-w-[88px] rounded-md border border-stripe-border bg-white px-2.5 py-1 text-center text-xs font-medium text-stripe-text-primary">Apr-2026</span>
              <button className="flex size-7 items-center justify-center rounded-md text-stripe-text-secondary hover:bg-gray-100"><ChevronRight className="size-3.5" /></button>
            </div>
          </div>
          <button className="flex h-8 items-center gap-1.5 rounded-md border border-stripe-border bg-white px-3 text-xs font-medium text-stripe-text-primary hover:bg-gray-50">
            <Plus className="size-3.5" /> Add Room
          </button>
        </div>
        <div className="px-3 py-2 sm:px-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-stripe-text-secondary" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student by name…"
              className="h-8 w-full rounded-md border border-stripe-border bg-white pl-8 pr-8 text-sm text-stripe-text-primary placeholder:text-stripe-text-secondary focus:outline-none focus:ring-2 focus:ring-stripe-purple/40" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stripe-text-secondary hover:text-stripe-text-primary"><X className="size-3.5" /></button>}
          </div>
        </div>
      </div>
      <div className="hidden sm:grid grid-cols-8 gap-4 border-b border-stripe-border bg-stripe-sidebar px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary">
        <div className="col-span-3 pl-8">Name</div>
        <div className="col-span-2">Capacity</div>
        <div className="col-span-2">Total</div>
        <div className="col-span-1 text-right">Action</div>
      </div>
      <div className="flex items-center justify-between border-b border-stripe-border bg-stripe-sidebar px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary sm:hidden">
        <span>Name</span><span>Total</span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto">
        {filtered.map(room => <DemoRoomRow key={room.id} room={room} />)}
      </div>
    </div>
  )
}

// ─── Tenants page replica ──────────────────────────────────────────────────────

function DemoTenants() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return TENANTS
    return TENANTS.filter(t => `${t.firstName} ${t.lastName}`.toLowerCase().includes(q) || t.phone.includes(q))
  }, [search])

  const assigned   = filtered.filter(t => t.roomId)
  const unassigned = filtered.filter(t => !t.roomId)

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 border-b border-stripe-border bg-white">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <h1 className="text-lg font-bold text-stripe-text-primary sm:text-xl">Tenants</h1>
            <p className="text-xs text-stripe-text-secondary">
              {filtered.length} tenants
              {!search && unassigned.length > 0 && <> · <span className="text-amber-600">{unassigned.length} unassigned</span></>}
            </p>
          </div>
        </div>
        <div className="px-4 pb-3 sm:px-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-stripe-text-secondary" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or phone number…"
              className="h-9 w-full rounded-md border border-stripe-border bg-white pl-8 pr-8 text-sm text-stripe-text-primary placeholder:text-stripe-text-secondary focus:outline-none focus:ring-2 focus:ring-stripe-purple/40 focus:border-stripe-purple/50" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stripe-text-secondary hover:text-stripe-text-primary"><X className="size-3.5" /></button>}
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-stripe-border bg-stripe-sidebar px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary sm:px-6">
          <div className="flex-1">Name</div>
          <div className="hidden w-28 shrink-0 sm:block">Room</div>
          <div className="w-24 shrink-0 text-right">Total</div>
          <div className="w-24 shrink-0 text-right">Actions</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {assigned.map(t => {
          const initials = `${t.firstName[0]}${t.lastName[0]}`.toUpperCase()
          return (
            <div key={t.id} className="group flex items-center gap-3 border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50 last:border-0 sm:px-6">
              <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold', avatarColor(t.id))}>{initials}</div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">{t.firstName} {t.lastName}</p>
                <p className="truncate text-[11px] text-gray-400">{t.phone}</p>
              </div>
              <div className="hidden w-28 shrink-0 sm:block">
                <span className="rounded-md bg-stripe-sidebar px-2 py-0.5 text-xs font-medium text-stripe-text-secondary">{t.room}</span>
              </div>
              <div className="w-24 shrink-0 text-right">
                <span className={cn('font-mono text-sm font-semibold tabular-nums', t.total > 0 ? 'text-emerald-700' : 'text-gray-400')}>
                  {t.total > 0 ? fmtK(t.total) : '—'}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <a href="#" onClick={e => e.preventDefault()} className="hidden sm:flex size-7 items-center justify-center rounded-full text-green-600 hover:bg-green-50"><MessageCircle className="size-3.5" /></a>
                <button className="flex size-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100"><Plus className="size-3.5" /></button>
                <button className="flex size-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"><MoreVertical className="size-3.5" /></button>
              </div>
            </div>
          )
        })}

        {unassigned.length > 0 && (
          <>
            <div className="flex items-center gap-3 border-y border-amber-100 bg-amber-50 px-4 py-2 sm:px-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Unassigned</span>
              <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{unassigned.length}</span>
            </div>
            {unassigned.map(t => {
              const initials = `${t.firstName[0]}${t.lastName[0]}`.toUpperCase()
              return (
                <div key={t.id} className="group flex items-center gap-3 border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50 last:border-0 sm:px-6">
                  <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold', avatarColor(t.id))}>{initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{t.firstName} {t.lastName}</p>
                    <p className="truncate text-[11px] text-gray-400">{t.phone}</p>
                  </div>
                  <div className="hidden w-28 shrink-0 sm:block">
                    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">Unassigned</span>
                  </div>
                  <div className="w-24 shrink-0 text-right">
                    <span className="font-mono text-sm font-semibold tabular-nums text-gray-400">—</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button className="flex size-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 cursor-not-allowed opacity-50" disabled title="Assign to a room first"><Plus className="size-3.5" /></button>
                    <button className="flex size-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"><MoreVertical className="size-3.5" /></button>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Transactions page replica ─────────────────────────────────────────────────

function DemoTransactions() {
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [search, setSearch]           = useState('')
  const [sortCol, setSortCol]         = useState<'date' | 'amount'>('date')
  const [sortDir, setSortDir]         = useState<'asc' | 'desc'>('desc')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const arr = q ? TRANSACTIONS.filter(tx => tx.tenant.toLowerCase().includes(q) || tx.ref.includes(q) || tx.room.toLowerCase().includes(q)) : [...TRANSACTIONS]
    arr.sort((a, b) => {
      const cmp = sortCol === 'amount' ? a.amount - b.amount : a.id - b.id
      return sortDir === 'asc' ? cmp : -cmp
    })
    return arr
  }, [search, sortCol, sortDir])

  const total = filtered.reduce((s, tx) => s + tx.amount, 0)
  const avg   = filtered.length ? total / filtered.length : 0
  const maxAmt = filtered.length ? Math.max(...filtered.map(t => t.amount)) : 0

  const toggleSort = (col: 'date' | 'amount') => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }
  const SortIcon = ({ col }: { col: 'date' | 'amount' }) =>
    sortCol === col ? (sortDir === 'desc' ? <ChevronDown className="size-3 ml-0.5" /> : <ChevronUp className="size-3 ml-0.5" />) : null

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-stripe-border bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-stripe-text-primary sm:text-xl">Transactions</h1>
            <p className="text-xs text-stripe-text-secondary">{filtered.length} records · {fmtK(total)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-8 items-center gap-1.5 rounded-md border border-stripe-border bg-white px-3 text-xs font-medium text-stripe-text-secondary hover:bg-gray-50">
              <Download className="size-3.5" /><span className="hidden sm:inline">Export CSV</span>
            </button>
            <button className="flex h-8 items-center gap-1.5 rounded-md border border-stripe-border bg-white px-3 text-xs font-medium text-stripe-text-secondary hover:bg-gray-50">
              <Printer className="size-3.5" /><span className="hidden sm:inline">Print All</span>
            </button>
            <button onClick={() => setFiltersOpen(v => !v)} className="flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-stripe-text-secondary hover:bg-gray-50">
              <Filter className="size-3.5" />{filtersOpen ? 'Hide' : 'Filters'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Filter panel */}
        {filtersOpen && (
          <div className="border-b border-stripe-border bg-stripe-sidebar px-4 py-4 sm:px-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-stripe-text-secondary">Property</label>
                <select className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none">
                  <option>Sunrise Hostel</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stripe-text-secondary">Room</label>
                <select className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none">
                  <option>All Rooms</option>
                  {ROOMS.map(r => <option key={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stripe-text-secondary">Tenant</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tenant…"
                    className="h-9 w-full rounded-md border border-gray-200 bg-white pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-stripe-purple/40" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stripe-text-secondary">From Date</label>
                <button className="flex h-9 w-full items-center rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-400 hover:bg-gray-50">01-Apr-2026</button>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stripe-text-secondary">To Date</label>
                <button className="flex h-9 w-full items-center rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-400 hover:bg-gray-50">30-Apr-2026</button>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stripe-text-secondary">Min Amount (K)</label>
                <input type="number" placeholder="0.00" className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-stripe-purple/40" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-stripe-text-secondary">Max Amount (K)</label>
                <input type="number" placeholder="0.00" className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-stripe-purple/40" />
              </div>
            </div>
          </div>
        )}

        {/* Summary strip */}
        <div className="grid grid-cols-3 divide-x divide-stripe-border border-b border-stripe-border bg-white">
          {[
            { label: 'Total Collected', value: fmtK(total), accent: true },
            { label: 'Transactions',    value: String(filtered.length) },
            { label: 'Average Payment', value: fmtK(Math.round(avg)) },
          ].map(s => (
            <div key={s.label} className="px-4 py-3 sm:px-6">
              <p className="text-[11px] font-medium uppercase tracking-wider text-stripe-text-secondary">{s.label}</p>
              <p className={cn('mt-0.5 text-lg font-bold tabular-nums', s.accent ? 'text-emerald-700' : 'text-stripe-text-primary')}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-stripe-border bg-stripe-sidebar">
                <th className="px-4 py-2.5 text-left">
                  <button onClick={() => toggleSort('date')} className="flex items-center text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary hover:text-stripe-text-primary">
                    Date <SortIcon col="date" />
                  </button>
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary">Ref #</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary">Tenant</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary sm:table-cell">Property / Room</th>
                <th className="hidden px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary lg:table-cell">Notes</th>
                <th className="px-4 py-2.5 text-right">
                  <button onClick={() => toggleSort('amount')} className="flex items-center ml-auto text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary hover:text-stripe-text-primary">
                    Amount <SortIcon col="amount" />
                  </button>
                </th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => (
                <tr key={tx.id} className="group border-b border-gray-100 transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-stripe-text-primary">{tx.date}</p>
                    <p className="text-[11px] text-stripe-text-secondary">{tx.time}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-stripe-text-secondary">{tx.ref}</td>
                  <td className="px-4 py-3 text-sm font-medium text-stripe-text-primary">{tx.tenant}</td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <p className="text-sm text-stripe-text-primary">{tx.property}</p>
                    <p className="text-[11px] text-stripe-text-secondary">{tx.room}</p>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {tx.notes ? <span className="text-sm text-stripe-text-primary">{tx.notes}</span> : <span className="text-sm text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn('font-mono text-sm font-semibold tabular-nums', tx.amount >= maxAmt * 0.9 ? 'text-emerald-600' : 'text-stripe-text-primary')}>
                      {fmtK(tx.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-stripe-text-secondary hover:bg-stripe-purple/10 hover:text-stripe-purple">
                      <Printer className="size-3.5" /><span className="hidden sm:inline">Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-stripe-border bg-stripe-sidebar">
                <td colSpan={5} className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary">
                  Total ({filtered.length})
                </td>
                <td className="px-4 py-2.5 text-right font-mono text-sm font-bold text-emerald-700 tabular-nums">{fmtK(total)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Users page replica ────────────────────────────────────────────────────────

function DemoUsers() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? USERS.filter(u => u.name.toLowerCase().includes(q) || u.phone.includes(q)) : USERS
  }, [search])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="sticky top-0 z-10 border-b border-stripe-border bg-white">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div>
            <h1 className="text-lg font-bold text-stripe-text-primary sm:text-xl">Property Users</h1>
            <p className="text-xs text-stripe-text-secondary">
              {USERS.length} users · Your role: <span className="font-medium text-stripe-text-primary">Owner</span>
            </p>
          </div>
          <button className="flex items-center gap-1.5 rounded-md bg-stripe-purple px-3 py-2 text-sm font-medium text-white hover:bg-stripe-purple/90">
            <Plus className="size-4" /><span className="hidden sm:inline">Add User</span>
          </button>
        </div>

        <div className="px-4 pb-3 sm:px-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-stripe-text-secondary" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or phone…"
              className="h-9 w-full rounded-md border border-stripe-border bg-white pl-8 pr-8 text-sm text-stripe-text-primary placeholder:text-stripe-text-secondary focus:outline-none focus:ring-2 focus:ring-stripe-purple/40" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stripe-text-secondary hover:text-stripe-text-primary"><X className="size-3.5" /></button>}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-stripe-border bg-stripe-sidebar px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary sm:px-6">
          <div className="flex-1">User</div>
          <div className="hidden w-36 shrink-0 sm:block">Phone</div>
          <div className="w-28 shrink-0">Role</div>
          <div className="w-8 shrink-0" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map(user => {
          const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
          return (
            <div key={user.id} className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50 last:border-0 sm:px-6">
              <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold', avatarColor(user.id))}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-stripe-text-primary">
                  {user.name}
                  {user.isSelf && <span className="ml-1.5 text-[11px] text-stripe-text-secondary">(you)</span>}
                </p>
                <p className="truncate text-[11px] text-stripe-text-secondary sm:hidden">{user.phone}</p>
              </div>
              <div className="hidden w-36 shrink-0 sm:block">
                <span className="text-sm text-stripe-text-secondary">{user.phone}</span>
              </div>
              <div className="w-28 shrink-0">
                {!user.isSelf
                  ? <RoleBadge role={user.role} />
                  : <RoleBadge role={user.role} />
                }
              </div>
              <div className="w-8 shrink-0 flex justify-end">
                {!user.isSelf && (
                  <button className="flex size-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function DemoPage() {
  const navigate     = useNavigate()
  const [activePage, setActivePage] = useState<DemoPage>('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  return (
    <div className="flex flex-col" style={{ height: '100dvh' }}>
      {/* Demo banner */}
      {!bannerDismissed && (
        <div className="flex shrink-0 items-center justify-between gap-3 bg-[#635BFF] px-4 py-2 sm:px-6">
          <div className="flex items-center gap-2">
            <BadgeCheck className="size-4 shrink-0 text-white/80" />
            <p className="text-xs font-medium text-white">
              <span className="font-bold">Demo Mode</span> — Sample data only. Nothing is saved.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => navigate({ to: '/login' })}
              className="flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-[#635BFF] hover:bg-white/90">
              Get Started Free <ArrowRight className="size-3" />
            </button>
            <button onClick={() => setBannerDismissed(true)} className="text-white/60 hover:text-white">
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0 flex-col overflow-hidden bg-white">
        <DemoTopBar onToggleSidebar={() => setSidebarOpen(v => !v)} />

        <div className="relative flex flex-1 min-h-0 overflow-hidden">
          {sidebarOpen && (
            <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
          )}

          <DemoSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} activePage={activePage} onNavigate={setActivePage} />

          <main className="flex-1 min-h-0 overflow-auto bg-white">
            {activePage === 'home'         && <DemoHome />}
            {activePage === 'tenants'      && <DemoTenants />}
            {activePage === 'transactions' && <DemoTransactions />}
            {activePage === 'users'        && <DemoUsers />}
          </main>
        </div>
      </div>
    </div>
  )
}
