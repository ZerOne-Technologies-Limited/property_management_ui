import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PropertyType } from '../types';
import { createProperty, fetchProperties } from '../api/axios';

export function useProperties() {
  const queryClient = useQueryClient();

  const { data: properties = [], isLoading: loading, error } = useQuery({
    queryKey: ['properties'],
    queryFn: fetchProperties,
  });

  const { isPending: isCreating, mutateAsync: addProperty } = useMutation({
    mutationFn: async ({ name, type }: { name: string; type: PropertyType }) => {
      return createProperty({ name, type });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
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
    isCreating
  };
}
