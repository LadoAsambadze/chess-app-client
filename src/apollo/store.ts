import { makeVar } from '@apollo/client';

// Only store user data and auth state - no tokens!
export const userVar = makeVar<any | null>(null);
export const isAuthenticatedVar = makeVar<boolean>(false);
