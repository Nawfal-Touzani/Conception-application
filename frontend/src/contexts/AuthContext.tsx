import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from 'react';
import {
  AuthenticatedMember,
  LoginCredentials,
  RegisterCredentials,
} from '../types/auth.types';
import * as authService from '../services/auth.service';

// Define the shape of our Context (what it will contain)
interface AuthContextType {
  user: AuthenticatedMember | null;
  login: (credentials: LoginCredentials, rememberMe: boolean) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

// Create the Context with a default value of undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the Provider (the component that will wrap our application)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthenticatedMember | null>(null);

  // auto-Login by verifying the token stored in localStorage when the app loads
  useEffect(() => {
    const autoLogin = async () => {
      const savedToken =
        localStorage.getItem('jwt_token') ||
        sessionStorage.getItem('jwt_token');
      if (savedToken) {
        try {
          // We ask the backend to validate the token and return the user
          const refreshedUser = await authService.getMe(savedToken);
          setUser(refreshedUser);
          if (localStorage.getItem('jwt_token')) {
            localStorage.setItem('jwt_token', refreshedUser.token);
          } else {
            sessionStorage.setItem('jwt_token', refreshedUser.token);
          } // We save the new token
        } catch (error) {
          // If the token is expired or invalid, we clean it up
          localStorage.removeItem('jwt_token');
          sessionStorage.removeItem('jwt_token');
          setUser(null);
        }
      }
    };

    autoLogin();
  }, []);

  // Function to log in
  const login = async (credentials: LoginCredentials, rememberMe: boolean) => {
    const authUser = await authService.login(credentials);
    setUser(authUser);
    if (rememberMe) {
      localStorage.setItem('jwt_token', authUser.token); // persistant
    } else {
      sessionStorage.setItem('jwt_token', authUser.token); // deleted when the browser is closed
    }
  };

  // Function to register
  const register = async (credentials: RegisterCredentials) => {
    await authService.register(credentials);
  };

  // Function to log out (easy: we just remove the localStorage and the state)
  const logout = () => {
    setUser(null);
    localStorage.removeItem('jwt_token');
    sessionStorage.removeItem('jwt_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook for easy context usage
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth needs to be used inside an AuthProvider');
  }
  return context;
};
