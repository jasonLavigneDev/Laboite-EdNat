/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React from 'react';
import Avatar from '@mui/material/Avatar';
import { makeStyles } from 'tss-react/mui';
import PropTypes from 'prop-types';
import PeopleIcon from '@mui/icons-material/People';
import LockIcon from '@mui/icons-material/Lock';
import BusinessIcon from '@mui/icons-material/Business';
import SecurityIcon from '@mui/icons-material/Security';
import Badge from '@mui/material/Badge';
import { useAppContext } from '../../contexts/context';

const useStyles = makeStyles()((theme) => ({
  badge: {
    borderRadius: '50%',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    padding: '4px',
    color: '#FFFFFF',
  },
  public: {
    backgroundColor: theme.palette.primary.main,
  },
  moderate: {
    backgroundColor: theme.palette.secondary.main,
  },
  private: {
    backgroundColor: '#cf3429',
  },
  automatic: {
    backgroundColor: '#cf3429',
  },
  avatar: {
    width: 250,
    height: 250,
  },
  avatarMobile: {
    width: 120,
    height: 120,
  },
  iconProfil: {
    fontSize: 100,
  },
}));

const GroupAvatar = ({ type, avatar, profil }) => {
  const { classes } = useStyles();
  const [{ isMobile }] = useAppContext();
  const getClasse = () => {
    const typeClasse = type === 0 ? 'public' : type === 10 ? 'private' : type === 15 ? 'automatic' : 'moderate';
    if (avatar === '') {
      const allClasses = `${classes[`${typeClasse}`]} ${classes[`${profil === 'true' ? 'iconProfil' : ''}`]}`;
      return allClasses;
    }
    const allClasses = `${classes.badge} ${classes[`${typeClasse}`]} avatar`;
    return allClasses;
  };

  const avatarIcon =
    type === 0 ? (
      <PeopleIcon className={getClasse()} />
    ) : type === 10 ? (
      <LockIcon className={getClasse()} />
    ) : type === 15 ? (
      <BusinessIcon className={getClasse()} />
    ) : (
      <SecurityIcon className={getClasse()} />
    );

  return avatar === '' || undefined ? (
    <Avatar
      className={`${getClasse()} ${classes[`${profil === 'true' ? (isMobile ? 'avatarMobile' : 'avatar') : ''}`]}`}
    >
      {avatarIcon}
    </Avatar>
  ) : (
    <Badge
      overlap="circular"
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      badgeContent={avatarIcon}
    >
      <Avatar
        alt="group"
        src={avatar}
        className={classes[`${profil === 'true' ? (isMobile ? 'avatarMobile' : 'avatar') : ''}`]}
      />
    </Badge>
  );
};

GroupAvatar.defaultProps = {
  avatar: '',
  profil: '',
};

GroupAvatar.propTypes = {
  type: PropTypes.number.isRequired,
  avatar: PropTypes.string,
  profil: PropTypes.string,
};

export default GroupAvatar;
