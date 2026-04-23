export const adminSx = {
  root: {
    minHeight: '100vh',
    backgroundColor: '#1a2744',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pt: 5,
    px: 2,
  },

  title: {
    color: 'white',
    fontWeight: 700,
    textAlign: 'center',
    textTransform: 'uppercase',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    mb: 4,
    gap: 2,
    '&::before, &::after': {
      content: '""',
      height: '3px',
      width: '50px',
      backgroundColor: 'white',
    },
  },

  addButton: {
    width: 40,
    height: 40,
    borderRadius: '6px',
    backgroundColor: '#27ae60',
    color: '#fff',
    fontWeight: 800,
    fontSize: '1.2rem',
    p: 0,
    '&:hover': { backgroundColor: '#219150' },
  },

  allMembersButton: {
    borderColor: '#d8a46b',
    color: '#d8a46b',
    fontWeight: 700,
    textTransform: 'none',
    borderRadius: '8px',
    '&:hover': { backgroundColor: 'rgba(216,164,107,0.1)' },
  },

  promoteDialogPaper: {
    backgroundColor: '#1a2744',
    borderRadius: '8px',
    maxHeight: '60%',
  },

  promoteDialogTitle: {
    color: '#fff',
    fontWeight: 800,
    textAlign: 'center',
    textDecoration: 'underline',
  },

  promoteMemberRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    p: 1.2,
    borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  promoteIconButton: {
    backgroundColor: '#27ae60',
    color: '#fff',
    width: 30,
    height: 30,
    '&:hover': { backgroundColor: '#219150' },
  },
} as const;
