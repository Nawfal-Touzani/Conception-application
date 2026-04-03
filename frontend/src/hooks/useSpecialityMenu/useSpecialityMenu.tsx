import { useEffect, useState } from 'react';
import * as specialityService from '../../services/speciality/speciality.service';
import {
  Speciality,
  SpecialitySelectProps,
  SpecialityMenuProps,
} from '../../types/speciality.types';
import { SpecialityMenuUI } from '../../components/layout/Speciality/SpecialityMenu';

export const SpecialityMenu = ({
  currentSpeciality,
  onUpdate,
}: SpecialitySelectProps) => {
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [selectedId, setSelectedId] = useState<number | ''>('');

  useEffect(() => {
    specialityService
      .getAll()
      .then((data) => {
        setSpecialities(data);
        const current = data.find(
          (s) => s.name.toLowerCase() === currentSpeciality.toLowerCase(),
        );
        if (current) setSelectedId(current.id);
      })
      .catch(() => console.error('Impossible de charger les spécialités.'));
  }, [currentSpeciality]);

  const handleChange = (id: number) => {
    setSelectedId(id);
    const spec = specialities.find((s) => s.id === id);
    if (spec) onUpdate(spec.name);
  };

  const uiProps: SpecialityMenuProps = {
    specialities,
    selectedId,
    onChange: handleChange,
  };

  return <SpecialityMenuUI {...uiProps} />;
};
