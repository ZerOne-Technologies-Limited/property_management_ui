import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, X, MessageCircle, MoreVertical, LogOut, Loader2 } from 'lucide-react'
import { useAppStore } from '../lib/store'
import { useTenants } from '../hooks/useTenants'
import { useRooms } from '../hooks/useRooms'
import { useTransactions } from '../hooks/useTransactions'
import { AddPaymentDialog } from '../components/dashboard/AddPaymentDialog'
import { DrawerManager } from '../components/layout/DrawerManager'
import { cn } from '../lib/utils'
import type { Tenant } from '../types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { unassignTenantFromRoom } from '../api/axios'

export const Route = createFileRoute('/tenants')({
  component: TenantsPage,
})

// ─── Avatar colour helper ─────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
]

function avatarColor(id: string) {
  const n = parseInt(id, 10) || id.charCodeAt(0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

// ─── TenantListRow ────────────────────────────────────────────────────────────

interface TenantListRowProps {
  tenant: Tenant
  roomName: string
  searchQuery: string
}

function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-stripe-purple/15 text-stripe-purple rounded-sm px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

function TenantListRow({ tenant, roomName, searchQuery }: TenantListRowProps) {
  const { openDrawer } = useAppStore()
  const dateFilter = useAppStore(state => state.dateFilter)

  const { transactions, loading: loadingTx } = useTransactions({
    PropertyId: Number(tenant.property_id),
    RoomId: tenant.room_id ? Number(tenant.room_id) : undefined,
    TenantId: Number(tenant.id),
    ...(dateFilter.from ? { FromDate: dateFilter.from } : {}),
    ...(dateFilter.to ? { ToDate: dateFilter.to } : {}),
  })

  const total = useMemo(
    () => transactions.reduce((s, t) => s + t.amount, 0),
    [transactions]
  )

  const fullName = `${tenant.first_name} ${tenant.last_name}`
  const initials = `${tenant.first_name[0] ?? ''}${tenant.last_name[0] ?? ''}`.toUpperCase()

  // Unassign mutation
  const queryClient = useQueryClient()
  const { mutate: doUnassign, isPending: unassigning } = useMutation({
    mutationFn: () => unassignTenantFromRoom(tenant.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] })
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    },
  })

  // Kebab menu
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!menuOpen) return
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [menuOpen])

  return (
    <div className="group flex items-center gap-3 border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50 last:border-0">
      {/* Avatar */}
      <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold', avatarColor(tenant.id))}>
        {initials}
      </div>

      {/* Name + phone */}
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-gray-900">
          <HighlightMatch text={fullName} query={searchQuery} />
        </p>
        <p className="truncate text-[11px] text-gray-400">{tenant.whatsapp_number || '—'}</p>
      </div>

      {/* Room — hidden on mobile */}
      <div className="hidden sm:block w-28 shrink-0">
        {roomName ? (
          <span className="rounded-md bg-stripe-sidebar px-2 py-0.5 text-xs font-medium text-stripe-text-secondary">
            {roomName}
          </span>
        ) : (
          <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
            Unassigned
          </span>
        )}
      </div>

      {/* Total */}
      <div className="w-24 shrink-0 text-right">
        {loadingTx ? (
          <span className="text-xs text-gray-300">…</span>
        ) : (
          <span className={cn('font-mono text-sm font-semibold tabular-nums', total > 0 ? 'text-emerald-700' : 'text-gray-400')}>
            {total > 0 ? `K${total.toLocaleString()}` : '—'}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {tenant.whatsapp_number && (
          <a
            href={`https://wa.me/${tenant.whatsapp_number.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex size-7 items-center justify-center rounded-full text-green-600 hover:bg-green-50 transition-colors"
            title="WhatsApp"
          >
            <MessageCircle className="size-3.5" />
          </a>
        )}

        <AddPaymentDialog
          tenantId={tenant.id}
          roomId={tenant.room_id || 0}
          propertyId={tenant.property_id}
          iconOnly
        />

        <div className="relative" ref={menuRef}>
          <button
            className="flex size-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            onClick={() => setMenuOpen(v => !v)}
            title="More options"
          >
            <MoreVertical className="size-3.5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button
                className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => { setMenuOpen(false); openDrawer('PAYMENT_HISTORY', { tenantId: tenant.id, payments: transactions }) }}
              >
                View Payments
              </button>
              <button
                className="w-full px-3 py-1.5 text-left text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => { setMenuOpen(false); openDrawer('TENANT', tenant) }}
              >
                Tenant Profile
              </button>
              {tenant.room_id && (
                <>
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    disabled={unassigning}
                    onClick={() => { setMenuOpen(false); doUnassign() }}
                  >
                    {unassigning ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <LogOut className="size-3" />
                    )}
                    Remove from room
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── TenantsPage ──────────────────────────────────────────────────────────────

function TenantsPage() {
  const selectedPropertyId = useAppStore(state => state.selectedPropertyId)
  const [searchQuery, setSearchQuery] = useState('')

  const { tenants, loading } = useTenants(selectedPropertyId || undefined)
  const { rooms } = useRooms(selectedPropertyId || '')

  const roomMap = useMemo(
    () => Object.fromEntries(rooms.map(r => [r.id, r.name])),
    [rooms]
  )

  const filteredTenants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return tenants
    return tenants.filter(t =>
      `${t.first_name} ${t.last_name}`.toLowerCase().includes(q) ||
      (t.whatsapp_number ?? '').includes(q)
    )
  }, [tenants, searchQuery])

  // Split into assigned and unassigned groups
  const assignedTenants = useMemo(() => filteredTenants.filter(t => t.room_id), [filteredTenants])
  const unassignedTenants = useMemo(() => filteredTenants.filter(t => !t.room_id), [filteredTenants])

  const totalCount = filteredTenants.length

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 border-b border-stripe-border bg-white">
          {/* Title row */}
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div>
              <h1 className="text-lg font-bold text-stripe-text-primary sm:text-xl">Tenants</h1>
              {!loading && (
                <p className="text-xs text-stripe-text-secondary">
                  {totalCount} {totalCount === 1 ? 'tenant' : 'tenants'}
                  {searchQuery && ` matching "${searchQuery}"`}
                  {!searchQuery && unassignedTenants.length > 0 && (
                    <> · <span className="text-amber-600">{unassignedTenants.length} unassigned</span></>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Search bar */}
          <div className="px-4 pb-3 sm:px-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-stripe-text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name or phone number…"
                className="h-9 w-full rounded-md border border-stripe-border bg-white pl-8 pr-8 text-sm text-stripe-text-primary placeholder:text-stripe-text-secondary focus:outline-none focus:ring-2 focus:ring-stripe-purple/40 focus:border-stripe-purple/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stripe-text-secondary hover:text-stripe-text-primary"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-3 border-t border-stripe-border bg-stripe-sidebar px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary sm:px-6">
            <div className="flex-1">Name</div>
            <div className="hidden w-28 shrink-0 sm:block">Room</div>
            <div className="w-24 shrink-0 text-right">Total</div>
            <div className="w-24 shrink-0 text-right">Actions</div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {!selectedPropertyId ? (
            <div className="flex flex-col items-center justify-center py-20 text-stripe-text-secondary">
              <p className="text-sm">Select a property in the sidebar to view tenants.</p>
            </div>
          ) : loading ? (
            <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-md bg-gray-100" />
              ))}
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-stripe-text-secondary">
              <Search className="mb-2 size-8 opacity-30" />
              {searchQuery ? (
                <>
                  <p className="text-sm">No tenants found matching <span className="font-medium text-stripe-text-primary">"{searchQuery}"</span></p>
                  <button className="mt-2 text-xs text-stripe-purple hover:underline" onClick={() => setSearchQuery('')}>Clear search</button>
                </>
              ) : (
                <p className="text-sm">No tenants for this property yet.</p>
              )}
            </div>
          ) : (
            <>
              {/* Assigned tenants */}
              {assignedTenants.map(tenant => (
                <TenantListRow
                  key={tenant.id}
                  tenant={tenant}
                  roomName={roomMap[tenant.room_id ?? ''] ?? ''}
                  searchQuery={searchQuery}
                />
              ))}

              {/* Unassigned section */}
              {unassignedTenants.length > 0 && (
                <>
                  <div className="flex items-center gap-3 border-y border-amber-100 bg-amber-50 px-4 py-2 sm:px-6">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                      Unassigned
                    </span>
                    <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                      {unassignedTenants.length}
                    </span>
                  </div>
                  {unassignedTenants.map(tenant => (
                    <TenantListRow
                      key={tenant.id}
                      tenant={tenant}
                      roomName=""
                      searchQuery={searchQuery}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>

      <DrawerManager />
    </>
  )
}
