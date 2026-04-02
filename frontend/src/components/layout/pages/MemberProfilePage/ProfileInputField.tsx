import { Grid2, Typography, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

interface ProfileInputFieldProps {
  label: string;
  value?: string;
  type?: string;
  onEditClick?: () => void;
}

export const ProfileInputField = ({
  label,
  value,
  type = 'text',
  onEditClick,
}: ProfileInputFieldProps) => {
  return (
    <Grid2 container alignItems="center" spacing={1} sx={{ px: 2, mb: 1 }}>
      <Grid2 size={4}>
        <Typography sx={{ fontWeight: 'bold' }}>{label}</Typography>
      </Grid2>
      <Grid2 size={7}>
        <TextField
          fullWidth
          size="small"
          type={type}
          value={value}
          sx={{
            '& .MuiInputBase-root': {
              borderRadius: '4px',
              bgcolor: '#1e2a44',
              color: 'white',
            },
          }}
          inputProps={{ style: { textAlign: 'center' } }}
          InputProps={
            onEditClick
              ? {
                  endAdornment: (
                    <IconButton onClick={onEditClick} size="small">
                      <EditIcon fontSize="small" sx={{ color: 'white' }} />
                    </IconButton>
                  ),
                }
              : undefined
          }
        />
      </Grid2>
    </Grid2>
  );
};
