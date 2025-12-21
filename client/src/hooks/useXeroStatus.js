import { useQuery } from '@tanstack/react-query';
import { fetchXeroStatus } from '../api/xero';
import { QUERY_KEYS } from '../config/constants';

export function useXeroStatus() {
  const query = useQuery({
    queryKey: QUERY_KEYS.XERO_STATUS,
    queryFn: fetchXeroStatus,
  });

  return {
    ...query,
    connected: query.data?.connected ?? false,
    tenants: query.data?.tenants ?? [],
    accessToken: query.data?.access_token ?? null,
    refreshToken: query.data?.refresh_token ?? null,
    scopes: query.data?.scopes ?? null,
  };
}
