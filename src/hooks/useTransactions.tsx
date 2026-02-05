import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTransactions, createTransaction } from '../api/axios';
import type { TransactionFilters } from '../types';

export function useTransactions(filters: TransactionFilters = {}, enabled: boolean = true) {
    const queryClient = useQueryClient();

    const { data: transactions = [], isLoading: loading, error } = useQuery({
        queryKey: ['transactions', filters],
        queryFn: () => fetchTransactions(filters),
        enabled,
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
