import { TextField, TextFieldProps } from '@mui/material';

// Shared input styles used across all forms (LoginPage, RegisterPage, etc.)
const inputSx = {
  '& .MuiFilledInput-root': {
    backgroundColor: '#1a2744',
    borderRadius: '10px',
    color: '#ffffff',
  },
  '& .MuiFilledInput-root:hover': {
    backgroundColor: '#1a2744',
  },
  '& .MuiFilledInput-root.Mui-focused': {
    backgroundColor: '#1a2744',
  },
  '& .MuiInputLabel-root': {
    color: 'grey',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: 'grey',
  },
};

// Palette pre-applied.
// Avoids copy-pasting the same styles in every component
// Just pass label, value, onChange, etc.
const TextFieldStyle = (props: TextFieldProps) => (
  <TextField
    variant="filled"
    InputProps={{ disableUnderline: true }}
    sx={inputSx}
    {...props} // Any prop passed by the parent overrides the defaults above (onChange, label, value, etc.)
  />
);

export default TextFieldStyle;
