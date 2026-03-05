import { AuthenticatedMember, MaybeAuthenticatedMember } from '../types';

const storeKey = 'authenticatedMember';

export const storeAuthenticatedMember = (member: AuthenticatedMember, rememberMe: boolean) => {
  const memberJson = JSON.stringify(member);
  if (rememberMe) {
    localStorage.setItem(storeKey, memberJson);
  } else {
    sessionStorage.setItem(storeKey, memberJson);
  }
};

export const getAuthenticatedMember = (): MaybeAuthenticatedMember => {
  const memberJson = localStorage.getItem(storeKey) || sessionStorage.getItem(storeKey);
  if (!memberJson) return undefined;
  return JSON.parse(memberJson);
};

export const clearAuthenticatedMember = () => {
  localStorage.removeItem(storeKey);
  sessionStorage.removeItem(storeKey);
};

export const getToken = (): string | undefined => {
  const member = getAuthenticatedMember();
  return member?.token;
};
