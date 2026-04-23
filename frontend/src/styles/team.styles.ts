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
    minWidth: 180,
    fontWeight: 800,
    color: '#1a2744',
    fontSize: '1.2rem',
  },

  infoRowValue: {
    flex: 1,
    backgroundColor: '#1a2744',
    borderRadius: '6px',
    px: 1,
    py: 1.3,
    textAlign: 'center',
  },

  leaveButton: {
    backgroundColor: '#c0392b',
    borderRadius: '8px',
    px: 3,
    py: 1,
    fontSize: '1rem',
    fontWeight: 700,
    textTransform: 'none',
    boxShadow: 'none',
    ml: 'auto',

    '&:hover': {
      backgroundColor: '#a93226',
    },
  },

  gameTag: {
    cursor: 'pointer',
    '&:hover': { textDecoration: 'underline' },
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

    '& .MuiTab-root.Mui-selected': {
      color: '#d8a46b',
    },

    '& .MuiTabs-indicator': {
      backgroundColor: '#d8a46b',
    },
  },

  tournamentCard: {
    borderRadius: '8px',
    p: 2,
    backgroundColor: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  columnTitle: {
    color: '#fff',
    mb: 2,
    textAlign: 'center',
    minHeight: '42px',
    textDecoration: 'underline',
  },

  mainTitle: {
    color: 'white',
    fontWeight: 900,
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ml: 10,
    gap: 2,
    '&::before, &::after': {
      content: '""',
      height: '3px',
      width: '50px',
      backgroundColor: 'white',
    },
  },
} as const;
