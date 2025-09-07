import { useState, useEffect } from 'react';
import apiClientAxios from '../../api/api-client-axios';
import { getAccessToken } from '../../utils/token.utils';
import type { User } from '../../providers/auth-provider/types/User';

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClientAxios.get<User>('/auth/me', {
        headers: {
          Authorization: `Bearer ${getAccessToken()}`,
        },
      });
      setUser(response.data);
    } catch (err: any) {
      console.error('Error fetching current user:', err);
      setError(err?.response?.data?.message || 'Failed to load current user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (getAccessToken()) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  return { user, loading, error, refetch: fetchCurrentUser };
}
