import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Building2, Edit2, Trash2, X, Check, Loader2, Plus, Home,
  Hotel, BedDouble, House,
} from 'lucide-react'
import { useProperties } from '../hooks/useProperties'
import { AddPropertyDialog } from '../components/dashboard/AddPropertyDialog'
import { cn, parseApiError } from '../lib/utils'
import { Button } from '../components/ui/button'
import type { Property, PropertyType } from '../types'

export const Route = createFileRoute('/properties')({
  component: PropertiesPage,
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: 'BoardingHouse', label: 'Boarding House' },
  { value: 'Lodge', label: 'Lodge' },
  { value: 'Hotel', label: 'Hotel' },
  { value: 'Hostel', label: 'Hostel' },
  { value: 'House', label: 'House' },
]

const TYPE_META: Record<PropertyType, { icon: React.ReactNode; color: string }> = {
  BoardingHouse: { icon: <BedDouble className="size-3" />, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  Lodge:         { icon: <Building2 className="size-3" />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  Hotel:         { icon: <Hotel className="size-3" />,     color: 'bg-amber-50 text-amber-700 border-amber-200' },
  Hostel:        { icon: <Home className="size-3" />,      color: 'bg-teal-50 text-teal-700 border-teal-200' },
  House:         { icon: <House className="size-3" />,     color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
}

function TypeBadge({ type }: { type: PropertyType }) {
  const meta = TYPE_META[type] ?? TYPE_META.BoardingHouse
  const label = PROPERTY_TYPES.find(t => t.value === type)?.label ?? type
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
      meta.color
    )}>
      {meta.icon}
      {label}
    </span>
  )
}

// ─── Inline edit row ──────────────────────────────────────────────────────────

interface EditRowProps {
  property: Property
  onSave: (name: string, type: PropertyType) => Promise<void>
  onCancel: () => void
  isSaving: boolean
}

function EditRow({ property, onSave, onCancel, isSaving }: EditRowProps) {
  const [name, setName] = useState(property.name)
  const [type, setType] = useState<PropertyType>(property.type)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required.'); return }
    setError(null)
    try {
      await onSave(name.trim(), type)
    } catch (err) {
      setError(parseApiError(err, 'Failed to update property.'))
    }
  }

  return (
    <div className="border-b border-stripe-border bg-stripe-purple-light/30 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel() }}
          className="h-8 flex-1 min-w-[140px] rounded-md border border-stripe-border bg-white px-2.5 text-sm text-stripe-text-primary focus:outline-none focus:ring-2 focus:ring-stripe-purple/40"
          placeholder="Property name"
        />
        <select
          value={type}
          onChange={e => setType(e.target.value as PropertyType)}
          className="h-8 rounded-md border border-stripe-border bg-white px-2 text-sm text-stripe-text-primary focus:outline-none focus:ring-2 focus:ring-stripe-purple/40"
        >
          {PROPERTY_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          <Button size="sm" className="h-8 gap-1 text-xs" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3" />}
            Save
          </Button>
          <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={onCancel} disabled={isSaving}>
            <X className="size-3" />
          </Button>
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────

interface DeleteDialogProps {
  property: Property
  onConfirm: () => Promise<void>
  onCancel: () => void
  isDeleting: boolean
}

function DeleteDialog({ property, onConfirm, onCancel, isDeleting }: DeleteDialogProps) {
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setError(null)
    try {
      await onConfirm()
    } catch (err) {
      setError(parseApiError(err, 'Failed to delete property.'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl border border-stripe-border bg-white shadow-xl">
        <div className="px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100">
              <Trash2 className="size-4 text-red-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-stripe-text-primary">Delete property?</h3>
              <p className="mt-1 text-xs text-stripe-text-secondary">
                <span className="font-medium text-stripe-text-primary">"{property.name}"</span> and all its
                rooms, tenants, and transactions will be permanently deleted. This cannot be undone.
              </p>
            </div>
          </div>
          {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
        </div>
        <div className="flex justify-end gap-2 border-t border-stripe-border px-5 py-3">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 bg-red-600 text-xs hover:bg-red-700 focus:ring-red-500"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="size-3 animate-spin" /> : <Trash2 className="size-3" />}
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Property row ─────────────────────────────────────────────────────────────

interface PropertyRowProps {
  property: Property
  onEdit: () => void
  onDelete: () => void
}

function PropertyRow({ property, onEdit, onDelete }: PropertyRowProps) {
  return (
    <div className="group grid grid-cols-[1fr_auto] gap-2 border-b border-gray-100 px-4 py-3 transition-colors hover:bg-gray-50 last:border-0 sm:grid-cols-[2fr_1fr_auto_auto_auto]">
      {/* Name */}
      <div className="flex items-center gap-2 min-w-0">
        <div className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg border',
          TYPE_META[property.type]?.color ?? 'bg-gray-50 text-gray-500 border-gray-200'
        )}>
          {TYPE_META[property.type]?.icon ?? <Building2 className="size-3.5" />}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-stripe-text-primary">{property.name}</p>
          {/* Type shown on mobile since Type column is hidden */}
          <div className="sm:hidden">
            <TypeBadge type={property.type} />
          </div>
        </div>
      </div>

      {/* Type badge — desktop */}
      <div className="hidden sm:flex items-center">
        <TypeBadge type={property.type} />
      </div>

      {/* Room count */}
      <div className="hidden sm:flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-md bg-stripe-sidebar px-2 py-1 text-xs font-medium text-stripe-text-secondary">
          {property.room_count ?? 0}
          <span className="text-stripe-text-secondary/60">
            {property.type === 'House' ? 'units' : 'rooms'}
          </span>
        </span>
      </div>

      {/* Tenant count */}
      <div className="hidden sm:flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-md bg-stripe-sidebar px-2 py-1 text-xs font-medium text-stripe-text-secondary">
          {property.tenant_count ?? 0}
          <span className="text-stripe-text-secondary/60">tenants</span>
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
        <button
          onClick={onEdit}
          title="Edit"
          className="flex size-7 items-center justify-center rounded-md text-stripe-text-secondary transition-colors hover:bg-stripe-purple/10 hover:text-stripe-purple"
        >
          <Edit2 className="size-3.5" />
        </button>
        <button
          onClick={onDelete}
          title="Delete"
          className="flex size-7 items-center justify-center rounded-md text-stripe-text-secondary transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── PropertiesPage ───────────────────────────────────────────────────────────

function PropertiesPage() {
  const { properties, loading, updateProperty, isUpdating, deleteProperty, isDeleting } = useProperties()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null)

  const handleSave = async (id: string, name: string, type: PropertyType) => {
    await updateProperty(id, name, type)
    setEditingId(null)
  }

  const handleDelete = async (property: Property) => {
    await deleteProperty(property.id)
    setDeletingProperty(null)
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Sticky header */}
        <div className="sticky top-0 z-10 border-b border-stripe-border bg-white">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div>
              <h1 className="text-lg font-bold text-stripe-text-primary sm:text-xl">Properties</h1>
              {!loading && (
                <p className="text-xs text-stripe-text-secondary">
                  {properties.length} {properties.length === 1 ? 'property' : 'properties'}
                </p>
              )}
            </div>
            <AddPropertyDialog />
          </div>

          {/* Column headers — desktop */}
          <div className="hidden sm:grid grid-cols-[2fr_1fr_auto_auto_auto] gap-2 border-t border-stripe-border bg-stripe-sidebar px-4 py-2 text-xs font-semibold uppercase tracking-wider text-stripe-text-secondary sm:px-6">
            <div>Name</div>
            <div>Type</div>
            <div className="w-20 text-center">Rooms</div>
            <div className="w-20 text-center">Tenants</div>
            <div className="w-16 text-right">Actions</div>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-md bg-gray-100" />
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-stripe-text-secondary">
              <Building2 className="mb-3 size-10 opacity-30" />
              <p className="text-sm font-medium">No properties yet</p>
              <p className="mt-1 text-xs">Add your first property to get started.</p>
            </div>
          ) : (
            properties.map(property => (
              <div key={property.id}>
                {editingId === property.id ? (
                  <EditRow
                    property={property}
                    onSave={(name, type) => handleSave(property.id, name, type)}
                    onCancel={() => setEditingId(null)}
                    isSaving={isUpdating}
                  />
                ) : (
                  <PropertyRow
                    property={property}
                    onEdit={() => setEditingId(property.id)}
                    onDelete={() => setDeletingProperty(property)}
                  />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete confirm dialog */}
      {deletingProperty && (
        <DeleteDialog
          property={deletingProperty}
          onConfirm={() => handleDelete(deletingProperty)}
          onCancel={() => setDeletingProperty(null)}
          isDeleting={isDeleting}
        />
      )}
    </>
  )
}
