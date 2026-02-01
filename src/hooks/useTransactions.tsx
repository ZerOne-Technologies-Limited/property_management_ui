import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTransactions, createTransaction } from '../api/axios';

export function useTransactions(propertyId?: string, roomId?: string, tenantId?: string) {
    const queryClient = useQueryClient();

    const { data: transactions = [], isLoading: loading, error } = useQuery({
        queryKey: ['transactions', propertyId, roomId, tenantId],
        queryFn: () => fetchTransactions(propertyId, roomId, tenantId),
    });

    const { mutateAsync: addTransaction, isPending: isAddingTransaction } = useMutation({
        mutationFn: (payload: import('../types').CreateTransactionPayload) => createTransaction(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        },
    });

    return {
        transactions,
        loading,
        error: error ? (error instanceof Error ? error.message : 'Failed to fetch transactions') : null,
        addTransaction,
        isAddingTransaction
    };
}
