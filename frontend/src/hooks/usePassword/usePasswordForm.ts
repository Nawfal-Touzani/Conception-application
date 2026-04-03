import { useState } from 'react';
import { PasswordData } from '../../types/password.type';
import { validatePassword } from '../../utils/Password/passwordValidator';
import * as memberService from '../../services/member/member.service';

export const usePasswordForm = (token: string, onClose: () => void) => {
  const [passwordData, setPasswordData] = useState<PasswordData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetState = () => {
    setError(null);
    setSuccess(false);
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);

    const validationError = validatePassword(passwordData);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const isSuccess = await memberService.changePassword(token, passwordData);
      if (isSuccess) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          resetState();
        }, 2000);
      } else {
        setError("L'ancien mot de passe est incorrect");
      }
    } catch (err) {
      setError('Erreur de communication avec le serveur');
    }
  };

  return {
    passwordData,
    error,
    success,
    handleChange,
    handleSubmit,
    resetState,
    setError,
    setSuccess,
  };
};
