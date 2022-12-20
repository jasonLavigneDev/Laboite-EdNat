import { withStyles } from 'tss-react/mui';
import { keyframes } from 'tss-react';
import Badge from '@mui/material/Badge';

export const badgeStyle = () => ({
  badge: {
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '89%',
      height: '100%',
      borderRadius: '50%',
      animation: `${keyframes`
        0% {
          transform: scale(.8);
          opacity: 1;
        }
        100% {
          transform: scale(2.4);
          opacity: 0;
        }
      `} 1.2s infinite ease-in-out`,
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {},
});

export default withStyles(Badge, (theme) => badgeStyle(theme));
