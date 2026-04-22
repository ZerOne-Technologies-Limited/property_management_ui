import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PropertyType } from '../types';
import { createProperty, fetchProperties, updateProperty as apiUpdateProperty, deleteProperty as apiDeleteProperty } from '../api/axios';
import { useAppStore } from '../lib/store';

export function useProperties() {
  const queryClient = useQueryClient();
  const selectedPropertyId = useAppStore(state => state.selectedPropertyId);

  const { data: properties = [], isLoading: loading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
  });

  const { isPending: isCreating, mutateAsync: addProperty } = useMutation({
    mutationFn: async ({ name, type }: { name: string; type: PropertyType }) => {
      return createProperty({ Name: name, PropertyType: type });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const { isPending: isUpdating, mutateAsync: doUpdateProperty } = useMutation({
    mutationFn: async ({ id, name, type }: { id: string; name: string; type: PropertyType }) => {
      await apiUpdateProperty(id, name, type);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const { isPending: isDeleting, mutateAsync: doDeleteProperty } = useMutation({
    mutationFn: async (id: string) => {
      await apiDeleteProperty(id);
    },
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      // Clear selected property if it was deleted
      if (selectedPropertyId === id) {
        useAppStore.setState({ selectedPropertyId: null });
      }
    },
  });

  const refetch = async () => {
    return queryClient.invalidateQueries({ queryKey: ['properties'] });
  };

  return {
    properties,
    loading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch properties') : null,
    refetch,
    addProperty: (name: string, type: PropertyType) => addProperty({ name, type }),
    isCreating,
    updateProperty: (id: string, name: string, type: PropertyType) => doUpdateProperty({ id, name, type }),
    isUpdating,
    deleteProperty: (id: string) => doDeleteProperty(id),
    isDeleting,
  };
}
