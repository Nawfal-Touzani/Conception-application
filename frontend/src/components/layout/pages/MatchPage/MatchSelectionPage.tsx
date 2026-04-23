import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Checkbox,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { MatchDetail } from '../../../../types/match.types';
import { useMatchSelection } from '../../../../hooks/useMatch/useMatchSelection';
import { useAuth } from '../../../../contexts/useAuth';
import { formatMatchDateTime } from '../../../../utils/match/match.utils';

const BASE_URL = 'http://localhost:3000';

type Props = {
  match: MatchDetail;
  hasExistingSelection: boolean;
  onBack: (updatedMatch?: MatchDetail) => void;
};

const MatchSelectionPage: React.FC<Props> = ({
  match,
  hasExistingSelection,
  onBack,
}) => {
  const { user } = useAuth();
  const token = user?.token ?? '';

  const {
    eligibleMembers,
    selectedIds,
    loading,
    submitting,
    errorMsg,
    successMsg,
    toggleMember,
    handleSubmit,
  } = useMatchSelection(match, token, hasExistingSelection, onBack);

  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: '#1e2a44',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        px: 4,
        py: 3,
        gap: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          width: '100%',
          maxWidth: 600,
        }}
      >
        <IconButton onClick={() => onBack()} sx={{ color: '#fff', p: 0.5 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography color="rgba(255,255,255,0.45)" fontSize="0.8rem">
            {match.tournamentName} · {match.roundLabel}
          </Typography>
          <Typography color="white" fontWeight="bold" fontSize="1.15rem">
            {hasExistingSelection
              ? 'Modifier la composition'
              : 'Sélectionner les joueurs'}
          </Typography>
          <Typography
            color="rgba(255,255,255,0.45)"
            fontSize="0.82rem"
            mt={0.25}
          >
            {formatMatchDateTime(match.dateTime)}
          </Typography>
        </Box>
      </Box>

      {/* Compteur de sélection */}
      <Paper
        elevation={4}
        sx={{
          width: '100%',
          maxWidth: 600,
          borderRadius: '10px',
          backgroundColor: '#243060',
          px: 2.5,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography color="#e8b84b" fontWeight="bold" fontSize="0.9rem">
          {selectedIds.length} / 4 joueurs sélectionnés
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {selectedIds.map((id) => {
            const member = eligibleMembers.find((e) => e.id === id);
            return member ? (
              <Avatar
                key={id}
                src={
                  member.imageUrl?.startsWith('/')
                    ? `${BASE_URL}${member.imageUrl}`
                    : member.imageUrl
                }
                sx={{ width: 32, height: 32, border: '2px solid #e8b84b' }}
              />
            ) : null;
          })}
        </Box>
      </Paper>

      {/* Liste des membres */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <CircularProgress sx={{ color: '#e8b84b' }} />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            width: '100%',
            maxWidth: 600,
          }}
        >
          {eligibleMembers.map((member) => {
            const isSelected = selectedIds.includes(member.id);
            const isDisabled =
              !member.available || (!isSelected && selectedIds.length >= 4);
            const isUnavailable = !member.available;

            return (
              <Paper
                key={member.id}
                elevation={2}
                onClick={() => !isDisabled && toggleMember(member.id)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  borderRadius: '10px',
                  px: 2,
                  py: 1,
                  border: '1px solid',
                  borderColor: isSelected
                    ? '#e8b84b'
                    : 'rgba(255,255,255,0.08)',
                  backgroundColor: isSelected
                    ? 'rgba(232,184,75,0.12)'
                    : '#243060',
                  opacity: isDisabled ? 0.45 : 1,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {/* BOULE VERTE/ROUGE */}
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: member.available ? '#2ecc71' : '#e74c3c',
                    boxShadow: '0 0 0 2px rgba(255,255,255,0.2)',
                    flexShrink: 0,
                  }}
                />

                <Avatar
                  src={
                    member.imageUrl?.startsWith('/')
                      ? `${BASE_URL}${member.imageUrl}`
                      : member.imageUrl
                  }
                  sx={{ width: 38, height: 38 }}
                />

                <Box sx={{ flex: 1 }}>
                  <Typography color="white" fontWeight={500} fontSize="0.95rem">
                    {member.tag}
                  </Typography>
                  {/* Chip indisponible seulement si vraiment indispo */}
                  {isUnavailable && (
                    <Chip
                      label="Indisponible"
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(231,76,60,0.2)',
                        color: '#e74c3c',
                        height: 18,
                        fontSize: '0.7rem',
                        mt: 0.25,
                      }}
                    />
                  )}
                </Box>

                {/* Checkbox bloqué si indispo OU limite atteinte */}
                <Checkbox
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => toggleMember(member.id)}
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    color: 'rgba(255,255,255,0.3)',
                    '&.Mui-checked': { color: '#e8b84b' },
                    '&.Mui-disabled': {
                      color: isUnavailable ? '#555' : 'rgba(255,255,255,0.3)',
                    },
                  }}
                />
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Feedback */}
      {errorMsg && (
        <Alert
          severity="error"
          sx={{ width: '100%', maxWidth: 600, borderRadius: '10px' }}
        >
          {errorMsg}
        </Alert>
      )}
      {successMsg && (
        <Alert
          severity="success"
          sx={{ width: '100%', maxWidth: 600, borderRadius: '10px' }}
        >
          {successMsg}
        </Alert>
      )}

      {/* Bouton valider */}
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={selectedIds.length !== 4 || submitting}
        fullWidth
        sx={{
          maxWidth: 600,
          backgroundColor: '#e8b84b',
          color: '#1a2744',
          textTransform: 'none',
          fontWeight: 'bold',
          fontSize: '1rem',
          borderRadius: '10px',
          py: 1.5,
          mt: 'auto',
          '&:hover': { backgroundColor: '#d4a73a' },
          '&.Mui-disabled': {
            backgroundColor: 'rgba(232,184,75,0.25)',
            color: 'rgba(26,39,68,0.5)',
          },
        }}
      >
        {submitting ? (
          <CircularProgress size={18} color="inherit" />
        ) : hasExistingSelection ? (
          'Modifier la composition'
        ) : (
          'Valider la sélection'
        )}
      </Button>
    </Box>
  );
};

export default MatchSelectionPage;
