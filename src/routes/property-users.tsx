import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  UserCog, Plus, X, Loader2, Phone, Shield, Crown, Eye,
  Trash2, Search, ChevronDown,
} from 'lucide-react'
import {
  fetchPropertyUsers, addPropertyUser, updatePropertyUserRole, removePropertyUser,
} from '../api/axios'
import { useAppStore } from '../lib/store'
import { cn } from '../lib/utils'
import type { PropertyUser, PropertyUserRole } from '../types'

export const Route = createFileRoute('/property-users')({
  component: PropertyUsersPage,
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ROLE_META: Record<PropertyUserRole, { label: string; icon: React.ReactNode; color: string }> = {
  Owner: {
    label: 'Owner',
    icon: <Crown className="size-3" />,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  CoManager: {
    label: 'Co-Manager',
    icon: <Shield className="size-3" />,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  Viewer: {
    label: 'Viewer',
    icon: <Eye className="size-3" />,
    color: 'bg-gray-100 text-gray-600 border-gray-200',
  },
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
]
function avatarColor(id: string) {
  const n = parseInt(id, 10) || id.charCodeAt(0)
  return AVATAR_COLORS[n % AVATAR_COLORS.length]
}

// ─── RoleBadge ────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: PropertyUserRole }) {
  const m = ROLE_META[role]
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', m.color)}>
      {m.icon}
      {m.label}
    </span>
  )
}

// ─── RoleSelect ───────────────────────────────────────────────────────────────

function RoleSelect({
  value,
  onChange,
  disabled,
}: {
  value: PropertyUserRole
  onChange: (r: PropertyUserRole) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium transition-colors',
          ROLE_META[value].color,
          disabled ? 'cursor-not-allowed opacity-50' : 'hover:opacity-80'
        )}
      >
        {ROLE_META[value].icon}
        {ROLE_META[value].label}
        {!disabled && <ChevronDown className="size-3" />}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-36 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
          {(Object.keys(ROLE_META) as PropertyUserRole[]).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => { onChange(r); setOpen(false) }}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-gray-50',
                r === value ? 'font-semibold text-stripe-purple' : 'text-stripe-text-primary'
              )}
            >
              {ROLE_META[r].icon}
              {ROLE_META[r].label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── AddUserDialog ────────────────────────────────────────────────────────────

function AddUserDialog({
  propertyId,
  onClose,
}: {
  propertyId: string
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<PropertyUserRole>('CoManager')
  const [error, setError] = useState<string | null>(null)

  const { mutate: doAdd, isPending } = useMutation({
    mutationFn: () => addPropertyUser(propertyId, phone, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propertyUsers', propertyId] })
      onClose()
    },
    onError: (err: any) => {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.Message ||
        'Could not add user. Check the phone number.'
      )
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!phone.trim()) return
    doAdd()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl border border-stripe-border bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-stripe-border px-5 py-4">
          <h2 className="text-base font-semibold text-stripe-text-primary">Add User to Property</h2>
          <button onClick={onClose} className="text-stripe-text-secondary hover:text-stripe-text-primary">
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">{error}</div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stripe-text-secondary">Phone Number</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-stripe-text-secondary" />
              <input
                type="text"
                autoFocus
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0770012345"
                required
                className="h-9 w-full rounded-md border border-stripe-border bg-white pl-8 pr-3 text-sm text-stripe-text-primary placeholder:text-stripe-text-secondary focus:outline-none focus:ring-2 focus:ring-stripe-purple/40"
              />
            </div>
            <p className="text-[11px] text-stripe-text-secondary">
              The user must already have an account on property.zapps.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-stripe-text-secondary">Role</label>
            <div className="flex gap-2">
              {(Object.keys(ROLE_META) as PropertyUserRole[]).map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors',
                    role === r ? ROLE_META[r].color : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  )}
                >
                  {ROLE_META[r].icon}
                  {ROLE_META[r].label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stripe-text-secondary">
              {role === 'Owner' && 'Full control including managing other users.'}
              {role === 'CoManager' && 'Can manage rooms, tenants and transactions.'}
              {role === 'Viewer' && 'Read-only access to the property.'}
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-stripe-border py-2 text-sm font-medium text-stripe-text-secondary hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !phone.trim()}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-stripe-purple py-2 text-sm font-medium text-white hover:bg-stripe-purple/90 disabled:opacity-50"
            >
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── PropertyUsersPage ────────────────────────────────────────────────────────

function PropertyUsersPage() {
  const selectedPropertyId = useAppStore(state => state.selectedPropertyId)
  const currentUserId = useAppStore(state => state.user?.id)
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: ['propertyUsers', selectedPropertyId],
    queryFn: () => fetchPropertyUsers(selectedPropertyId!),
    enabled: !!selectedPropertyId,
  })

  const users: PropertyUser[] = data?.users ?? []
  const callerRole: PropertyUserRole = data?.callerRole ?? 'Viewer'
  const isOwner = callerRole === 'Owner'

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      (u.phone ?? '').includes(q)
    )
  }, [users, search])

  const { mutate: doUpdateRole } = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: PropertyUserRole }) =>
      updatePropertyUserRole(selectedPropertyId!, userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['propertyUsers', selectedPropertyId] }),
  })

  const { mutate: doRemove, variables: removingId } = useMutation({
    mutationFn: (userId: string) => removePropertyUser(selectedPropertyId!, userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['propertyUsers', selectedPropertyId] }),
  })

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 border-b border-stripe-border bg-white">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div>
              <h1 className="text-lg font-bold text-stripe-text-primary sm:text-xl">Property Users</h1>
              {!isLoading && selectedPropertyId && (
                <p className="text-xs text-stripe-text-secondary">
                  {users.length} {users.length === 1 ? 'user' : 'users'} · Your role:{' '}
                  <span className="font-medium text-stripe-text-primary">{ROLE_META[callerRole].label}</span>
                </p>
              )}
            </div>
            {isOwner && selectedPropertyId && (
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-1.5 rounded-md bg-stripe-purple px-3 py-2 text-sm font-medium text-white hover:bg-stripe-purple/90 transition-colors"
              >
                <Plus className="size-4" />
                <span className="hidden sm:inline">Add User</span>
              </button>
            )}
          </div>

          {/* Search */}
          {selectedPropertyId && users.length > 1 && (
            <div className="px-4 pb-3 sm:px-6">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-stripe-text-secondary" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or phone…"
                  className="h-9 w-full rounded-md border border-stripe-border bg-white pl-8 pr-8 text-sm text-stripe-text-primary placeholder:text-stripe-text-secondary focus:outline-none focus:ring-2 focus:ring-stripe-purple/40"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stripe-text-secondary hover:text-stripe-text-primary">
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Column headers */}
          <div className="flex items-center gap-3 border-t border-stripe-border bg-stripe-sidebar px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary sm:px-6">
            <div className="flex-1">User</div>
            <div className="hidden w-36 shrink-0 sm:block">Phone</div>
            <div className="w-28 shrink-0">Role</div>
            {isOwner && <div className="w-8 shrink-0" />}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!selectedPropertyId ? (
            <div className="flex flex-col items-center justify-center py-20 text-stripe-text-secondary">
              <UserCog className="mb-2 size-10 opacity-30" />
              <p className="text-sm">Select a property to manage its users.</p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-md bg-gray-100" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-500">
              <p className="text-sm">Failed to load users.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-stripe-text-secondary">
              <UserCog className="mb-2 size-10 opacity-30" />
              {search ? (
                <p className="text-sm">No users matching "{search}"</p>
              ) : (
                <>
                  <p className="text-sm font-medium">No users yet</p>
                  {isOwner && (
                    <button
                      onClick={() => setShowAdd(true)}
                      className="mt-2 text-xs text-stripe-purple hover:underline"
                    >
                      Add the first user
                    </button>
                  )}
                </>
              )}
            </div>
          ) : (
            filtered.map(user => {
              const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
              const isSelf = user.id === currentUserId
              const isRemoving = (removingId as string | undefined) === user.id

              return (
                <div
                  key={user.id}
                  className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50 last:border-0 sm:px-6"
                >
                  {/* Avatar */}
                  <div className={cn('flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold', avatarColor(user.id))}>
                    {initials}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-stripe-text-primary">
                      {user.name}
                      {isSelf && <span className="ml-1.5 text-[11px] text-stripe-text-secondary">(you)</span>}
                    </p>
                    <p className="truncate text-[11px] text-stripe-text-secondary sm:hidden">
                      {user.phone || '—'}
                    </p>
                  </div>

                  {/* Phone — desktop only */}
                  <div className="hidden w-36 shrink-0 sm:block">
                    <span className="text-sm text-stripe-text-secondary">{user.phone || '—'}</span>
                  </div>

                  {/* Role — editable for Owner, read-only otherwise */}
                  <div className="w-28 shrink-0">
                    {isOwner && !isSelf ? (
                      <RoleSelect
                        value={user.role}
                        onChange={role => doUpdateRole({ userId: user.id, role })}
                      />
                    ) : (
                      <RoleBadge role={user.role} />
                    )}
                  </div>

                  {/* Remove — Owner-only, cannot remove self */}
                  {isOwner && (
                    <div className="w-8 shrink-0 flex justify-end">
                      {!isSelf && (
                        <button
                          onClick={() => doRemove(user.id)}
                          disabled={isRemoving}
                          className="flex size-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                          title="Remove user"
                        >
                          {isRemoving
                            ? <Loader2 className="size-3.5 animate-spin" />
                            : <Trash2 className="size-3.5" />
                          }
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {showAdd && selectedPropertyId && (
        <AddUserDialog propertyId={selectedPropertyId} onClose={() => setShowAdd(false)} />
      )}
    </>
  )
}
