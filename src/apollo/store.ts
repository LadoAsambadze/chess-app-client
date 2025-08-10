import { makeVar } from '@apollo/client';

export const userVar = makeVar<any | null>(null);
export const isAuthenticatedVar = makeVar<boolean>(false);
