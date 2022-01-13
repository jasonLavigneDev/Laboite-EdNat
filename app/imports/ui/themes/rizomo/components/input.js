export const inputOverrides = (palette) => ({
  MuiOutlinedInput: {
    root: {
      '&:hover .MuiOutlinedInput-notchedOutline': {
        border: 'none',
      },
      border: 'none',
      borderRadius: '0.25rem 0.25rem 0 0',
      backgroundColor: palette.background.inputs,
      boxShadow: `inset 0 -2px 0 0 ${palette.primary.main}`,
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        border: 'none',
        outline: `2px solid ${palette.background.inputs} !important`,
        borderWidth: 'unset',
        borderRadius: 'inherit',
      },
    },
    notchedOutline: {
      borderColor: 'rgba(0,0,0,0)',
    },
  },
  MuiInputLabel: {
    filled: {
      '&.MuiInputLabel-shrink': {
        transform: `translate(0px,-20px) scale(1)`,
      },
    },
  },
  MuiInputBase: {
    root: {
      backgroundColor: palette.background.inputs,
      '&.Mui-focused': {
        outline: `3px solid ${palette.primary.main} !important`,
        outlineOffset: ' 2px',
      },
    },
  },
  MuiFilledInput: {
    root: {
      backgroundColor: palette.background.inputs,
    },
    input: {
      '&:not([name="search"])': {
        padding: '20px 12px 20px',
      },
    },
  },
  MuiTextField: {
    root: {
      borderRadius: '0.25rem 0.25rem 0 0',
      border: 'none',
      marginTop: '25px',
      backgroundColor: palette.background.inputs,
      boxShadow: `inset 0 -2px 0 0 ${palette.primary.main}`,
      '&:hover': {
        border: 'unset',
      },
      '& .MuiInputLabel-shrink': {
        transform: `translate(60px,17px) scale(1)`,
      },
      '& .MuiInputLabel-shrink:not([id="search-label"])': {
        transform: `translate(0px,-20px) scale(1)`,
      },
      '& .MuiInputAdornment-positionStart': {
        backgroundColor: palette.primary.main,
        height: '100%',
        marginTop: '0 !important',
        padding: '28px 13px',
        color: palette.background.paper,
      },
      '& .MuiFilledInput-adornedStart': {
        paddingLeft: 0,
      },
      paddingLeft: '0 !important',
    },
  },
  MuiFormControl: {
    root: {
      marginTop: '25px',
    },
  },
});

export const inputProps = () => {};
