import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { PropertyType } from '../types';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, type: PropertyType) => Promise<void>;
}

export default function AddPropertyModal({ isOpen, onClose, onAdd }: AddPropertyModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'BoardingHouse' as PropertyType,
  });
  const [loading, setLoading] = useState(false);

  const propertyTypes: PropertyType[] = ['BoardingHouse', 'Lodge', 'Hotel', 'Hostel'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setLoading(true);
      await onAdd(formData.name, formData.type);
      setFormData({ name: '', type: 'BoardingHouse' });
      onClose();
    } catch (error) {
      alert('Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-2xl z-50">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create New Property</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Sunset Boarding House"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as PropertyType })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {propertyTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {loading ? 'Creating...' : 'Create Property'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
