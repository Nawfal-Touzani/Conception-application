export interface AvatarModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (imageUrl: string) => void;
  currentImage: string;
}

export interface AvatarItemProps {
  url: string;
  isSelected: boolean;
  onClick: () => void;
  altText: string;
}
