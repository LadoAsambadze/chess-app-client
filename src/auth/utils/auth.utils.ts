// utils/auth.utils.ts

import type { User } from '../types/auth.types';

/**
 * Decodes a JWT token and returns the payload
 * @param token - The JWT token to decode
 * @returns The decoded payload or null if invalid
 */
export const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

/**
 * Checks if a JWT token is expired
 * @param token - The JWT token to check
 * @param bufferSeconds - Buffer time in seconds before considering token expired (default: 30)
 * @returns True if token is expired, false otherwise
 */
export const isTokenExpired = (token: string, bufferSeconds = 30): boolean => {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return true;
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime + bufferSeconds;
  } catch {
    return true;
  }
};

export const getUserFromToken = (token: string): User | null => {
  const payload = decodeJWT(token);
  if (!payload) return null;

  return {
    id: payload.sub,
    email: payload.email,
    firstname: payload.firstname || '',
    lastname: payload.lastname || '',
    avatar: payload.avatar,
    role: payload.role,
  };
};

/**
 * Storage utilities for handling tokens
 */
export const tokenStorage = {
  /**
   * Get access token from localStorage
   */
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  /**
   * Set access token in localStorage
   */
  setAccessToken: (token: string): void => {
    localStorage.setItem('accessToken', token);
  },

  /**
   * Remove access token from localStorage
   */
  removeAccessToken: (): void => {
    localStorage.removeItem('accessToken');
  },

  /**
   * Check if there's a valid stored token
   */
  hasValidStoredToken: (): boolean => {
    const token = tokenStorage.getAccessToken();
    return token ? !isTokenExpired(token) : false;
  },
};

/**
 * Validates if an error is authentication-related
 * @param errors - Array of GraphQL errors
 * @returns True if any error is authentication-related
 */
export const isAuthError = (errors: any[]): boolean => {
  return errors.some(
    (error) =>
      error.message.includes('refresh token') ||
      error.message.includes('not found') ||
      error.message.includes('expired') ||
      error.message.includes('invalid') ||
      error.message.includes('unauthorized') ||
      error.extensions?.code === 'UNAUTHENTICATED'
  );
};
