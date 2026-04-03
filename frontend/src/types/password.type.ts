export interface PasswordModalProps {
  open: boolean;
  onClose: () => void;
  token: string;
}

export interface PasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}
