export const matchDetailStyles = {
  pageContainer: {
    flexGrow: 1,
    backgroundColor: '#1a2540',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    p: 4,
    gap: 3,
  },

  backRow: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    px: { xs: 1, sm: 2 },
  },

  backButton: {
    alignSelf: 'flex-start',
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'none',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    minWidth: 0,
    px: 1,
    py: 0.5,
    borderRadius: '8px',
    justifyContent: 'flex-start',
    '&:hover': {
      color: '#fff',
      backgroundColor: 'rgba(255,255,255,0.08)',
    },
  },

  pageTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '2.2rem',
    textAlign: 'center',
  },

  whiteCard: {
    width: '100%',
    maxWidth: 700,
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },

  metaHeaderGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    px: 3,
    pt: 2,
    pb: 0.5,
  },

  metaValueGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    px: 3,
    py: 1.5,
  },

  metaLabel: {
    fontSize: '0.8rem',
    color: 'rgba(0,0,0,0.45)',
    fontWeight: 500,
    textAlign: 'center',
  },

  metaValue: {
    fontSize: '0.92rem',
    color: '#1a2540',
    fontWeight: 500,
    textAlign: 'center',
  },

  scoreHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    px: 4,
    py: 2.5,
  },

  teamNameLeft: {
    fontWeight: 'bold',
    fontSize: '1.15rem',
    color: '#1a2540',
    flex: 1,
  },

  teamNameRight: {
    fontWeight: 'bold',
    fontSize: '1.15rem',
    color: '#1a2540',
    flex: 1,
    textAlign: 'right',
  },

  scoreBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 140,
    justifyContent: 'center',
  },

  lineupSectionTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '1rem',
    color: '#1a2540',
    py: 1.5,
  },

  lineupWrapper: {
    display: 'flex',
    px: 2,
    pb: 2.5,
  },

  lineupColumn: (isRight: boolean) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: isRight ? 'flex-end' : 'flex-start',
    px: 1.5,
  }),

  playerRow: (reverse: boolean) => ({
    display: 'flex',
    flexDirection: reverse ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 1,
  }),

  actionWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    width: '100%',
    maxWidth: 700,
  },

  alert: {
    width: '100%',
    maxWidth: 700,
    borderRadius: '10px',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.65)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
  },

  modalCard: {
    borderRadius: '12px',
    p: 4,
    maxWidth: 340,
    width: '90%',
    textAlign: 'center',
    backgroundColor: '#fff',
  },
};
