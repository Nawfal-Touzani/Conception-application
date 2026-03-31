import { Box, FormControl, MenuItem, Select, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import * as specialityService from '../../services/speciality/speciality.service';
import { Speciality } from '../../types/speciality.types';

interface SpecialitySelectProps {
  currentSpeciality: string;
  onUpdate: (name: string) => Promise<void>;
}

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

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        mb: 1,
        ml: 2,
      }}
    >
      <Typography sx={{ fontWeight: 'bold', minWidth: '218px' }}>
        Spécialité :
      </Typography>

      <FormControl variant="outlined">
        <Select
          value={selectedId}
          onChange={(e) => handleChange(e.target.value as number)}
          sx={{
            width: '372px',
            height: '40px',
            backgroundColor: '#1e2a44',
            borderRadius: '4px',
            color: '#ffffff',
            '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            '& .MuiSelect-select': {
              paddingRight: '32px !important',
              textAlign: 'center',
              fontWeight: 'bold',
            },
            '& .MuiSelect-icon': { color: 'white', right: '10px' },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: '#1a2744',
                color: 'white',
                '& .MuiMenuItem-root': { justifyContent: 'center' },
              },
            },
          }}
        >
          {specialities.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name.charAt(0).toUpperCase() + s.name.slice(1)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
