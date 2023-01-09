import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import CardHeader from '@mui/material/CardHeader';
import i18n from 'meteor/universe:i18n';
import { Link } from 'react-router-dom';
import GroupAvatar from './GroupAvatar';
import { getGroupName } from '../../utils/utilsFuncs';

const useStyles = makeStyles()((theme) => ({
  noUnderline: {
    textDecoration: 'none',
    outline: 'none',
    '&:focus, &:hover': {
      backgroundColor: theme.palette.backgroundFocus.main,
    },
    display: 'flex',
    flexGrow: 100,
  },

  card: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: 5,
    '& .MuiCardHeader-root': {
      padding: 8,
    },
  },
}));

// eslint-disable-next-line no-unused-vars
const GroupDetailsList = ({ group, member, candidate, animator, admin }) => {
  const { type, avatar } = group;
  const { classes } = useStyles();

  const groupType = animator
    ? i18n.__('components.GroupDetails.groupAnimator')
    : member
    ? i18n.__('components.GroupDetails.groupMember')
    : candidate
    ? i18n.__('components.GroupDetails.groupCandidate')
    : type === 0
    ? i18n.__('components.GroupDetails.publicGroup')
    : type === 10
    ? i18n.__('components.GroupDetails.closedGroup')
    : i18n.__('components.GroupDetails.moderateGroup');

  return (
    <Card className={classes.card}>
      <Tooltip
        title={i18n.__('components.GroupDetails.singleGroupButtonLabel')}
        aria-label={i18n.__('components.GroupDetails.singleGroupButtonLabel')}
      >
        <Link to={`/groups/${group.slug}`} className={classes.noUnderline}>
          <CardHeader
            avatar={<GroupAvatar type={type} avatar={avatar} />}
            title={getGroupName(group)}
            titleTypographyProps={{
              variant: 'h6',
              color: 'primary',
            }}
            subheader={groupType}
            subheaderTypographyProps={{
              variant: 'body2',
              color: type === 0 ? 'primary' : 'secondary',
              style: { color: member || animator ? 'green' : null },
            }}
          />
        </Link>
      </Tooltip>
    </Card>
  );
};

GroupDetailsList.propTypes = {
  group: PropTypes.objectOf(PropTypes.any).isRequired,
  member: PropTypes.bool.isRequired,
  candidate: PropTypes.bool.isRequired,
  animator: PropTypes.bool.isRequired,
  admin: PropTypes.bool.isRequired,
};

export default GroupDetailsList;
