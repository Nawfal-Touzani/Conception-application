import { Speciality } from '../../types/speciality.types';

const API_URL = 'http://localhost:3000/specialities';

export const getAll = async (): Promise<Speciality[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des spécialités');
  }
  return response.json();
};
