export const snackbarOverrides = (palette) => ({
  MuiSnackbar: {
    styleOverrides: {
      root: {
        '& .MuiPaper-root': {
          padding: '2px 10px',
        },
        '& .MuiAlert-message': {
          backgroundColor: palette.background.paper,
          color: palette.text.primary,
          padding: 8,
        },
        '& .MuiAlert-action': {
          backgroundColor: palette.background.paper,
          color: palette.text.primary,
        },
      },
    },
  },
});
