import { Box, Button, Dialog, DialogTitle, IconButton } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useEffect, useState } from 'react';
import * as imageService from '../../services/image.service';
import { ProfileImage } from '../../types/image.types';

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
  const [images, setImages] = useState<ProfileImage[]>([]);
  const [selectedImage, setSelectedImage] = useState(currentImage);

  useEffect(() => {
    if (open) {
      imageService.getAll().then(setImages).catch(console.error);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: 3, p: 2, textAlign: 'center' } }}
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
          <ArrowBackIosIcon />
        </IconButton>

        <Box sx={{ display: 'flex', gap: 2 }}>
          {images.map((img) => (
            <Box
              key={img.url}
              component="img"
              src={img.url}
              onClick={() => setSelectedImage(img.url)}
              sx={{
                width: 80,
                height: 80,
                cursor: 'pointer',
                borderRadius: 2,
                border:
                  selectedImage === img.url
                    ? '2px solid red'
                    : '1px solid #ccc',
                p: 0.5,
              }}
            />
          ))}
        </Box>

        <IconButton>
          <ArrowForwardIosIcon />
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
