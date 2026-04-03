import { useState, useEffect } from 'react';
import * as imageService from '../../services/image/image.service';
import { ProfileImage } from '../../types/image.types';

export const useAvatar = (open: boolean, currentImage: string) => {
  const [images, setImages] = useState<ProfileImage[]>([]);
  const [selectedImage, setSelectedImage] = useState(currentImage);

  const BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    if (open) {
      imageService
        .getAll()
        .then(setImages)
        .catch((err) =>
          console.error('Erreur lors du chargement des avatars:', err),
        );
    }
  }, [open]);

  return {
    images,
    selectedImage,
    setSelectedImage,
    BASE_URL,
  };
};
