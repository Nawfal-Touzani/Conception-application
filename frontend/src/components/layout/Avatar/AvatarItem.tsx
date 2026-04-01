import { Box } from '@mui/material';

interface AvatarItemProps {
  url: string;
  isSelected: boolean;
  onClick: () => void;
  altText: string;
}

export const AvatarItem = ({
  url,
  isSelected,
  onClick,
  altText,
}: AvatarItemProps) => (
  <Box
    component="img"
    src={url}
    alt={altText}
    onClick={onClick}
    sx={{
      width: 80,
      height: 80,
      cursor: 'pointer',
      borderRadius: '8px',
      objectFit: 'contain',
      border: isSelected ? '3px solid #d32f2f' : '1px solid black',
      transition: 'all 0.1s ease-in-out',
      '&:hover': {
        transform: 'scale(1.2)',
      },
    }}
  />
);
