import { getAccessToken } from '../utils/token.utils';

const API_BASE = 'http://localhost:4000';

export const apiClient = async (endpoint: string, options?: RequestInit) => {
  const token = getAccessToken();

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'API request failed');
  }

  return response.json();
};
