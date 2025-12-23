import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getQBAuthUrl } from '../api/quickbooks';
import { QUERY_KEYS, AUTH_POPUP_CONFIG } from '../config/constants';

export function useQBAuth() {
  const queryClient = useQueryClient();
  const [popupError, setPopupError] = useState(null);

  useEffect(() => {
    function handleMessage(event) {
      if (event.data.type === 'QB_AUTH_SUCCESS') {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.QB_STATUS });
        setPopupError(null);
      } else if (event.data.type === 'QB_AUTH_ERROR') {
        setPopupError('Authorization failed: ' + event.data.error);
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [queryClient]);

  const connect = useCallback(() => {
    const { width, height } = AUTH_POPUP_CONFIG;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      getQBAuthUrl(),
      'quickbooks-auth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      setPopupError('Popup blocked! Please allow popups for this site.');
    }
  }, []);

  const clearError = useCallback(() => setPopupError(null), []);

  return {
    connect,
    popupError,
    clearError,
  };
}
