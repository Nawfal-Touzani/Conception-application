import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../../../contexts/useAuth';
import * as tournamentService from '../../../services/tournament/tournament.service';
import {
  TournamentDetails,
  TournamentStatus,
} from '../../../types/tournament.types';
import TournamentDetail from './TournamentDetailPage';

const COLUMNS = 3;
const CARD_WIDTH = 320;
const GAP = 24;

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('fr-BE', {
    day: 'numeric',
    month: 'short',
  });

const formatDateFull = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('fr-BE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

// Statut affiché :
// PREPARATION + isPublic = true  → Inscriptions ouvertes
// PREPARATION + isPublic = false → En préparation (admin seulement)
// IN_PROGRESS → En cours
// FINISHED    → Terminé
// CANCELLED   → Annulé
function getStateLabel(tournament: TournamentDetails): string {
  if (tournament.status === 'PREPARATION') {
    return tournament.isPublic ? 'Inscriptions ouvertes' : 'En préparation';
  }
  if (tournament.status === 'IN_PROGRESS') return 'En cours';
  if (tournament.status === 'FINISHED') return 'Terminé';
  return 'Annulé';
}

const TournamentsPage = () => {
  const { user } = useAuth();
  const token = user?.token ?? '';
  const isAdmin = user?.role === 'ADMIN';

  // Liste reçue du backend
  const [tournaments, setTournaments] = useState<TournamentDetails[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] =
    useState<TournamentDetails | null>(null);

  // Filtres backend — appel API avec debounce
  const [teamSearch, setTeamSearch] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  // Filtres frontend — filtre local sur la liste reçue
  const [nameSearch, setNameSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    TournamentStatus | 'OPEN' | ''
  >('');
  const [visibilityFilter, setVisibilityFilter] = useState<
    'public' | 'private' | ''
  >('');

  // Charge les tournois avec les filtres team/tag
  const loadTournaments = useCallback(
    (teamName?: string, memberTag?: string) => {
      setError(null);
      tournamentService
        .getTournaments(token, teamName, memberTag)
        .then((data) => setTournaments(data))
        .catch(() => setError('Erreur lors du chargement des tournois.'));
    },
    [token],
  );

  // Chargement initial
  useEffect(() => {
    if (token) loadTournaments();
  }, [token, loadTournaments]);

  // Debounce 400ms sur team et tag — relance l'appel backend
  useEffect(() => {
    if (!token) return;
    const timer = setTimeout(() => {
      loadTournaments(
        teamSearch.trim() || undefined,
        tagSearch.trim() || undefined,
      );
    }, 400);
    return () => clearTimeout(timer);
  }, [teamSearch, tagSearch, token, loadTournaments]);

  // Filtres locaux appliqués sur la liste reçue
  const filtered = useMemo(() => {
    return tournaments.filter((t) => {
      if (
        nameSearch.trim() &&
        !t.name.toLowerCase().includes(nameSearch.toLowerCase())
      )
        return false;
      if (startDate && t.startDate < startDate) return false;
      if (endDate && t.endDate > endDate) return false;
      if (
        statusFilter === 'OPEN' &&
        !(t.isPublic && t.status === 'PREPARATION')
      )
        return false;
      else if (
        statusFilter &&
        statusFilter !== 'OPEN' &&
        t.status !== statusFilter
      )
        return false;
      if (visibilityFilter === 'public' && !t.isPublic) return false;
      if (visibilityFilter === 'private' && t.isPublic) return false;
      return true;
    });
  }, [
    tournaments,
    nameSearch,
    startDate,
    endDate,
    statusFilter,
    visibilityFilter,
  ]);

  const handleReset = () => {
    setTeamSearch('');
    setTagSearch('');
    setNameSearch('');
    setStartDate('');
    setEndDate('');
    setStatusFilter('');
    setVisibilityFilter('');
  };

  const rows: TournamentDetails[][] = [];
  for (let i = 0; i < filtered.length; i += COLUMNS) {
    rows.push(filtered.slice(i, i + COLUMNS));
  }

  if (selectedTournament) {
    return (
      <Box sx={{ flexGrow: 1, backgroundColor: '#1a2744', minHeight: '100vh' }}>
        <Box sx={{ pt: 1, pl: 1 }}>
          <IconButton
            onClick={() => setSelectedTournament(null)}
            sx={{ color: '#fff' }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <TournamentDetail tournament={selectedTournament} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: '#1e2a44',
        display: 'flex',
        minHeight: '100vh',
        px: 3,
        py: 4,
        gap: 4,
        alignItems: 'flex-start',
      }}
    >
      {/* ── Panneau filtres gauche — sticky ── */}
      <Paper
        elevation={0}
        sx={{
          width: 200,
          flexShrink: 0,
          borderRadius: '12px',
          p: 2.5,
          backgroundColor: '#fff',
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
            color: '#1a2744',
            fontSize: '1rem',
            textAlign: 'center',
          }}
        >
          FILTRES
        </Typography>

        {/* Nom — filtre frontend */}
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              color: '#1a2744',
              fontSize: '0.85rem',
              mb: 0.5,
            }}
          >
            Nom
          </Typography>
          <TextField
            fullWidth
            placeholder="Rechercher..."
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon sx={{ fontSize: '1rem', color: '#1a2744' }} />
                </InputAdornment>
              ),
              sx: { fontSize: '0.8rem', borderRadius: '6px' },
            }}
          />
        </Box>

        {/* Team — filtre backend */}
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              color: '#1a2744',
              fontSize: '0.85rem',
              mb: 0.5,
            }}
          >
            Team
          </Typography>
          <TextField
            fullWidth
            placeholder="Rechercher..."
            value={teamSearch}
            onChange={(e) => setTeamSearch(e.target.value)}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon sx={{ fontSize: '1rem', color: '#1a2744' }} />
                </InputAdornment>
              ),
              sx: { fontSize: '0.8rem', borderRadius: '6px' },
            }}
          />
        </Box>

        {/* Tag — filtre backend */}
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              color: '#1a2744',
              fontSize: '0.85rem',
              mb: 0.5,
            }}
          >
            Tag
          </Typography>
          <TextField
            fullWidth
            placeholder="Rechercher..."
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon sx={{ fontSize: '1rem', color: '#1a2744' }} />
                </InputAdornment>
              ),
              sx: { fontSize: '0.8rem', borderRadius: '6px' },
            }}
          />
        </Box>

        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              color: '#1a2744',
              fontSize: '0.85rem',
              mb: 0.5,
            }}
          >
            Période
          </Typography>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}
          >
            <Typography
              sx={{ fontSize: '0.75rem', color: '#555', minWidth: 20 }}
            >
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
            <Typography
              sx={{ fontSize: '0.75rem', color: '#555', minWidth: 20 }}
            >
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
              color: '#1a2744',
              fontSize: '0.85rem',
              mb: 0.5,
            }}
          >
            Statut
          </Typography>
          <RadioGroup
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as TournamentStatus | 'OPEN' | '')
            }
          >
            {[
              { value: 'OPEN', label: 'Inscriptions ouvertes' },
              { value: 'IN_PROGRESS', label: 'En Cours' },
              { value: 'FINISHED', label: 'Terminés' },
            ].map((opt) => (
              <FormControlLabel
                key={opt.value}
                value={opt.value}
                control={
                  <Radio
                    size="small"
                    sx={{
                      color: '#1a2744',
                      '&.Mui-checked': { color: '#1a2744' },
                      p: 0.3,
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '0.8rem', color: '#1a2744' }}>
                    {opt.label}
                  </Typography>
                }
              />
            ))}
            {isAdmin && (
              <FormControlLabel
                value="CANCELLED"
                control={
                  <Radio
                    size="small"
                    sx={{
                      color: '#1a2744',
                      '&.Mui-checked': { color: '#1a2744' },
                      p: 0.3,
                    }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '0.8rem', color: '#1a2744' }}>
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
                  color: '#1a2744',
                  fontSize: '0.85rem',
                  mb: 0.5,
                }}
              >
                Visibilité
              </Typography>
              <RadioGroup
                value={visibilityFilter}
                onChange={(e) =>
                  setVisibilityFilter(
                    e.target.value as 'public' | 'private' | '',
                  )
                }
              >
                {[
                  { value: 'public', label: 'Public' },
                  { value: 'private', label: 'Privé' },
                ].map((opt) => (
                  <FormControlLabel
                    key={opt.value}
                    value={opt.value}
                    control={
                      <Radio
                        size="small"
                        sx={{
                          color: '#1a2744',
                          '&.Mui-checked': { color: '#1a2744' },
                          p: 0.3,
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: '0.8rem', color: '#1a2744' }}>
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
          onClick={handleReset}
          variant="outlined"
          size="small"
          sx={{
            borderColor: '#1a2744',
            color: '#1a2744',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '6px',
            fontSize: '0.8rem',
            '&:hover': { backgroundColor: '#1a2744', color: '#fff' },
          }}
        >
          Réinitialiser
        </Button>
      </Paper>

      {/* ── Contenu principal ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h4"
          sx={{ color: '#fff', fontWeight: 800, mb: 4, textAlign: 'center' }}
        >
          Tournois
        </Typography>

        {error && (
          <Typography sx={{ color: '#e74c3c', mb: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}
        {filtered.length === 0 && (
          <Typography
            sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', mt: 4 }}
          >
            Aucun tournoi trouvé.
          </Typography>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {rows.map((row, rowIndex) => (
            <Box key={rowIndex}>
              <Box
                sx={{
                  display: 'flex',
                  gap: `${GAP}px`,
                  justifyContent: 'center',
                  alignItems: 'stretch',
                }}
              >
                {row.map((tournament) => (
                  <Paper
                    key={tournament.id}
                    sx={{
                      p: 1,
                      borderRadius: '10px',
                      width: CARD_WIDTH,
                      flexShrink: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    {/* Header — nom du tournoi */}
                    <Box
                      sx={{
                        backgroundColor: '#1e2a44',
                        color: 'white',
                        borderRadius: '8px',
                        py: 1.5,
                        px: 1,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold">
                        {tournament.name}
                      </Typography>
                    </Box>

                    {/* Contenu */}
                    <Box
                      sx={{
                        backgroundColor: '#1e2a44',
                        color: 'white',
                        borderRadius: '8px',
                        p: 2,
                        flexGrow: 1,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      {/* Dates du tournoi */}
                      <Typography
                        variant="caption"
                        display="block"
                        mb={1}
                        fontSize="0.85rem"
                      >
                        {formatDate(tournament.startDate)} -{' '}
                        {formatDate(tournament.endDate)}
                      </Typography>

                      {/* Statut */}
                      <Typography
                        variant="body1"
                        fontWeight="bold"
                        mb={1}
                        fontSize="1.1rem"
                      >
                        {getStateLabel(tournament)}
                      </Typography>

                      {/* Date de clôture des inscriptions — toujours affichée */}
                      <Typography
                        variant="caption"
                        display="block"
                        mb={1}
                        fontSize="0.8rem"
                        sx={{ color: 'rgba(255,255,255,0.7)' }}
                      >
                        Clôture le{' '}
                        {formatDateFull(tournament.registrationDeadline)}
                      </Typography>

                      {/* Description */}
                      {tournament.description && (
                        <Typography
                          variant="caption"
                          display="block"
                          mb={1}
                          fontSize="0.85rem"
                          sx={{
                            color: 'rgba(255,255,255,0.7)',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {tournament.description}
                        </Typography>
                      )}

                      <Typography variant="caption" display="block">
                        TEAMS
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        fontSize="1rem"
                        mb={1}
                      >
                        {tournament.currentParticipants}/
                        {tournament.maxParticipants}
                      </Typography>

                      <Box sx={{ mt: 'auto', pt: 1 }}>
                        <IconButton
                          onClick={() => setSelectedTournament(tournament)}
                          sx={{
                            color: '#fff',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.1)',
                            },
                          }}
                        >
                          <InfoOutlinedIcon fontSize="medium" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>

              {isAdmin && (
                <Box
                  sx={{
                    display: 'flex',
                    gap: `${GAP}px`,
                    mt: 1,
                    justifyContent: 'center',
                  }}
                >
                  {row.map((tournament) => (
                    <Button
                      key={tournament.id}
                      variant="contained"
                      disabled={
                        tournament.isPublic ||
                        tournament.status === 'FINISHED' ||
                        tournament.status === 'CANCELLED'
                      }
                      sx={{
                        width: CARD_WIDTH,
                        flexShrink: 0,
                        backgroundColor: '#fff',
                        color: '#1a2744',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        borderRadius: '8px',
                        boxShadow: 'none',
                        '&:hover': { backgroundColor: '#e8e8e8' },
                        '&.Mui-disabled': {
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'rgba(255,255,255,0.4)',
                        },
                      }}
                    >
                      Administrer
                    </Button>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default TournamentsPage;
