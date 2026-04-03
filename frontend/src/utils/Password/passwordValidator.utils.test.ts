import { describe, it, expect } from 'vitest';
import { PasswordData } from '../../types/password.type';
import { validatePassword } from './passwordValidator.utils';

describe('validatePassword', () => {
  it('should return an error if a field is empty', () => {
    const data: PasswordData = {
      oldPassword: '',
      newPassword: 'pswd',
      confirmPassword: '',
    };
    expect(validatePassword(data)).toBe('Veuillez compléter tous les champs.');
  });

  it('should reject a password that is too simple (REGEX)', () => {
    const data: PasswordData = {
      oldPassword: 'Password123!',
      newPassword: 'azerty',
      confirmPassword: 'azerty',
    };
    expect(validatePassword(data)).toContain('au moins 8 caractères');
  });

  it('should reject if the new passwords are different', () => {
    const data: PasswordData = {
      oldPassword: 'Password123!',
      newPassword: 'Password123456!',
      confirmPassword: 'MotDePasse1!',
    };
    expect(validatePassword(data)).toBe(
      'Les nouveaux mots de passe ne correspondent pas.',
    );
  });

  it('should reject if the new password is the same as the old one', () => {
    const data: PasswordData = {
      oldPassword: 'PasswordOk1@',
      newPassword: 'PasswordOk1@',
      confirmPassword: 'PasswordOk1@',
    };
    expect(validatePassword(data)).toBe(
      "Le nouveau mot de passe doit être différent de l'actuel.",
    );
  });

  it('should return null if all rules are respected', () => {
    const data: PasswordData = {
      oldPassword: 'PasswordOk1@',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };
    expect(validatePassword(data)).toBeNull();
  });
});
