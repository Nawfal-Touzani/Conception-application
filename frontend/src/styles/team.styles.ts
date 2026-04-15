export const teamPageSx = {
  root: {
    flexGrow: 1,
    backgroundColor: '#1a2744',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pt: 5,
    px: 2,
  },

  layout: {
    display: 'flex',
    gap: 4,
    width: '100%',
    maxWidth: 1200,
    alignItems: 'flex-start',
  },

  infoCard: {
    flex: '0 0 420px',
    borderRadius: '12px',
    p: 5,
    backgroundColor: '#fff',
  },

  infoRowLabel: {
    minWidth: 270,
    fontWeight: 800,
    color: '#1a2744',
    fontSize: '1.4rem',
  },

  infoRowValue: {
    flex: 1,
    backgroundColor: '#1a2744',
    borderRadius: '6px',
    px: 2,
    py: 1.3,
    textAlign: 'center',
  },

  leaveButton: {
    backgroundColor: '#c0392b',
    borderRadius: '10px',
    px: 6,
    py: 1.2,
    fontSize: '1rem',
    fontWeight: 700,
    textTransform: 'none',
    boxShadow: 'none',
    '&:hover': { backgroundColor: '#a93226' },
  },

  memberItem: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    px: 3,
    py: 1.5,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    cursor: 'pointer',
  },

  nominateButton: {
    ml: 'auto',
    flexShrink: 0,
    borderColor: '#1a2744',
    color: '#1a2744',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.9rem',
    borderRadius: '6px',
    '&:hover': { backgroundColor: '#1a2744', color: '#fff' },
  },

  tabs: {
    mb: 2,
    '& .MuiTab-root': {
      color: 'rgba(255,255,255,0.6)',
      textTransform: 'none',
      fontWeight: 600,
    },
    '& .Mui-selected': { color: '#fff' },
    '& .MuiTabs-indicator': { backgroundColor: '#fff' },
  },

  tournamentCard: {
    borderRadius: '8px',
    p: 2,
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
} as const;
