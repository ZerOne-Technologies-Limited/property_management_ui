import { useState, useEffect } from 'react';
import type { Property, PropertyType } from '../types';
import { createProperty, fetchProperties } from '../api/axios';

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await fetchProperties();

      if (error) throw error;
      setProperties(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const addProperty = async (name: string, type: PropertyType) => {
    try {
      await createProperty({ name, type });

      if (error) throw error;
      await loadProperties();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create property');
    }
  };

  return { properties, loading, error, refetch: loadProperties, addProperty };
}
