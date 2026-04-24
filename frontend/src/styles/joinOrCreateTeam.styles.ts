export const joinOrCreateTeamSx = {
  root: {
    flexGrow: 1,
    backgroundColor: '#1a2744',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    px: 2,
  },

  layout: {
    display: 'flex',
    gap: 4,
    width: '100%',
    maxWidth: 860,
    alignItems: 'flex-start',
  },

  card: {
    flex: 1,
    borderRadius: '12px',
    p: 3.5,
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },

  divider: {
    width: 40,
    height: 3,
    backgroundColor: '#1a2744',
    borderRadius: 2,
    mx: 'auto',
    mt: -1,
  },

  select: {
    borderRadius: '6px',
    fontSize: '0.9rem',
  },

  searchInput: {
    fontSize: '0.85rem',
    borderRadius: '6px',
  },

  teamNameInput: {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#e8eaf0',
      borderRadius: '6px',
      '& fieldset': { border: 'none' },
    },
  },

  button: {
    backgroundColor: '#1a2744',
    borderRadius: '6px',
    px: 3,
    py: 1,
    fontWeight: 700,
    fontSize: '0.9rem',
    textTransform: 'none',
    boxShadow: 'none',
    '&:hover': { backgroundColor: '#243358' },
    '&:disabled': { backgroundColor: '#ccc', color: '#888' },
  },
} as const;
