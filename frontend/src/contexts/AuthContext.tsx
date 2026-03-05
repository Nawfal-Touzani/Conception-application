import { createContext, useState, ReactNode, useEffect } from 'react';
import { AuthContextType, MaybeAuthenticatedMember, MemberRegisterRequest, Credentials, AuthenticatedMember } from '../types';
import { clearAuthenticatedMember, storeAuthenticatedMember, getAuthenticatedMember, getToken } from '../utils/session';

const defaultAuthContext: AuthContextType = {
  authenticatedMember: undefined,
  registerMember: async () => {},
  loginMember: async () => {},
  clearMember: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
  const[authenticatedMember, setAuthenticatedMember] = useState<MaybeAuthenticatedMember>(undefined);

  // REFRESH
  useEffect(() => {
    const fetchMe = async () => {
      const token = getToken();
      if (token) {
        try {
          const response = await fetch('/api/auths/me', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const refreshedMember: AuthenticatedMember = await response.json();
            const rememberMe = localStorage.getItem('authenticatedMember') !== null;
            setAuthenticatedMember(refreshedMember);
            storeAuthenticatedMember(refreshedMember, rememberMe);
          } else {
            clearMember();
          }
        } catch (err) {
          console.error("Erreur lors de l'auto-login", err);
          clearMember();
        }
      }
    };
    fetchMe();
  },[]);

  // REGISTER
  const registerMember = async (newMember: MemberRegisterRequest) => {
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify(newMember),
        headers: { 'Content-Type': 'application/json' },
      };
      const response = await fetch('/api/auths/register', options);
      if (!response.ok) {
        throw new Error(`fetch error : ${response.status} : ${response.statusText}`);
      }
    } catch (err) {
      console.error('registerMember::error: ', err);
      throw err;
    }
  };

  // LOGIN
  const loginMember = async (credentials: Credentials, rememberMe: boolean) => {
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: { 'Content-Type': 'application/json' },
      };
      const response = await fetch('/api/auths/login', options);
      if (!response.ok) {
        throw new Error(`fetch error : ${response.status} : ${response.statusText}`);
      }
      
      const authMember: AuthenticatedMember = await response.json();
      setAuthenticatedMember(authMember);
      storeAuthenticatedMember(authMember, rememberMe);
      
    } catch (err) {
      console.error('loginMember::error: ', err);
      throw err;
    }
  };

  // LOGOUT
  const clearMember = () => {
    clearAuthenticatedMember();
    setAuthenticatedMember(undefined);
  };

  const contextValue: AuthContextType = {
    authenticatedMember,
    registerMember,
    loginMember,
    clearMember,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
