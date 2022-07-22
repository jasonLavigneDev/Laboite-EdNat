export const switchOverrides = () => ({
  MuiSwitch: {
    styleOverrides: {
      root: {
        height: '45px',
        width: '60px',
      },
      switchBase: {
        top: '3px',
        left: '3px',
        '&.Mui-checked': {
          transform: 'translateX(16px)',
        },
      },
      thumb: {
        boxShadow: 'none',
        border: '1px solid black',
        bakcgroundColor: 'transparent',
      },
      track: {
        borderRadius: '10px',
      },
    },
  },
});
