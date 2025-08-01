import { makeVar } from '@apollo/client';

// Store only in memory - no localStorage
export const accessTokenVar = makeVar<string>('');
export const userVar = makeVar<any | null>(null);
export const isAuthenticatedVar = makeVar<boolean>(false);
