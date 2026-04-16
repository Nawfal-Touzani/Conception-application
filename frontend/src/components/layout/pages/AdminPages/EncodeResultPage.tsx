import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../../../contexts/useAuth';
import * as tournamentService from '../../../../services/tournament/tournament.service';

const ResultEncodingPage = () => {
  const { user } = useAuth();
  const token = user?.token ?? '';

  // États pour les données
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // États pour le match sélectionné
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [score1, setScore1] = useState('');
  const [score2, setScore2] = useState('');

  // Simulation du chargement des matchs au montage
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        // Remplace par ton appel service réel, ex:
        // const data = await tournamentService.getMatchesByTournament(id, token);
        // setMatches(data);

        // Mock pour démo visuelle
        setMatches([
          {
            id: 1,
            team1: 'Nom équipe 1',
            team2: 'Nom équipe 2',
            date: '15/04/2026',
          },
          { id: 2, team1: 'Eagles', team2: 'Tigers', date: '16/04/2026' },
        ]);
      } catch (err) {
        setError('Erreur lors de la récupération des matchs.');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [token]);

  const handleSelectMatch = (match: any) => {
    setSelectedMatch(match);
    setScore1('');
    setScore2('');
    setSuccess(null);
  };

  const handleValidate = async () => {
    if (!score1 || !score2) return setError('Veuillez entrer les deux scores.');

    try {
      // Appel à ton service d'encodage
      // await tournamentService.updateMatchScore(selectedMatch.id, { score1, score2 }, token);

      setSuccess(`Résultat enregistré : ${score1} - ${score2}`);
      setSelectedMatch(null);
    } catch (err) {
      setError("Erreur lors de l'enregistrement du score.");
    }
  };

  // Styles CSS partagés
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#2c3e50',
      color: 'white',
      borderRadius: '8px',
      '& fieldset': { borderColor: '#5d6d7e' },
      '&:hover fieldset': { borderColor: '#fff' },
    },
    input: { textAlign: 'center', fontWeight: 'bold', color: 'white' },
    width: '120px',
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#1a2744',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 4,
        px: 2,
      }}
    >
      {/* Header avec bouton retour */}
      <Box sx={{ width: '100%', maxWidth: 900, mb: 1 }}>
        <IconButton
          sx={{ color: 'white' }}
          onClick={() => window.history.back()}
        >
          <ArrowBackIcon fontSize="large" />
        </IconButton>
      </Box>

      <Paper
        sx={{
          width: '100%',
          maxWidth: 900,
          backgroundColor: '#1e2f50',
          borderRadius: '12px',
          p: { xs: 2, md: 5 },
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        <Typography
          variant="h4"
          sx={{ color: '#fff', fontWeight: 700, textAlign: 'center', mb: 4 }}
        >
          Encodage des résultats
        </Typography>

        <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', mb: 4 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Section Liste des Matchs */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            disabled
            value="Nom du tournoi actuel"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
              },
            }}
          />

          <Typography
            sx={{ color: '#c8d8e8', fontSize: '1rem', mb: 2, fontWeight: 500 }}
          >
            Sélectionner un match
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {loading ? (
              <CircularProgress sx={{ alignSelf: 'center', my: 2 }} />
            ) : (
              matches.map((match) => (
                <Box
                  key={match.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    transition: '0.3s',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' },
                  }}
                >
                  <Typography sx={{ color: 'white', flex: 2 }}>
                    {match.team1} <span style={{ color: '#7f8c8d' }}>vs</span>{' '}
                    {match.team2}
                  </Typography>
                  <Typography
                    sx={{ color: '#bdc3c7', flex: 1, textAlign: 'center' }}
                  >
                    {match.date}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => handleSelectMatch(match)}
                    sx={{
                      backgroundColor: '#fff',
                      color: '#1a2744',
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 3,
                      '&:hover': { backgroundColor: '#ecf0f1' },
                    }}
                  >
                    Encoder résultat
                  </Button>
                </Box>
              ))
            )}
          </Box>
        </Box>

        {/* Formulaire d'encodage de score */}
        {selectedMatch && (
          <Box
            sx={{
              mt: 6,
              p: 4,
              border: '1px solid #5d6d7e',
              borderRadius: '12px',
              backgroundColor: 'rgba(0,0,0,0.15)',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                textAlign: 'center',
                mb: 4,
                fontWeight: 600,
              }}
            >
              {selectedMatch.team1} vs {selectedMatch.team2}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: { xs: 2, md: 5 },
                mb: 5,
              }}
            >
              <TextField
                placeholder="Score"
                type="number"
                value={score1}
                onChange={(e) => setScore1(e.target.value)}
                sx={inputSx}
              />
              <Typography
                sx={{ color: 'white', fontSize: '1.5rem', fontWeight: 900 }}
              >
                v
              </Typography>
              <TextField
                placeholder="Score"
                type="number"
                value={score2}
                onChange={(e) => setScore2(e.target.value)}
                sx={inputSx}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
              <Button
                onClick={() => setSelectedMatch(null)}
                variant="contained"
                sx={{
                  backgroundColor: '#c0392b',
                  px: 4,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#a93226' },
                }}
              >
                Supprimer
              </Button>
              <Button
                onClick={handleValidate}
                variant="contained"
                sx={{
                  backgroundColor: '#27ae60',
                  px: 4,
                  fontWeight: 600,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#1e8449' },
                }}
              >
                Valider
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default ResultEncodingPage;
