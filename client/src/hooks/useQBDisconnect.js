import { useMutation, useQueryClient } from '@tanstack/react-query';
import { disconnectQB, disconnectAllQB } from '../api/quickbooks';
import { QUERY_KEYS } from '../config/constants';

export function useQBDisconnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (realmId) => disconnectQB(realmId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QB_STATUS });
    },
  });
}

export function useQBDisconnectAll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectAllQB,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QB_STATUS });
    },
  });
}
