import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTenants, registerTenant, updateTenant, unassignTenantFromRoom } from '../api/axios';

export function useTenants(propertyId?: string, roomId?: string) {
    const queryClient = useQueryClient();

    const { data: tenants = [], isLoading: loading, error } = useQuery({
        queryKey: ['tenants', propertyId, roomId],
        queryFn: () => fetchTenants(propertyId, roomId),
    });

    const { mutateAsync: addTenant, isPending: isAddingTenant } = useMutation({
        mutationFn: (payload: { propertyId: string } & import('../types').RegisterTenantPayload) => registerTenant(payload.propertyId, payload),
        onSuccess: () => {
            // Invalidate specific room query if roomId was used in this hook
            queryClient.invalidateQueries({ queryKey: ['tenants'] });
            queryClient.invalidateQueries({ queryKey: ['rooms'] });
            // We generally invalidate key 'tenants' to cover all combos or we could be more specific
        },
    });

    const { mutateAsync: updateTenantAsync, mutate: updateTenantMutate, isPending: isUpdatingTenant } = useMutation({
        mutationFn: ({ tenantId, payload }: { tenantId: string; payload: import('../types').UpdateTenantPayload }) =>
            updateTenant(tenantId, payload),
        onSuccess: async () => {
            // Force refetch instead of just invalidating
            await queryClient.refetchQueries({ queryKey: ['tenants'] });
            await queryClient.refetchQueries({ queryKey: ['rooms'] });
        },
    });

    const { mutateAsync: unassignFromRoom, isPending: isUnassigning } = useMutation({
        mutationFn: (tenantId: string) => unassignTenantFromRoom(tenantId),
        onSuccess: async () => {
            await queryClient.refetchQueries({ queryKey: ['tenants'] });
            await queryClient.refetchQueries({ queryKey: ['rooms'] });
        },
    });

    return {
        tenants,
        loading,
        error: error ? (error instanceof Error ? error.message : 'Failed to fetch tenants') : null,
        addTenant,
        isAddingTenant,
        updateTenant: updateTenantMutate,
        updateTenantAsync,
        isUpdatingTenant,
        unassignFromRoom,
        isUnassigning,
    };
}
