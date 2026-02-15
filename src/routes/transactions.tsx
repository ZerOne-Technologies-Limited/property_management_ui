import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Filter, Loader2, X } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { fetchTenantById } from '../api/axios'
import { useProperties } from '../hooks/useProperties'
import { useRooms } from '../hooks/useRooms'
import { useTenants } from '../hooks/useTenants'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Button } from '../components/ui/button'
import type { TransactionFilters } from '../types'

export const Route = createFileRoute('/transactions')({
  component: TransactionsPage,
})

const emptyForm = {
  minAmount: '',
  maxAmount: '',
  fromDate: '',
  toDate: '',
  propertyId: '',
  roomId: '',
  tenantId: '',
}

const selectClass =
  'h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'

function TenantName({ tenantId }: { tenantId: string }) {
  const { data: tenant } = useQuery({
    queryKey: ['tenant', tenantId],
    queryFn: () => fetchTenantById(Number(tenantId)),
    enabled: !!tenantId,
  })

  if (!tenant) return <span className="text-gray-400">#{tenantId}</span>
  return <span>{tenant.first_name} {tenant.last_name}</span>
}

function TransactionsPage() {
  const [form, setForm] = useState(emptyForm)
  const [debouncedFilters, setDebouncedFilters] = useState<TransactionFilters>({})
  const [tenantSearch, setTenantSearch] = useState('')
  const [showTenantDropdown, setShowTenantDropdown] = useState(false)

  // Cascading dropdown data
  const { properties } = useProperties()
  const { rooms } = useRooms(form.propertyId)
  const { tenants } = useTenants(form.propertyId || undefined, form.roomId || undefined)

  const filteredTenants = tenants.filter(t =>
    `${t.first_name} ${t.last_name}`.toLowerCase().includes(tenantSearch.toLowerCase())
  )

  // Client-side validation
  const errors: string[] = []
  if (form.minAmount && form.maxAmount && Number(form.minAmount) > Number(form.maxAmount)) {
    errors.push('Min amount cannot exceed max amount')
  }
  if (form.fromDate && form.toDate && form.fromDate > form.toDate) {
    errors.push('Start date cannot be after end date')
  }

  const hasFormValues = Object.values(form).some(v => v !== '')

  // Cascading reset: property change clears room + tenant, room change clears tenant
  const handlePropertyChange = (value: string) => {
    setForm(prev => ({ ...prev, propertyId: value, roomId: '', tenantId: '' }))
    setTenantSearch('')
  }
  const handleRoomChange = (value: string) => {
    setForm(prev => ({ ...prev, roomId: value, tenantId: '' }))
    setTenantSearch('')
  }

  useEffect(() => {
    if (errors.length > 0) return
    const f: TransactionFilters = {}
    if (form.minAmount !== '') f.MinAmount = Number(form.minAmount)
    if (form.maxAmount !== '') f.MaxAmount = Number(form.maxAmount)
    if (form.fromDate) f.FromDate = form.fromDate
    if (form.toDate) f.ToDate = form.toDate
    if (form.propertyId) f.PropertyId = Number(form.propertyId)
    if (form.roomId) f.RoomId = Number(form.roomId)
    if (form.tenantId) f.TenantId = Number(form.tenantId)
    const timer = setTimeout(() => setDebouncedFilters(f), 400)
    return () => clearTimeout(timer)
  }, [form.minAmount, form.maxAmount, form.fromDate, form.toDate, form.propertyId, form.roomId, form.tenantId, errors.length])

  const handleReset = () => {
    setForm(emptyForm)
    setDebouncedFilters({})
    setTenantSearch('')
  }

  const hasFilters = Object.keys(debouncedFilters).length > 0
  const { transactions, loading, error } = useTransactions(debouncedFilters, hasFilters)

  return (
    <>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-stripe-text-primary">Transactions</h1>
      </div>

      {/* Filter Panel */}
      <div className="mb-6 border-b border-stripe-border bg-stripe-sidebar p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-stripe-text-secondary" />
            <span className="text-sm font-semibold text-stripe-text-primary">Filters</span>
          </div>
          {hasFormValues && (
            <Button variant="ghost" size="sm" className="text-xs text-stripe-text-secondary hover:text-stripe-text-primary" onClick={handleReset}>
              <X className="size-3 mr-1" />
              Clear
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Property */}
          <div className="space-y-1">
            <Label className="text-xs text-stripe-text-secondary">Property</Label>
            <select
              className={selectClass}
              value={form.propertyId}
              onChange={(e) => handlePropertyChange(e.target.value)}
            >
              <option value="">All Properties</option>
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Room */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Room</Label>
            <select
              className={selectClass}
              value={form.roomId || ""}
              onChange={(e) => handleRoomChange(e.target.value)}
            >
              <option value="">All Rooms</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {/* Tenant Search */}
          <div className="space-y-1 relative">
            <Label className="text-xs text-gray-500">Tenant</Label>
            <div className="relative">
              <Input
                placeholder="Search tenant..."
                value={tenantSearch}
                onChange={(e) => {
                  setTenantSearch(e.target.value)
                  if (form.tenantId) setForm(prev => ({ ...prev, tenantId: '' }))
                  setShowTenantDropdown(true)
                }}
                onFocus={() => !form.tenantId && setShowTenantDropdown(true)}
                onBlur={() => setTimeout(() => setShowTenantDropdown(false), 150)}
                className={form.tenantId ? 'pr-7' : ''}
              />
              {form.tenantId && (
                <button
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setForm(prev => ({ ...prev, tenantId: '' }))
                    setTenantSearch('')
                  }}
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            {showTenantDropdown && !form.tenantId && filteredTenants.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-sm max-h-40 overflow-y-auto">
                {filteredTenants.map(t => (
                  <button
                    key={t.id}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setForm(prev => ({ ...prev, tenantId: t.id }))
                      setTenantSearch(`${t.first_name} ${t.last_name}`)
                      setShowTenantDropdown(false)
                    }}
                  >
                    {t.first_name} {t.last_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Min Amount */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Min Amount</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.minAmount}
              onChange={(e) => setForm(prev => ({ ...prev, minAmount: e.target.value }))}
            />
          </div>

          {/* Max Amount */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">Max Amount</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.maxAmount}
              onChange={(e) => setForm(prev => ({ ...prev, maxAmount: e.target.value }))}
              className={errors.some(e => e.includes('amount')) ? 'border-red-500' : ''}
            />
          </div>

          {/* From Date */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">From Date</Label>
            <Input
              type="date"
              value={form.fromDate}
              onChange={(e) => setForm(prev => ({ ...prev, fromDate: e.target.value }))}
            />
          </div>

          {/* To Date */}
          <div className="space-y-1">
            <Label className="text-xs text-gray-500">To Date</Label>
            <Input
              type="date"
              value={form.toDate}
              onChange={(e) => setForm(prev => ({ ...prev, toDate: e.target.value }))}
              className={errors.some(e => e.includes('date')) ? 'border-red-500' : ''}
            />
          </div>
        </div>

        {errors.length > 0 && (
          <div className="mt-3 text-xs text-red-500 space-x-2">
            {errors.map((e, i) => <span key={i}>{e}</span>)}
          </div>
        )}
      </div>

      {/* Results Table */}
      <div className="flex-1 overflow-auto">
        {errors.length > 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-sm">Fix filter errors above to search</p>
          </div>
        ) : !hasFilters ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Filter className="size-10 mb-3 opacity-50" />
            <p className="text-sm">Set a filter above to view transactions</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <p className="text-sm">No transactions match the selected filters</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Property</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Room</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Tenant</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{t.id}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">${t.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{t.property_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{t.room_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-600"><TenantName tenantId={t.tenant_id} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
