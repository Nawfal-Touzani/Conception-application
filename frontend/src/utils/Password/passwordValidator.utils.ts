import { PasswordData } from '../../types/password.type';

const PASSWORD_REGEX =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

export const validatePassword = (data: PasswordData): string | null => {
  if (!data.oldPassword || !data.newPassword || !data.confirmPassword) {
    return 'Veuillez compléter tous les champs.';
  }

  if (!PASSWORD_REGEX.test(data.newPassword)) {
    return 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.';
  }

  if (data.newPassword !== data.confirmPassword) {
    return 'Les nouveaux mots de passe ne correspondent pas.';
  }

  if (data.newPassword === data.oldPassword) {
    return "Le nouveau mot de passe doit être différent de l'actuel.";
  }

  return null;
};
