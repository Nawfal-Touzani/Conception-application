export const matchSelectionStyles = {
  pageContainer: {
    flexGrow: 1,
    backgroundColor: '#1e2a44',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    px: 4,
    py: 3,
    gap: 3,
  },

  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 1.5,
    width: '100%',
    maxWidth: 600,
  },

  backButton: {
    color: '#fff',
    p: 0.5,
  },

  headerSubtitle: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: '0.8rem',
  },

  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.15rem',
  },

  headerDate: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: '0.82rem',
    mt: 0.25,
  },

  counterCard: {
    width: '100%',
    maxWidth: 600,
    borderRadius: '10px',
    backgroundColor: '#243060',
    px: 2.5,
    py: 1.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  counterLabel: {
    color: '#e8b84b',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },

  counterAvatarRow: {
    display: 'flex',
    gap: 0.5,
  },

  counterAvatar: {
    width: 32,
    height: 32,
    border: '2px solid #e8b84b',
  },

  memberList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    width: '100%',
    maxWidth: 600,
  },

  // genere le style dynamique d'une carte membre selon son etat
  memberCard: (isSelected: boolean, isDisabled: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    borderRadius: '10px',
    px: 2,
    py: 1,
    border: '1px solid',
    borderColor: isSelected ? '#e8b84b' : 'rgba(255,255,255,0.08)',
    backgroundColor: isSelected ? 'rgba(232,184,75,0.12)' : '#243060',
    opacity: isDisabled ? 0.45 : 1,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s',
  }),

  // genere la couleur du point de disponibilite
  availabilityDot: (available: boolean) => ({
    width: 12,
    height: 12,
    borderRadius: '50%',
    backgroundColor: available ? '#2ecc71' : '#e74c3c',
    boxShadow: '0 0 0 2px rgba(255,255,255,0.2)',
    flexShrink: 0,
  }),

  memberAvatar: {
    width: 38,
    height: 38,
  },

  memberTag: {
    color: 'white',
    fontWeight: 500,
    fontSize: '0.95rem',
  },

  unavailableChip: {
    backgroundColor: 'rgba(231,76,60,0.2)',
    color: '#e74c3c',
    height: 18,
    fontSize: '0.7rem',
    mt: 0.25,
  },

  checkbox: {
    color: 'rgba(255,255,255,0.3)',
    '&.Mui-checked': { color: '#e8b84b' },
    '&.Mui-disabled': {
      // quand indisponible le checkbox est plus grise que pour la limite atteinte
      color: 'rgba(255,255,255,0.3)',
    },
  },

  alert: {
    width: '100%',
    maxWidth: 600,
    borderRadius: '10px',
  },

  submitButton: {
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
  },

  loadingWrapper: {
    display: 'flex',
    justifyContent: 'center',
    mt: 6,
  },
};
