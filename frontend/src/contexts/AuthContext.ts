import { createContext } from 'react';
import {
  AuthenticatedMember,
  LoginCredentials,
  RegisterCredentials,
} from '../types/auth.types';

interface AuthContextType {
  user: AuthenticatedMember | null;
  login: (credentials: LoginCredentials, rememberMe: boolean) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
