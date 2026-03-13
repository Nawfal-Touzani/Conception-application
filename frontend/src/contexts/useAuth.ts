import { useContext } from 'react';
import { AuthContext } from './AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth needs to be used inside an AuthProvider');
  }
  return context;
};
