import { makeStyles } from 'tss-react/mui';

export const useNotifDisplayStyles = makeStyles()((theme, _params, classes) => ({
  popper: {
    zIndex: 1300,
    marginTop: 20,
    [`&[x-placement*="bottom"] .${classes.arrow}`]: {
      top: 0,
      left: 0,
      marginTop: '-0.9em',
      width: '3em',
      height: '1em',
      '&::before': {
        borderWidth: '0 1em 1em 1em',
        borderColor: `transparent transparent ${theme.palette.background.paper} transparent`,
      },
    },
  },
  paper: {
    width: 400,
    outline: 'none',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(1),
    maxWidth: 'calc(100vw - 10px)',
  },
  notifsList: {
    overflowY: 'scroll',
    maxHeight: 400,
  },
  notifsListEmpty: {},
  divflex: {
    display: 'flex',
    justifyContent: 'center',
  },
  footer: {
    textAlign: 'center',
    marginTop: 10,
  },
  button: {
    textTransform: 'none',
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.tertiary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.tertiary.main,
    },
  },
  tabs: {
    '& .MuiTab-wrapper': {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      '& div': {
        marginLeft: 8,
        marginBottom: 6,
        textTransform: 'none',
      },
    },
  },
  arrow: {
    position: 'absolute',
    fontSize: 7,
    width: '3em',
    height: '3em',
    '&::before': {
      content: '""',
      margin: 'auto',
      display: 'block',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    },
  },
}));
