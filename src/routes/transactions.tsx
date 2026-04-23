import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo, useRef } from 'react'
import {
  Filter, X, Printer, Download, Receipt,
  ChevronDown, ChevronUp, Search,
} from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import { useProperties } from '../hooks/useProperties'
import { useRooms } from '../hooks/useRooms'
import { useTenants } from '../hooks/useTenants'
import { Button } from '../components/ui/button'
import { cn } from '../lib/utils'
import { useFormatMoney } from '../lib/format-money'
import { useAppStore } from '../lib/store'
import type { Transaction, TransactionFilters } from '../types'

export const Route = createFileRoute('/transactions')({
  component: TransactionsPage,
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2,'0')}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`
}

function fmtTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ─── Receipt printer ─────────────────────────────────────────────────────────

function printReceipt(
  tx: Transaction,
  tenant: string,
  room: string,
  property: string,
  formatAmount: (n: number) => string,
  roomLabel = 'Room',
) {
  const w = window.open('', '_blank', 'width=480,height=700')
  if (!w) return
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Receipt #${tx.id}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;padding:36px 40px;color:#111;max-width:420px;margin:0 auto}
  .brand{font-size:20px;font-weight:700;color:#7c3aed;letter-spacing:-0.5px}
  .tagline{font-size:11px;color:#9ca3af;margin-bottom:28px}
  .heading{text-align:center;font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:#6b7280;margin-bottom:20px}
  hr{border:none;border-top:1px dashed #d1d5db;margin:16px 0}
  .row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:9px}
  .lbl{font-size:12px;color:#6b7280}
  .val{font-size:12px;font-weight:500;text-align:right;max-width:58%}
  .amount-row .lbl{font-size:15px;font-weight:600;color:#111}
  .amount-row .val{font-size:22px;font-weight:700;color:#059669}
  .ref{font-family:monospace;font-size:11px;color:#9ca3af}
  .footer{margin-top:28px;text-align:center;font-size:11px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:14px}
  @media print{.print-btn{display:none}}
</style></head><body>
<div class="brand">property.zapps</div>
<div class="tagline">Official Payment Receipt</div>
<div class="heading">Payment Receipt</div>
<div class="row"><span class="lbl">Receipt No.</span><span class="val ref">#${tx.id}</span></div>
<div class="row"><span class="lbl">Date</span><span class="val">${fmtDate(tx.created_at)} ${fmtTime(tx.created_at)}</span></div>
<hr/>
<div class="row"><span class="lbl">Tenant</span><span class="val">${tenant}</span></div>
<div class="row"><span class="lbl">Property</span><span class="val">${property}</span></div>
<div class="row"><span class="lbl">${roomLabel}</span><span class="val">${room}</span></div>
${tx.notes ? `<div class="row"><span class="lbl">Notes</span><span class="val">${tx.notes}</span></div>` : ''}
<hr/>
<div class="row amount-row"><span class="lbl">Amount Paid</span><span class="val">${formatAmount(tx.amount)}</span></div>
<div class="footer">Thank you for your payment · property.zapps</div>
<br/><div style="text-align:center">
  <button class="print-btn" onclick="window.print();window.close()" style="padding:8px 20px;background:#7c3aed;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px">
    🖨 Print
  </button>
</div>
</body></html>`)
  w.document.close()
  w.focus()
  // Auto-print after a short delay to allow render
  setTimeout(() => { try { w.print() } catch { /* ignore */ } }, 400)
}

function printAllReceipts(
  transactions: Transaction[],
  tenantMap: Record<string,string>,
  roomMap: Record<string,string>,
  propertyMap: Record<string,string>,
  filterLabel: string,
  formatAmount: (n: number) => string,
  roomLabel = 'Room',
) {
  const rows = transactions.map(tx => `
    <tr>
      <td>${fmtDate(tx.created_at)}</td>
      <td class="mono">#${tx.id}</td>
      <td>${tenantMap[tx.tenant_id] ?? tx.tenant_id}</td>
      <td>${propertyMap[tx.property_id] ?? tx.property_id}</td>
      <td>${roomMap[tx.room_id] ?? tx.room_id}</td>
      <td>${tx.notes || '—'}</td>
      <td class="amount">${formatAmount(tx.amount)}</td>
    </tr>`).join('')

  const total = transactions.reduce((s, t) => s + t.amount, 0)

  const w = window.open('', '_blank', 'width=900,height=700')
  if (!w) return
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Transactions Report</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;padding:32px;color:#111;font-size:13px}
  .brand{font-size:20px;font-weight:700;color:#7c3aed;margin-bottom:2px}
  .meta{color:#6b7280;font-size:12px;margin-bottom:24px}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  th{background:#f9fafb;padding:8px 10px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#6b7280;border-bottom:2px solid #e5e7eb}
  td{padding:8px 10px;border-bottom:1px solid #f3f4f6;vertical-align:top}
  tr:hover td{background:#fafafa}
  .mono{font-family:monospace;color:#9ca3af}
  .amount{font-weight:600;color:#059669;text-align:right}
  th:last-child{text-align:right}
  .total-row td{border-top:2px solid #e5e7eb;font-weight:700;background:#f9fafb}
  .footer{text-align:center;color:#9ca3af;font-size:11px;margin-top:20px}
  @media print{.print-btn{display:none}}
</style></head><body>
<div class="brand">property.zapps</div>
<div class="meta">Transactions Report${filterLabel ? ' · ' + filterLabel : ''} · ${transactions.length} records</div>
<table>
  <thead><tr>
    <th>Date</th><th>Ref #</th><th>Tenant</th><th>Property</th><th>${roomLabel}</th><th>Notes</th><th>Amount</th>
  </tr></thead>
  <tbody>${rows}
    <tr class="total-row">
      <td colspan="6" style="text-align:right">Total</td>
      <td class="amount">${formatAmount(total)}</td>
    </tr>
  </tbody>
</table>
<div class="footer">Generated by property.zapps · ${new Date().toLocaleString()}</div>
<br/><div style="text-align:center">
  <button class="print-btn" onclick="window.print();window.close()" style="padding:8px 20px;background:#7c3aed;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px">
    🖨 Print
  </button>
</div>
</body></html>`)
  w.document.close()
  w.focus()
  setTimeout(() => { try { w.print() } catch { /* ignore */ } }, 400)
}

function exportCSV(
  transactions: Transaction[],
  tenantMap: Record<string,string>,
  roomMap: Record<string,string>,
  propertyMap: Record<string,string>,
  roomLabel = 'Room',
) {
  const headers = ['Date','Time','Ref #','Tenant','Property', roomLabel,'Notes','Amount']
  const rows = transactions.map(tx => [
    fmtDate(tx.created_at),
    fmtTime(tx.created_at),
    tx.id,
    tenantMap[tx.tenant_id] ?? tx.tenant_id,
    propertyMap[tx.property_id] ?? tx.property_id,
    roomMap[tx.room_id] ?? tx.room_id,
    `"${(tx.notes ?? '').replace(/"/g,'""')}"`,
    tx.amount.toFixed(2),
  ])
  const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `transactions-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── DateInput ────────────────────────────────────────────────────────────────

function FilterDateInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const openPicker = () => {
    const el = inputRef.current
    if (!el) return
    if (typeof (el as any).showPicker === 'function') {
      try { (el as any).showPicker() } catch { el.focus() }
    } else { el.focus() }
  }
  return (
    <div className="relative">
      <button
        type="button"
        onClick={openPicker}
        className={cn(
          'flex h-9 w-full items-center rounded-md border border-gray-200 bg-white px-3 text-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-stripe-purple/40',
          value ? 'text-stripe-text-primary font-medium' : 'text-gray-400'
        )}
      >
        {value ? fmtDate(value) : placeholder}
      </button>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 h-px w-px overflow-hidden opacity-0"
      />
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

const emptyForm = {
  minAmount: '', maxAmount: '',
  fromDate: '', toDate: '',
  propertyId: '', roomId: '', tenantId: '',
}

function TransactionsPage() {
  const fmt = useFormatMoney()
  const currencyCode = useAppStore((s) => s.currencyCode)
  const [form, setForm] = useState(emptyForm)
  const [debouncedFilters, setDebouncedFilters] = useState<TransactionFilters>({})
  const [tenantSearch, setTenantSearch] = useState('')
  const [showTenantDrop, setShowTenantDrop] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [sortCol, setSortCol] = useState<'date' | 'amount'>('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  // "Assigned only" tenant toggle — when true, only show currently-assigned tenants in dropdown
  const [assignedOnly, setAssignedOnly] = useState(false)

  const { properties } = useProperties()
  const { rooms } = useRooms(form.propertyId)
  // Always fetch ALL tenants for the selected property (no room filter here),
  // so past/unassigned tenants are visible in the dropdown
  const { tenants } = useTenants(form.propertyId || undefined)

  // "Room" vs "Unit" for the currently selected property
  const roomLabel = (properties.find(p => p.id === form.propertyId)?.type === 'House') ? 'Unit' : 'Room'

  // Name lookup maps
  const propertyMap = useMemo(() =>
    Object.fromEntries(properties.map(p => [p.id, p.name])), [properties])
  const roomMap = useMemo(() =>
    Object.fromEntries(rooms.map(r => [r.id, r.name])), [rooms])
  const tenantMap = useMemo(() =>
    Object.fromEntries(tenants.map(t => [t.id, `${t.first_name} ${t.last_name}`])), [tenants])

  const filteredTenants = useMemo(() => {
    const q = tenantSearch.toLowerCase()
    return tenants.filter(t => {
      const nameMatch = `${t.first_name} ${t.last_name}`.toLowerCase().includes(q)
      if (!nameMatch) return false
      if (assignedOnly) {
        // If a specific room is selected, only show tenants currently in that room
        if (form.roomId) return t.room_id === form.roomId
        // Otherwise show any currently-assigned tenant
        return t.room_id !== null
      }
      return true
    })
  }, [tenants, tenantSearch, assignedOnly, form.roomId])

  const errors: string[] = []
  if (form.minAmount && form.maxAmount && Number(form.minAmount) > Number(form.maxAmount))
    errors.push('Min amount cannot exceed max amount')
  if (form.fromDate && form.toDate && form.fromDate > form.toDate)
    errors.push('From date cannot be after To date')

  const hasFormValues = Object.values(form).some(v => v !== '')

  const handlePropertyChange = (v: string) => {
    setForm(prev => ({ ...prev, propertyId: v, roomId: '', tenantId: '' }))
    setTenantSearch('')
  }
  const handleRoomChange = (v: string) => {
    setForm(prev => ({ ...prev, roomId: v, tenantId: '' }))
    setTenantSearch('')
  }
  const handleReset = () => {
    setForm(emptyForm)
    setDebouncedFilters({})
    setTenantSearch('')
    setAssignedOnly(false)
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
    const t = setTimeout(() => setDebouncedFilters(f), 400)
    return () => clearTimeout(t)
  }, [form.minAmount, form.maxAmount, form.fromDate, form.toDate,
      form.propertyId, form.roomId, form.tenantId, errors.length])

  const hasFilters = Object.keys(debouncedFilters).length > 0
  const { transactions: rawTx, loading, error } = useTransactions(debouncedFilters, hasFilters)

  // Sorted transactions
  const transactions = useMemo(() => {
    const arr = [...rawTx]
    arr.sort((a, b) => {
      let cmp = 0
      if (sortCol === 'date') cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      else cmp = a.amount - b.amount
      return sortDir === 'asc' ? cmp : -cmp
    })
    return arr
  }, [rawTx, sortCol, sortDir])

  // Summary
  const total = useMemo(() => transactions.reduce((s, t) => s + t.amount, 0), [transactions])
  const avg = transactions.length ? total / transactions.length : 0
  const maxTx = transactions.length ? Math.max(...transactions.map(t => t.amount)) : 0

  // Filter label for print
  const filterLabel = [
    form.propertyId && propertyMap[form.propertyId],
    form.roomId && roomMap[form.roomId],
    form.tenantId && tenantMap[form.tenantId],
    form.fromDate && form.toDate && `${fmtDate(form.fromDate)} – ${fmtDate(form.toDate)}`,
    form.fromDate && !form.toDate && `From ${fmtDate(form.fromDate)}`,
    !form.fromDate && form.toDate && `To ${fmtDate(form.toDate)}`,
  ].filter(Boolean).join(' · ')

  const toggleSort = (col: 'date' | 'amount') => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('desc') }
  }

  const SortIcon = ({ col }: { col: 'date' | 'amount' }) =>
    sortCol === col
      ? sortDir === 'desc' ? <ChevronDown className="size-3 ml-0.5" /> : <ChevronUp className="size-3 ml-0.5" />
      : null

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Sticky page header ── */}
      <div className="sticky top-0 z-10 border-b border-stripe-border bg-white px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-stripe-text-primary sm:text-xl">Transactions</h1>
            {!loading && hasFilters && transactions.length > 0 && (
              <p className="text-xs text-stripe-text-secondary">
                {transactions.length} record{transactions.length !== 1 ? 's' : ''} · {fmt(total)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasFilters && !loading && transactions.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-8"
                  onClick={() => exportCSV(transactions, tenantMap, roomMap, propertyMap, roomLabel)}
                >
                  <Download className="size-3.5" />
                  <span className="hidden sm:inline">Export CSV</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs h-8"
                  onClick={() => printAllReceipts(transactions, tenantMap, roomMap, propertyMap, filterLabel, fmt, roomLabel)}
                >
                  <Printer className="size-3.5" />
                  <span className="hidden sm:inline">Print All</span>
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs h-8 text-stripe-text-secondary"
              onClick={() => setFiltersOpen(v => !v)}
            >
              <Filter className="size-3.5" />
              {filtersOpen ? 'Hide' : 'Filters'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── Filter panel ── */}
        {filtersOpen && (
          <div className="border-b border-stripe-border bg-stripe-sidebar px-4 py-4 sm:px-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">

              {/* Property */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-stripe-text-secondary">Property</label>
                <select
                  className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-stripe-purple/40"
                  value={form.propertyId}
                  onChange={e => handlePropertyChange(e.target.value)}
                >
                  <option value="">All Properties</option>
                  {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {/* Room / Unit */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-stripe-text-secondary">{roomLabel}</label>
                <select
                  className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-stripe-purple/40 disabled:opacity-50"
                  value={form.roomId}
                  onChange={e => handleRoomChange(e.target.value)}
                  disabled={!form.propertyId}
                >
                  <option value="">All {roomLabel}s</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              {/* Tenant */}
              <div className="space-y-1 relative">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-stripe-text-secondary">Tenant</label>
                  {form.propertyId && (
                    <button
                      type="button"
                      onClick={() => { setAssignedOnly(v => !v); setForm(p => ({ ...p, tenantId: '' })); setTenantSearch('') }}
                      className={cn(
                        'text-[10px] font-medium px-1.5 py-0.5 rounded-full border transition-colors',
                        assignedOnly
                          ? 'border-stripe-purple/40 bg-stripe-purple/10 text-stripe-purple'
                          : 'border-gray-200 bg-white text-gray-400 hover:text-gray-600'
                      )}
                    >
                      {assignedOnly ? 'Assigned only' : 'All tenants'}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={form.propertyId ? 'Search tenant…' : 'Select a property first'}
                    disabled={!form.propertyId}
                    value={tenantSearch}
                    onChange={e => {
                      setTenantSearch(e.target.value)
                      if (form.tenantId) setForm(p => ({ ...p, tenantId: '' }))
                      setShowTenantDrop(true)
                    }}
                    onFocus={() => !form.tenantId && setShowTenantDrop(true)}
                    onBlur={() => setTimeout(() => setShowTenantDrop(false), 150)}
                    className="h-9 w-full rounded-md border border-gray-200 bg-white pl-8 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-stripe-purple/40 disabled:opacity-50"
                  />
                  {form.tenantId && (
                    <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onMouseDown={e => { e.preventDefault(); setForm(p => ({ ...p, tenantId: '' })); setTenantSearch('') }}>
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
                {showTenantDrop && !form.tenantId && filteredTenants.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-md">
                    {filteredTenants.map(t => (
                      <button key={t.id} className="w-full px-3 py-2 text-left text-sm hover:bg-stripe-sidebar transition-colors"
                        onMouseDown={e => {
                          e.preventDefault()
                          setForm(p => ({ ...p, tenantId: t.id }))
                          setTenantSearch(`${t.first_name} ${t.last_name}`)
                          setShowTenantDrop(false)
                        }}>
                        <span className="font-medium">{t.first_name} {t.last_name}</span>
                        {t.room_id
                          ? <span className="ml-2 text-[10px] text-gray-400">{roomMap[t.room_id] ?? roomLabel}</span>
                          : <span className="ml-2 text-[10px] font-medium text-amber-500">Unassigned</span>
                        }
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* From date */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-stripe-text-secondary">From Date</label>
                <FilterDateInput value={form.fromDate} onChange={v => setForm(p => ({ ...p, fromDate: v }))} placeholder="Any start date" />
              </div>

              {/* To date */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-stripe-text-secondary">To Date</label>
                <FilterDateInput value={form.toDate} onChange={v => setForm(p => ({ ...p, toDate: v }))} placeholder="Any end date" />
              </div>

              {/* Min amount */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-stripe-text-secondary">Min amount ({currencyCode})</label>
                <input type="number" min="0" step="0.01" placeholder="0.00"
                  value={form.minAmount}
                  onChange={e => setForm(p => ({ ...p, minAmount: e.target.value }))}
                  className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-stripe-purple/40" />
              </div>

              {/* Max amount */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-stripe-text-secondary">Max amount ({currencyCode})</label>
                <input type="number" min="0" step="0.01" placeholder="0.00"
                  value={form.maxAmount}
                  onChange={e => setForm(p => ({ ...p, maxAmount: e.target.value }))}
                  className={cn('h-9 w-full rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-stripe-purple/40',
                    errors.some(e => e.includes('amount')) ? 'border-red-400' : 'border-gray-200')} />
              </div>
            </div>

            {/* Error + clear row */}
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                {errors.map((e, i) => (
                  <span key={i} className="text-xs text-red-500">{e}</span>
                ))}
              </div>
              {hasFormValues && (
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-stripe-text-secondary shrink-0" onClick={handleReset}>
                  <X className="size-3" /> Clear all
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ── Summary strip ── */}
        {hasFilters && !loading && transactions.length > 0 && (
          <div className="grid grid-cols-3 divide-x divide-stripe-border border-b border-stripe-border bg-white">
            {[
              { label: 'Total Collected', value: fmt(total), accent: true },
              { label: 'Transactions', value: String(transactions.length) },
              { label: 'Average Payment', value: fmt(avg) },
            ].map(stat => (
              <div key={stat.label} className="px-4 py-3 sm:px-6">
                <p className="text-[11px] font-medium uppercase tracking-wider text-stripe-text-secondary">{stat.label}</p>
                <p className={cn('mt-0.5 text-lg font-bold tabular-nums', stat.accent ? 'text-emerald-700' : 'text-stripe-text-primary')}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Content ── */}
        {errors.length > 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <p className="text-sm">Fix the filter errors above to search</p>
          </div>
        ) : !hasFilters ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Filter className="mb-3 size-10 opacity-30" />
            <p className="text-sm font-medium">Apply a filter to load transactions</p>
            <p className="mt-1 text-xs">Select a property, date range, tenant, or {roomLabel.toLowerCase()} above</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-md bg-gray-100" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500">
            <p className="text-sm">{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Receipt className="mb-3 size-10 opacity-30" />
            <p className="text-sm">No transactions match the selected filters</p>
          </div>
        ) : (
          /* ── Table ── */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-stripe-border bg-stripe-sidebar">
                  <th className="px-4 py-2.5 text-left">
                    <button className="flex items-center text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary hover:text-stripe-text-primary"
                      onClick={() => toggleSort('date')}>
                      Date <SortIcon col="date" />
                    </button>
                  </th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary">Ref #</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary">Tenant</th>
                  <th className="hidden px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary sm:table-cell">Property / {roomLabel}</th>
                  <th className="hidden px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary lg:table-cell">Notes</th>
                  <th className="px-4 py-2.5 text-right">
                    <button className="flex items-center ml-auto text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary hover:text-stripe-text-primary"
                      onClick={() => toggleSort('amount')}>
                      Amount <SortIcon col="amount" />
                    </button>
                  </th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => {
                  const tenantName = tenantMap[tx.tenant_id] ?? `#${tx.tenant_id}`
                  const propName   = propertyMap[tx.property_id] ?? `P${tx.property_id}`
                  const roomName   = roomMap[tx.room_id] ?? `R${tx.room_id}`
                  const isLarge    = tx.amount >= maxTx * 0.9 && maxTx > 0

                  return (
                    <tr key={tx.id} className="group border-b border-gray-100 transition-colors hover:bg-gray-50">
                      {/* Date */}
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-stripe-text-primary">{fmtDate(tx.created_at)}</p>
                        <p className="text-[11px] text-stripe-text-secondary">{fmtTime(tx.created_at)}</p>
                      </td>

                      {/* Ref */}
                      <td className="px-4 py-3 font-mono text-xs text-stripe-text-secondary">#{tx.id}</td>

                      {/* Tenant */}
                      <td className="px-4 py-3 text-sm font-medium text-stripe-text-primary">{tenantName}</td>

                      {/* Property / Room */}
                      <td className="hidden px-4 py-3 sm:table-cell">
                        <p className="text-sm text-stripe-text-primary">{propName}</p>
                        <p className="text-[11px] text-stripe-text-secondary">{roomName}</p>
                      </td>

                      {/* Notes */}
                      <td className="hidden px-4 py-3 lg:table-cell">
                        {tx.notes
                          ? <span className="text-sm text-stripe-text-primary">{tx.notes}</span>
                          : <span className="text-sm text-gray-300">—</span>
                        }
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 text-right">
                        <span className={cn(
                          'font-mono text-sm font-semibold tabular-nums',
                          isLarge ? 'text-emerald-600' : 'text-stripe-text-primary'
                        )}>
                          {fmt(tx.amount)}
                        </span>
                      </td>

                      {/* Print receipt */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => printReceipt(tx, tenantName, roomName, propName, fmt, roomLabel)}
                          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-stripe-text-secondary transition-colors hover:bg-stripe-purple/10 hover:text-stripe-purple"
                          title="Print receipt"
                        >
                          <Printer className="size-3.5" />
                          <span className="hidden sm:inline">Receipt</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>

              {/* Footer total */}
              <tfoot>
                <tr className="border-t-2 border-stripe-border bg-stripe-sidebar">
                  <td colSpan={5} className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary">
                    Total ({transactions.length})
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-sm font-bold text-emerald-700 tabular-nums">
                    {fmt(total)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
