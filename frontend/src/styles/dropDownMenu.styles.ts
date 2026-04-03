export const menuPropsSx = {
  anchorOrigin: { vertical: 'bottom' as const, horizontal: 'left' as const },
  transformOrigin: { vertical: 'top' as const, horizontal: 'left' as const },
  PaperProps: {
    sx: {
      maxHeight: 150,
      backgroundColor: '#1a2744',
      color: 'white',
      '& .MuiMenuItem-root:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
      '& .Mui-selected': {
        backgroundColor: 'rgba(255, 255, 255, 0.2) !important',
      },
    },
  },
};
