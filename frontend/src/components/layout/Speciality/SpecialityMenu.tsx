import { Box, FormControl, MenuItem, Select, Typography } from '@mui/material';
import { SpecialityMenuProps } from '../../../types/speciality.types';

// Composant du menu pour la séléction de la spécialité (visuel)
export const SpecialityMenuUI = ({
  specialities,
  selectedId,
  onChange,
}: SpecialityMenuProps) => {
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
          onChange={(e) => onChange(e.target.value as number)}
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
