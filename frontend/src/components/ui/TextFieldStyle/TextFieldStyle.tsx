import { TextField, TextFieldProps } from '@mui/material';

import { inputSx } from '../../../styles/page.styles';

// Palette pre-applied
// Avoids copy-pasting the same styles in every component
// Just pass label, value, onChange, etc.
const TextFieldStyle = (props: TextFieldProps) => (
  <TextField
    variant="filled"
    InputProps={{ disableUnderline: true }}
    sx={inputSx}
    {...props}
  />
);

export default TextFieldStyle;
