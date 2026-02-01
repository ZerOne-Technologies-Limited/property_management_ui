import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchRooms, createRoom, updateRoom } from '../api/axios';
import type { CreateRoomPayload, UpdateRoomPayload } from '../types';

export function useRooms(propertyId: string) {
    const queryClient = useQueryClient();

    const { data: rooms = [], isLoading: loading, error } = useQuery({
        queryKey: ['rooms', propertyId],
        queryFn: () => fetchRooms(propertyId),
        enabled: !!propertyId, // Only fetch if propertyId is provided
    });

    const { mutateAsync: addRoom, isPending: isAddingRoom } = useMutation({
        mutationFn: (payload: CreateRoomPayload) => createRoom(propertyId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rooms', propertyId] });
        },
    });

    const { mutateAsync: updateRoomAsync, mutate: updateRoomMutate, isPending: isUpdatingRoom } = useMutation({
        mutationFn: ({ roomId, payload }: { roomId: string; payload: UpdateRoomPayload }) =>
            updateRoom(propertyId, roomId, payload),
        onSuccess: async (updatedRoom) => {
            console.log('Room update successful, updated room:', updatedRoom);
            console.log('Refetching all room queries');
            // Force refetch ALL room queries (not just specific propertyId)
            await queryClient.refetchQueries({ queryKey: ['rooms'] });
            console.log('Refetch complete');
        },
    });

    return {
        rooms,
        loading,
        error: error ? (error instanceof Error ? error.message : 'Failed to fetch rooms') : null,
        addRoom,
        isAddingRoom,
        updateRoom: updateRoomMutate,
        updateRoomAsync,
        isUpdatingRoom
    };
}
