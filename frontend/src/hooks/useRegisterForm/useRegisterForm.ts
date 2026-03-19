import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { Speciality } from '../../types/speciality.types';
import { ProfileImage } from '../../types/image.types';
import * as specialityService from '../../services/speciality/speciality.service';
import * as imageService from '../../services/image/image.service';

// Logic for RegisterPage
// RegisterPage becomes pure JSX
export const useRegisterForm = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [avatars, setAvatars] = useState<ProfileImage[]>([]);

  const [email, setEmail] = useState('');
  const [tag, setTag] = useState('');
  const [password, setPassword] = useState('');
  const [specialityId, setSpecialityId] = useState<number | ''>('');
  const [imageId, setImageId] = useState<number | ''>('');

  const [error, setError] = useState<string | null>(null);

  // Fetch specialities and images
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [specsData, imagesData] = await Promise.all([
          specialityService.getAll(),
          imageService.getAll(),
        ]);
        setSpecialities(specsData);
        setAvatars(imagesData);
      } catch {
        setError('Impossible de charger les spécialités et les avatars.');
      }
    };
    fetchFormData();
  }, []);

  // Validate inputs
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // Frontend validation
    if (!email || !tag || !password || specialityId === '' || imageId === '') {
      return setError('Veuillez remplir tous les champs et choisir un avatar.');
    }

    try {
      await register({
        email,
        password,
        tag,
        imageId: Number(imageId),
        specialityId: Number(specialityId),
      });
      navigate('/login');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inattendue s'est produite.");
      }
    }
  };

  // Return everything RegisterPage needs to render the form
  return {
    specialities,
    avatars,
    email,
    setEmail,
    tag,
    setTag,
    password,
    setPassword,
    specialityId,
    setSpecialityId,
    imageId,
    setImageId,
    error,
    handleSubmit,
  };
};
