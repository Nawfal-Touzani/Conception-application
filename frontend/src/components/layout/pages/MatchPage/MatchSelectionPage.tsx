import React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { MatchDetail } from '../../../../types/match.types';
import { useMatchSelectionPage } from '../../../../hooks/useMatch/useMatchSelectionPage';
import { formatMatchDateTime } from '../../../../utils/match/match.utils';
import { getMemberAvatarUrl } from '../../../../utils/match/match-detail.utils';
import { matchSelectionStyles as s } from '../../../../styles/match/matchSelection.styles';

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
  const {
    eligibleMembers,
    selectedIds,
    loading,
    submitting,
    errorMsg,
    successMsg,
    toggleMember,
    handleSubmit,
  } = useMatchSelectionPage({ match, hasExistingSelection, onBack });

  return (
    <Box sx={s.pageContainer}>
      {/* entete avec le bouton retour et les infos du match */}
      <Box sx={s.headerRow}>
        <IconButton onClick={() => onBack()} sx={s.backButton}>
          <ArrowBackIcon />
        </IconButton>

        <Box>
          <Typography sx={s.headerSubtitle}>
            {match.tournamentName} · {match.roundLabel}
          </Typography>

          <Typography sx={s.headerTitle}>
            {hasExistingSelection
              ? 'Modifier la composition'
              : 'Selectionner les joueurs'}
          </Typography>

          <Typography sx={s.headerDate}>
            {formatMatchDateTime(match.dateTime)}
          </Typography>
        </Box>
      </Box>

      {/* compteur des joueurs selectionnes avec leurs avatars */}
      <Paper elevation={4} sx={s.counterCard}>
        <Typography sx={s.counterLabel}>
          {selectedIds.length} / 4 joueurs selectionnes
        </Typography>

        <Box sx={s.counterAvatarRow}>
          {selectedIds.map((id) => {
            const member = eligibleMembers.find((e) => e.id === id);

            return member ? (
              <Avatar
                key={id}
                src={getMemberAvatarUrl(member.imageUrl)}
                sx={s.counterAvatar}
              />
            ) : null;
          })}
        </Box>
      </Paper>

      {/* affiche un spinner pendant le chargement des membres */}
      {loading ? (
        <Box sx={s.loadingWrapper}>
          <CircularProgress sx={{ color: '#e8b84b' }} />
        </Box>
      ) : (
        <Box sx={s.memberList}>
          {eligibleMembers.map((member) => {
            const isSelected = selectedIds.includes(member.id);

            // bloque si indisponible ou si on a deja 4 joueurs choisis
            const isDisabled =
              !member.available || (!isSelected && selectedIds.length >= 4);

            return (
              <Paper
                key={member.id}
                elevation={2}
                onClick={() => !isDisabled && toggleMember(member.id)}
                sx={s.memberCard(isSelected, isDisabled)}
              >
                {/* point vert ou rouge selon la disponibilite du joueur */}
                <Box sx={s.availabilityDot(member.available)} />

                <Avatar
                  src={getMemberAvatarUrl(member.imageUrl)}
                  sx={s.memberAvatar}
                />

                <Box sx={{ flex: 1 }}>
                  <Typography sx={s.memberTag}>{member.tag}</Typography>

                  {/* affiche le chip uniquement si le joueur est indisponible */}
                  {!member.available && (
                    <Chip
                      label="Indisponible"
                      size="small"
                      sx={s.unavailableChip}
                    />
                  )}
                </Box>

                {/* le checkbox suit l'etat de selection et respecte la limite de 4 */}
                <Checkbox
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => toggleMember(member.id)}
                  onClick={(event) => event.stopPropagation()}
                  sx={s.checkbox}
                />
              </Paper>
            );
          })}
        </Box>
      )}

      {errorMsg && (
        <Alert severity="error" sx={s.alert}>
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={s.alert}>
          {successMsg}
        </Alert>
      )}

      {/* bouton desactive tant que 4 joueurs ne sont pas selectionnes */}
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={selectedIds.length !== 4 || submitting}
        fullWidth
        sx={s.submitButton}
      >
        {submitting ? (
          <CircularProgress size={18} color="inherit" />
        ) : hasExistingSelection ? (
          'Modifier la composition'
        ) : (
          'Valider la selection'
        )}
      </Button>
    </Box>
  );
};

export default MatchSelectionPage;
