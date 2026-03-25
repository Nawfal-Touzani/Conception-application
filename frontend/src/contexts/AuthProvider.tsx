import { useState, useEffect, ReactNode } from 'react';
import {
  AuthenticatedMember,
  LoginCredentials,
  RegisterCredentials,
} from '../types/auth.types';
import * as authService from '../services/auth/auth.service';
import { AuthContext } from './AuthContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthenticatedMember | null>(null);
  const [bannedError, setBannedError] = useState<string | null>(null); // State to hold any error message related to account banning

  useEffect(() => {
    const autoLogin = async () => {
      const savedToken =
        localStorage.getItem('jwt_token') ||
        sessionStorage.getItem('jwt_token');
      if (savedToken) {
        try {
          const refreshedUser = await authService.getMe(savedToken);
          setUser(refreshedUser);
          if (localStorage.getItem('jwt_token')) {
            localStorage.setItem('jwt_token', refreshedUser.token);
          } else {
            sessionStorage.setItem('jwt_token', refreshedUser.token);
          }
        } catch (error) {
          localStorage.removeItem('jwt_token');
          sessionStorage.removeItem('jwt_token');
          setUser(null);
          // We inform the user if their account is banned
          if (error instanceof Error) {
            setBannedError(error.message);
          }
        }
      }
    };

    autoLogin();
  }, []);

  const login = async (credentials: LoginCredentials, rememberMe: boolean) => {
    const authUser = await authService.login(credentials);
    setUser(authUser);
    if (rememberMe) {
      localStorage.setItem('jwt_token', authUser.token);
    } else {
      sessionStorage.setItem('jwt_token', authUser.token);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    await authService.register(credentials);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jwt_token');
    sessionStorage.removeItem('jwt_token');
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, bannedError }}
    >
      {children}
    </AuthContext.Provider>
  );
};
