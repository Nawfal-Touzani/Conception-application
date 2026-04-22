import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { TournamentStatus } from '../../../types/tournament.types';
import {
  colors,
  radioSx,
  textFieldSx,
} from '../../../styles/tournament.styles';

type Props = {
  isAdmin: boolean;
  nameSearch: string;
  setNameSearch: (v: string) => void;
  teamSearch: string;
  setTeamSearch: (v: string) => void;
  tagSearch: string;
  setTagSearch: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  statusFilter: TournamentStatus | 'OPEN' | '';
  setStatusFilter: (v: TournamentStatus | 'OPEN' | '') => void;
  visibilityFilter: 'public' | 'private' | '';
  setVisibilityFilter: (v: 'public' | 'private' | '') => void;
  onReset: () => void;
};

const TournamentFilters = ({
  isAdmin,
  nameSearch,
  setNameSearch,
  teamSearch,
  setTeamSearch,
  tagSearch,
  setTagSearch,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  statusFilter,
  setStatusFilter,
  visibilityFilter,
  setVisibilityFilter,
  onReset,
}: Props) => (
  <Paper
    elevation={0}
    sx={{
      width: 200,
      flexShrink: 0,
      borderRadius: '12px',
      p: 2.5,
      backgroundColor: colors.white,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      position: 'sticky',
      top: 16,
    }}
  >
    <Typography
      sx={{
        fontWeight: 800,
        color: colors.primary,
        fontSize: '1rem',
        textAlign: 'center',
      }}
    >
      FILTRES
    </Typography>

    {[
      { label: 'Nom', value: nameSearch, onChange: setNameSearch },
      { label: 'Team', value: teamSearch, onChange: setTeamSearch },
      { label: 'Tag', value: tagSearch, onChange: setTagSearch },
    ].map(({ label, value, onChange }) => (
      <Box key={label}>
        <Typography
          sx={{
            fontWeight: 700,
            color: colors.primary,
            fontSize: '0.85rem',
            mb: 0.5,
          }}
        >
          {label}
        </Typography>
        <TextField
          fullWidth
          placeholder="Rechercher..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          size="small"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ fontSize: '1rem', color: colors.primary }} />
              </InputAdornment>
            ),
            sx: textFieldSx,
          }}
        />
      </Box>
    ))}

    <Box>
      <Typography
        sx={{
          fontWeight: 700,
          color: colors.primary,
          fontSize: '0.85rem',
          mb: 0.5,
        }}
      >
        Période
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        <Typography sx={{ fontSize: '0.75rem', color: '#555', minWidth: 20 }}>
          Du
        </Typography>
        <TextField
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          size="small"
          InputProps={{ sx: { fontSize: '0.75rem' } }}
          sx={{ flex: 1 }}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Typography sx={{ fontSize: '0.75rem', color: '#555', minWidth: 20 }}>
          Au
        </Typography>
        <TextField
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          size="small"
          InputProps={{ sx: { fontSize: '0.75rem' } }}
          sx={{ flex: 1 }}
        />
      </Box>
    </Box>

    <Divider />

    <Box>
      <Typography
        sx={{
          fontWeight: 700,
          color: colors.primary,
          fontSize: '0.85rem',
          mb: 0.5,
        }}
      >
        État
      </Typography>
      <RadioGroup
        value={statusFilter}
        onChange={(e) =>
          setStatusFilter(e.target.value as TournamentStatus | 'OPEN' | '')
        }
      >
        {[
          { value: 'OPEN', label: 'Inscriptions ouvertes' },
          { value: 'IN_PROGRESS', label: 'En cours' },
          { value: 'FINISHED', label: 'Terminés' },
        ].map((opt) => (
          <FormControlLabel
            key={opt.value}
            value={opt.value}
            control={<Radio size="small" sx={radioSx} />}
            label={
              <Typography sx={{ fontSize: '0.8rem', color: colors.primary }}>
                {opt.label}
              </Typography>
            }
          />
        ))}
        {isAdmin && (
          <FormControlLabel
            value="CANCELLED"
            control={<Radio size="small" sx={radioSx} />}
            label={
              <Typography sx={{ fontSize: '0.8rem', color: colors.primary }}>
                Annulés
              </Typography>
            }
          />
        )}
      </RadioGroup>
    </Box>

    {isAdmin && (
      <>
        <Divider />
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              color: colors.primary,
              fontSize: '0.85rem',
              mb: 0.5,
            }}
          >
            Visibilité
          </Typography>
          <RadioGroup
            value={visibilityFilter}
            onChange={(e) =>
              setVisibilityFilter(e.target.value as 'public' | 'private' | '')
            }
          >
            {[
              { value: 'public', label: 'Public' },
              { value: 'private', label: 'Privé' },
            ].map((opt) => (
              <FormControlLabel
                key={opt.value}
                value={opt.value}
                control={<Radio size="small" sx={radioSx} />}
                label={
                  <Typography
                    sx={{ fontSize: '0.8rem', color: colors.primary }}
                  >
                    {opt.label}
                  </Typography>
                }
              />
            ))}
          </RadioGroup>
        </Box>
      </>
    )}

    <Button
      onClick={onReset}
      variant="outlined"
      size="small"
      sx={{
        borderColor: colors.primary,
        color: colors.primary,
        textTransform: 'none',
        fontWeight: 700,
        borderRadius: '6px',
        fontSize: '0.8rem',
        '&:hover': { backgroundColor: colors.primary, color: colors.white },
      }}
    >
      Réinitialiser
    </Button>
  </Paper>
);

export default TournamentFilters;
