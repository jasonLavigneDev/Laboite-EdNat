export const buttonOverrides = () => ({
  MuiButton: {
    styleOverrides: {
      root: {
        boxShadow: 'none !important',
        '&.MuiButton-contained': {
          border: '1px solid',
        },
      },
    },
  },
});
