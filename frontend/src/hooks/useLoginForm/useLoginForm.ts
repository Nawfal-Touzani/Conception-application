import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';

// Everything LoginPage needs: state, handlers, and error management
// All logic here, zero logic to test on component level, only UI rendering
export const useLoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true); // Checked by default
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // Frontend validation
    if (!email || !password) {
      return setError('Veuillez remplir tous les champs.');
    }

    try {
      await login({ email, password }, rememberMe);
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message); // Display the exact backend error message
      } else {
        setError("Une erreur inattendue s'est produite.");
      }
    } finally {
      // Always clear the password field after a failed attempt for security
      setPassword('');
    }
  };

  // Return everything the LoginPage component needs to render the form
  return {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    error,
    handleSubmit,
  };
};
