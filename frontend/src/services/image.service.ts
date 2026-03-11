import { ProfileImage } from '../types/image.types';

const API_URL = 'http://localhost:3000/images';

export const getAll = async (): Promise<ProfileImage[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des avatars');
  }
  return response.json();
};
