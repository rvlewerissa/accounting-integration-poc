import { useQuery } from '@tanstack/react-query';
import { fetchQBStatus } from '../api/quickbooks';
import { QUERY_KEYS } from '../config/constants';

export function useQBStatus() {
  const query = useQuery({
    queryKey: QUERY_KEYS.QB_STATUS,
    queryFn: fetchQBStatus,
  });

  return {
    ...query,
    connected: query.data?.connected ?? false,
    companies: query.data?.companies ?? [],
    scopes: query.data?.scopes ?? null,
  };
}
