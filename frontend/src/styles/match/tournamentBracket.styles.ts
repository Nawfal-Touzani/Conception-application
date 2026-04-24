import { CARD_HEIGHT, CARD_WIDTH } from '../../utils/match/bracket.utils';

export const tournamentBracketStyles = {
  outerScroll: {
    overflowX: 'auto',
    overflowY: 'hidden',
    pb: 2,
    borderRadius: '10px',
  },

  roundLabel: {
    color: '#ffffff',
    fontWeight: 900,
    fontSize: '1.6rem',
    lineHeight: 1.1,
    py: 5,
    textAlign: 'center',
  },

  loadingBox: {
    display: 'flex',
    justifyContent: 'center',
    py: 6,
  },

  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    py: 4,
  },

  emptyText: {
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    py: 4,
    fontStyle: 'italic',
  },

  bracketCard: (isClickable: boolean) => ({
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#1f2c4b',
    borderRadius: '2px',
    border: '2px solid #ffffff',
    overflow: 'hidden',
    transition: 'transform 140ms ease, opacity 140ms ease',
    cursor: isClickable ? 'pointer' : 'default',
    ...(isClickable && {
      '&:hover': {
        transform: 'scale(1.015)',
      },
    }),
  }),

  teamSlotRow: {
    display: 'flex',
    alignItems: 'stretch',
    height: (CARD_HEIGHT - 2) / 2,
    backgroundColor: '#1f2c4b',
  },

  teamSlotBar: (isWinner: boolean, isLoser: boolean) => ({
    width: 8,
    backgroundColor: isWinner ? '#18c964' : isLoser ? '#e5484d' : 'transparent',
    flexShrink: 0,
  }),

  teamSlotContent: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: 1.5,
    minWidth: 0,
  },

  teamName: (isTbd: boolean) => ({
    fontSize: '0.86rem',
    fontWeight: 700,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    // le nom tbd est plus discret car l'equipe n'est pas encore determinee
    color: isTbd ? 'rgba(255,255,255,0.38)' : '#ffffff',
  }),

  scoreBox: {
    minWidth: 36,
    textAlign: 'right',
    ml: 1,
    flexShrink: 0,
  },

  scoreValue: (isFinal: boolean, isWinner: boolean) => ({
    fontSize: '0.95rem',
    fontWeight: 900,
    // le score du gagnant en finale est dore pour marquer l'evenement
    color: isFinal && isWinner ? '#d6b36a' : '#ffffff',
  }),

  forfeitLabel: {
    fontSize: '0.72rem',
    fontWeight: 800,
    color: '#ff6b6b',
  },

  scoreDash: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.45)',
  },

  dividerLine: {
    height: '2px',
    backgroundColor: '#ffffff',
  },
};
