import { Box, Button, Dialog, DialogTitle, IconButton } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useAvatars } from './useAvatars';
import { AvatarItem } from './AvatarItem';

interface AvatarModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (imageUrl: string) => void;
  currentImage: string;
}

export const AvatarModal = ({
  open,
  onClose,
  onConfirm,
  currentImage,
}: AvatarModalProps) => {
  const { images, selectedImage, setSelectedImage, BASE_URL } = useAvatars(
    open,
    currentImage,
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { borderRadius: 3, p: 2, textAlign: 'center', maxWidth: '600px' },
      }}
    >
      <DialogTitle
        sx={{ fontWeight: 'bold', fontSize: '1.8rem', color: '#1e2a44' }}
      >
        Choisir un avatar
      </DialogTitle>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          my: 3,
        }}
      >
        <IconButton>
          {' '}
          <ArrowBackIosIcon />{' '}
        </IconButton>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {images.map((img) => {
            const fullUrl = `${BASE_URL}${img.url}`;
            return (
              <AvatarItem
                key={img.id}
                url={fullUrl}
                isSelected={selectedImage === fullUrl}
                onClick={() => setSelectedImage(fullUrl)}
              />
            );
          })}
        </Box>

        <IconButton>
          {' '}
          <ArrowForwardIosIcon />{' '}
        </IconButton>
      </Box>

      <Button
        variant="contained"
        onClick={() => onConfirm(selectedImage)}
        sx={{
          bgcolor: '#1e2a44',
          color: 'white',
          fontWeight: 'bold',
          textTransform: 'none',
          fontSize: '1.2rem',
          borderRadius: 2,
          px: 6,
          py: 1,
          alignSelf: 'center',
          mb: 2,
          '&:hover': { bgcolor: '#2c3e61' },
        }}
      >
        Confirmer
      </Button>
    </Dialog>
  );
};
