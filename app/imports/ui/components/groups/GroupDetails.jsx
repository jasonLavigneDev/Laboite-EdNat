import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { makeStyles } from 'tss-react/mui';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import CardContent from '@mui/material/CardContent';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Link, useHistory } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CheckIcon from '@mui/icons-material/Check';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';

import i18n from 'meteor/universe:i18n';
import GroupAvatar from './GroupAvatar';

import { useAppContext } from '../../contexts/context';
import Spinner from '../system/Spinner';
import GroupBadge from './GroupBadge';
import COMMON_STYLES from '../../themes/styles';
import { getGroupName } from '../../utils/utilsFuncs';

const useStyles = makeStyles()((theme, { type, member, candidate, isShort }) => ({
  memberInfo: {
    color: 'green',
    marginLeft: 5,
    marginTop: 12,
    verticalAlign: 'center',
  },
  candidateInfo: {
    color: theme.palette.secondary.main,
    marginLeft: 5,
    marginTop: 12,
    verticalAlign: 'center',
  },
  avatar: {
    backgroundColor: member ? 'green' : type === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  cardActions: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cardActionShort: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'end',
    width: '100%',
  },
  cardHeader: {
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: isShort ? 10 : 32,
    paddingTop: 24,
    alignItems: 'start',
  },
  card: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  cardMedia: {
    maxWidth: '50px',
    objectFit: 'contain',
    borderRadius: theme.shape.borderRadius,
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    flexGrow: 1,
    backgroundColor: theme.palette.primary.light,
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 32,
    paddingTop: 24,
  },
  cardContentMobile: {
    flexGrow: 1,
    paddingLeft: 32,
    paddingRight: 32,
    paddingBottom: 32,
    paddingTop: theme.spacing(1),
    display: 'flex',
  },
  buttonText: COMMON_STYLES.buttonText({ member, candidate, type, theme }),
  paperChip: {
    display: 'flex',
    justifyContent: 'left',
    flexWrap: 'wrap',
    marginTop: theme.spacing(2),
    padding: theme.spacing(1),
    backgroundColor: 'transparent',
  },
  noUnderline: {
    textDecoration: 'none',
    outline: 'none',
    '&:focus, &:hover': {
      backgroundColor: theme.palette.backgroundFocus.main,
    },
    display: 'flex',
    flexGrow: 100,
  },
  chip: {
    margin: theme.spacing(0.5),
  },
  fab: {
    textTransform: 'none',
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.tertiary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.tertiary.main,
    },
  },
}));

function GroupDetails({ group = {}, isShort, member, candidate, admin, animator }) {
  const { type, avatar } = group;
  const [{ userId }] = useAppContext();
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const isAutomaticGroup = group.type === 15;

  const { classes } = useStyles({ group, member: member || animator, candidate, isShort, type });

  const handleJoinGroup = () => {
    const method = member ? 'unsetMemberOf' : type === 5 ? 'setCandidateOf' : 'setMemberOf';
    const message = member ? 'groupLeft' : type === 5 ? 'candidateSent' : 'groupJoined';
    if (candidate) {
      msg.info(i18n.__('components.GroupDetails.alreadyCandidate'));
    } else {
      setLoading(true);
      Meteor.call(`users.${method}`, { userId, groupId: group._id }, (err) => {
        setLoading(false);
        if (err) {
          msg.error(err.reason);
        } else {
          msg.success(i18n.__(`components.GroupDetails.${message}`));
        }
      });
    }
  };

  const icon = () => {
    if (member || animator) {
      return type === 0 ? <CheckIcon /> : <VerifiedUserIcon />;
    }
    if (type === 0) {
      return <ExitToAppIcon />;
    }
    if (candidate) {
      return <WatchLaterIcon />;
    }
    return <LockIcon />;
  };

  const buttonText = () => {
    if (type === 5) {
      return i18n.__('components.GroupDetails.askToJoinModerateGroupButtonLabel');
    }
    if (type !== 15) {
      return i18n.__('components.GroupDetails.joinPublicGroupButtonLabel');
    }
    return null;
  };

  const infoText = () => {
    if (candidate) {
      return (
        <Grid className={classes.candidateInfo} container direction="row">
          <Grid item xs={2}>
            <AccessTimeIcon />
          </Grid>
          <Grid item>
            <Typography>{i18n.__('components.GroupDetails.groupCandidate')}</Typography>
          </Grid>
        </Grid>
      );
    }

    if (member || admin || animator) {
      return (
        <Grid className={classes.memberInfo} container direction="row">
          <Grid item xs={2}>
            <CheckIcon />
          </Grid>
          <Grid item>
            <Typography>{i18n.__('components.GroupDetails.groupMember')}</Typography>
          </Grid>
        </Grid>
      );
    }

    return null;
  };

  let groupType = i18n.__('components.GroupDetails.moderateGroup');
  if (type === 0) {
    groupType = i18n.__('components.GroupDetails.publicGroup');
  } else if (type === 10) {
    groupType = i18n.__('components.GroupDetails.closedGroup');
  } else if (type === 15) {
    groupType = i18n.__('components.GroupDetails.automaticGroup');
  }

  return (
    <Card className={classes.card}>
      {loading && <Spinner full />}
      <Tooltip
        title={i18n.__('components.GroupDetails.singleGroupButtonLabel')}
        aria-label={i18n.__('components.GroupDetails.singleGroupButtonLabel')}
      >
        <Link to={`/groups/${group.slug}`} className={classes.noUnderline}>
          <CardHeader
            className={classes.cardHeader}
            avatar={
              animator || admin ? (
                <GroupBadge
                  overlap="circular"
                  className={classes.badge}
                  color="error"
                  badgeContent={group.numCandidates}
                >
                  <GroupAvatar type={type} avatar={avatar} />
                </GroupBadge>
              ) : (
                <GroupAvatar type={type} avatar={avatar} />
              )
            }
            title={getGroupName(group)}
            titleTypographyProps={{
              variant: 'h6',
              color: 'primary',
              className: classes.title,
            }}
            subheader={groupType}
            subheaderTypographyProps={{
              variant: 'body2',
              color: type === 0 ? 'primary' : 'secondary',
              style: {
                color: member || animator ? 'green' : null,
                display: 'flex',
                alignItems: 'center',
              },
            }}
          />
        </Link>
      </Tooltip>
      <CardContent className={isShort ? classes.cardContentMobile : classes.cardContent}>
        {!isShort && <Typography variant="body1">{group.description}</Typography>}
        <div className={isShort ? classes.cardActionShort : classes.cardActions}>
          {!member && !animator && !candidate && !isAutomaticGroup ? (
            <Button
              startIcon={icon()}
              className={classes.buttonText}
              size="large"
              variant={member || animator || candidate ? 'text' : 'contained'}
              disableElevation={member || animator || candidate}
              onClick={member || animator || candidate ? null : handleJoinGroup}
            >
              {buttonText()}
            </Button>
          ) : (
            infoText()
          )}
          {admin && (
            <Tooltip
              title={i18n.__('components.GroupDetails.manageGroupButtonLabel')}
              aria-label={i18n.__('components.GroupDetails.manageGroupButtonLabel')}
            >
              <Link
                to={{ pathname: `/admingroups/${group._id}`, state: { prevPath: history.location.pathname } }}
                tabIndex={-1}
              >
                <IconButton color="primary" size="large">
                  <EditIcon />
                </IconButton>
              </Link>
            </Tooltip>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

GroupDetails.propTypes = {
  group: PropTypes.objectOf(PropTypes.any).isRequired,
  isShort: PropTypes.bool.isRequired,
  member: PropTypes.bool.isRequired,
  candidate: PropTypes.bool.isRequired,
  admin: PropTypes.bool.isRequired,
  animator: PropTypes.bool.isRequired,
};

export default GroupDetails;
