import { Box, Button, Typography } from '@mui/material';
import { useTournamentPlanning } from '../../../../hooks/useTournamentPlanning/useTournamentPlanning';
import {
  roundLabels,
  posEqual,
} from '../../../../utils/TournamentPlanning/tournament.planning.utils';
import { TeamPos } from '../../../../types/tournament.planning.types';

type Props = { tournamentId: number };

// Page d'affichage du planning d'un tournoi
// Toute la logique est dans le hook useTournamentPlanning, ici c'est que du JSX
const TournamentPlanningPage = ({ tournamentId }: Props) => {
  const {
    tournament,
    rounds,
    phase,
    selected,
    message,
    showConfirmModal,
    showPubOverlay,
    setShowConfirmModal,
    setShowPubOverlay,
    handleTeamClick,
    doConfirm,
    doReset,
    doDraft,
    confirmPublish,
  } = useTournamentPlanning(tournamentId);

  // Tant que le tournoi est pas chargé
  if (!tournament) {
    return (
      <Box sx={{ color: '#fff', textAlign: 'center', pt: 8 }}>
        Chargement...
      </Box>
    );
  }

  // Badge qui change selon la phase (draft / confirmé / publié)
  const badge =
    phase === 'published'
      ? {
          label: 'Publié — verrouillé',
          bg: 'rgba(231,76,60,0.2)',
          color: '#e74c3c',
        }
      : phase === 'confirmed'
        ? { label: 'Confirmé', bg: 'rgba(46,204,113,0.2)', color: '#2ecc71' }
        : {
            label: 'Brouillon',
            bg: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.55)',
          };

  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: '#1a2744',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 4,
        px: 2,
        pb: 6,
      }}
    >
      <Typography
        sx={{
          color: '#fff',
          fontWeight: 700,
          fontSize: '1.3rem',
          mb: 1,
          textAlign: 'center',
        }}
      >
        Gestion du planning — {tournament.name}
      </Typography>

      {/* Badge de statut du planning */}
      <Box
        sx={{
          fontSize: '0.78rem',
          mb: 3,
          px: 2,
          py: '5px',
          borderRadius: '20px',
          fontWeight: 700,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          background: badge.bg,
          color: badge.color,
          transition: 'all 0.3s',
        }}
      >
        {badge.label}
      </Box>

      {/* Si pas d'équipes inscrites, on affiche un message */}
      {rounds.length === 0 ? (
        <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
          Aucune équipe inscrite pour générer le bracket.
        </Typography>
      ) : (
        // Bracket : chaque colonne = un round
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            alignItems: 'center',
            overflowX: 'auto',
            pb: 1,
            width: '100%',
            justifyContent: 'center',
          }}
        >
          {rounds.map((round, rIdx) => (
            <Box
              key={rIdx}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 170,
              }}
            >
              {/* Titre du round (Finale, Demi-finales, etc.) */}
              <Typography
                sx={{
                  color: '#e8b84b',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  mb: 1.5,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                {roundLabels(rounds.length, rIdx)}
              </Typography>

              {/* Les matchs du round, espacés selon la profondeur dans le bracket */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `${Math.pow(2, rIdx) * 10}px`,
                }}
              >
                {round.map((match, mIdx) => (
                  <Box
                    key={mIdx}
                    sx={{
                      backgroundColor: '#243060',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.1)',
                      width: 170,
                    }}
                  >
                    {([match.team1, match.team2] as const).map((team, tIdx) => {
                      const pos: TeamPos = {
                        roundIdx: rIdx,
                        matchIdx: mIdx,
                        slot: tIdx as 0 | 1,
                      };
                      const isSelected =
                        selected !== null && posEqual(selected, pos);
                      const isTBD = team === '?'; // Gagnant pas encore connu
                      const isByeTeam = rIdx === 1 && !isTBD; // Équipe qui a eu un bye au round 1
                      const isSwappable =
                        phase === 'draft' &&
                        (rIdx === 0 || isByeTeam) &&
                        !isTBD;

                      return (
                        <Box key={tIdx}>
                          {/* Slot d'une équipe, cliquable seulement en mode draft */}
                          <Box
                            onClick={() => handleTeamClick(pos)}
                            sx={{
                              px: 1.5,
                              py: 0.9,
                              cursor: isSwappable ? 'pointer' : 'default',
                              transition: 'all 0.15s',
                              '&:hover': isSwappable
                                ? { backgroundColor: 'rgba(255,255,255,0.08)' }
                                : {},
                            }}
                          >
                            <Typography
                              sx={{
                                color: isTBD
                                  ? 'rgba(255,255,255,0.25)'
                                  : isSelected
                                    ? '#e8b84b'
                                    : '#fff',
                                fontWeight: isSelected ? 700 : 500,
                              }}
                            >
                              {isTBD ? 'TBD' : team}
                            </Typography>
                          </Box>

                          {/* Séparateur entre les deux équipes du match */}
                          {tIdx === 0 && (
                            <Box
                              sx={{
                                height: '1px',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                              }}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Boutons d'action selon la phase actuelle */}
      <Box
        sx={{
          display: 'flex',
          gap: 1.25,
          mt: 3.5,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {phase === 'draft' && (
          <>
            <Button
              variant="contained"
              disabled={rounds.length === 0}
              onClick={doConfirm}
              sx={btnStyle('#2ecc71', '#27ae60')}
            >
              Confirmer le planning
            </Button>
            {/* Relance un bracket aléatoire depuis zéro */}
            <Button
              variant="contained"
              onClick={doReset}
              sx={btnStyle('rgba(255,255,255,0.15)', 'rgba(255,255,255,0.25)')}
            >
              Relancer planning
            </Button>
          </>
        )}
        {phase === 'confirmed' && (
          <>
            <Button
              variant="contained"
              onClick={() => setShowConfirmModal(true)}
              sx={btnStyle('#e74c3c', '#c0392b')}
            >
              Publier le planning
            </Button>
            {/* Revient en draft avec le bracket confirmé, pas un nouveau aléatoire */}
            <Button
              variant="contained"
              onClick={doDraft}
              sx={btnStyle('#e67e22', '#ca6f1e')}
            >
              Revenir en brouillon
            </Button>
          </>
        )}
        {phase === 'published' && (
          // Plus rien à faire, le planning est verrouillé
          <Button
            variant="contained"
            disabled
            sx={btnStyle('rgba(255,255,255,0.15)', '')}
          >
            Planning verrouillé
          </Button>
        )}
      </Box>

      {/* Message de succès ou d'erreur après une action */}
      {message.text && (
        <Typography
          sx={{
            mt: 1.75,
            fontWeight: 700,
            fontSize: '0.88rem',
            textAlign: 'center',
            color: message.type === 'success' ? '#2ecc71' : '#e8b84b',
          }}
        >
          {message.text}
        </Typography>
      )}

      {/* Modal de confirmation avant publication */}
      {showConfirmModal && (
        <Box
          onClick={() => setShowConfirmModal(false)}
          sx={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          {/* stopPropagation pour pas fermer en cliquant dans la modale */}
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              background: '#1e2f5a',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '14px',
              p: '28px 32px',
              textAlign: 'center',
              maxWidth: 320,
              width: '90%',
            }}
          >
            <Typography
              sx={{
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.05rem',
                mb: 1.25,
              }}
            >
              Publier le planning ?
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.55)',
                fontSize: '0.82rem',
                mb: 2.5,
                lineHeight: 1.5,
              }}
            >
              Une fois publié, le planning sera visible par tous et{' '}
              <Box component="strong" sx={{ color: '#e74c3c' }}>
                ne pourra plus être modifié
              </Box>
              .
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.25, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => setShowConfirmModal(false)}
                sx={btnStyle(
                  'rgba(255,255,255,0.15)',
                  'rgba(255,255,255,0.25)',
                )}
              >
                Annuler
              </Button>
              <Button
                variant="contained"
                onClick={confirmPublish}
                sx={btnStyle('#e74c3c', '#c0392b')}
              >
                Oui, publier
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* Overlay affiché après publication réussie */}
      {showPubOverlay && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
        >
          <Box
            sx={{
              background: '#1a2744',
              border: '2px solid #e74c3c',
              borderRadius: '16px',
              p: '32px 40px',
              textAlign: 'center',
              maxWidth: 320,
            }}
          >
            <Typography
              sx={{
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.15rem',
                mb: 1.25,
              }}
            >
              Planning publié !
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.55)',
                fontSize: '0.82rem',
                mb: 2.5,
                lineHeight: 1.5,
              }}
            >
              Le planning est maintenant visible par tous. Aucune modification
              n'est possible.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setShowPubOverlay(false)}
              sx={btnStyle('rgba(255,255,255,0.15)', 'rgba(255,255,255,0.25)')}
            >
              Fermer
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Styles communs pour les boutons, réutilisé partout dans la page
const btnStyle = (bg: string, hoverBg: string) => ({
  backgroundColor: bg,
  color: '#fff',
  textTransform: 'none',
  fontWeight: 700,
  fontSize: '0.85rem',
  borderRadius: '8px',
  px: 2.75,
  py: 1.25,
  '&:hover': { backgroundColor: hoverBg, filter: 'brightness(1.1)' },
  '&:active': { transform: 'scale(0.97)' },
  '&:disabled': { opacity: 0.4 },
});

export default TournamentPlanningPage;
