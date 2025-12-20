import { useMutation, useQueryClient } from '@tanstack/react-query';
import { disconnectXero } from '../api/xero';
import { QUERY_KEYS } from '../config/constants';

export function useXeroDisconnect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectXero,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.XERO_STATUS });
    },
  });
}
