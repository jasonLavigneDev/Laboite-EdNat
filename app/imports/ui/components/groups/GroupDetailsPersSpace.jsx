import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import { useHistory } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import Button from '@mui/material/Button';
import Zoom from '@mui/material/Zoom';
import PublishIcon from '@mui/icons-material/Publish';

import i18n from 'meteor/universe:i18n';
import GroupAvatar from './GroupAvatar';
import GroupBadge from './GroupBadge';
import { getGroupName } from '../../utils/utilsFuncs';

const useStyles = makeStyles()((theme, { type, admin, member, candidate }) => ({
  card: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeaderContent: {
    display: 'grid',
  },
  actionarea: {
    textDecoration: 'none',
    outline: 'none',
    '&:hover': {
      backgroundColor: theme.palette.backgroundFocus.main,
    },
    flexGrow: 100,
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingTop: 0,
    paddingBottom: 10,
  },
  cardActionsUnique: {
    justifyContent: 'end',
    paddingTop: 0,
    paddingBottom: 10,
  },
  span: {
    display: 'flex',
    flex: '1 0 auto',
  },
  avatar: {
    backgroundColor: member ? 'green' : type === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
    width: theme.spacing(5),
    height: theme.spacing(5),
    margin: 'auto',
  },
  buttonText: {
    textTransform: 'none',
    color: member
      ? 'green'
      : candidate
      ? theme.palette.secondary.main
      : admin
      ? theme.palette.primary.main
      : theme.palette.text.disabled,
    fontWeight: 'bold',
  },
  serviceName: {
    color: theme.palette.primary.main,
  },
  fab: {
    textTransform: 'none',
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.tertiary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.tertiary.main,
    },
  },
}));

function GroupDetailsPersSpace({
  group = {},
  member,
  candidate,
  admin,
  animator,
  globalAdmin,
  isMobile,
  customDrag,
  isSorted,
  needUpdate,
}) {
  const history = useHistory();
  const { type } = group;
  const { classes } = useStyles({ group, admin, member: member || animator, candidate, type });

  // const icon = () => {
  //   if (member || animator) {
  //     return type === 0 ? <CheckIcon /> : <VerifiedUserIcon />;
  //   }
  //   if (type === 0) {
  //     return <ExitToAppIcon />;
  //   }
  //   if (candidate) {
  //     return <WatchLaterIcon />;
  //   }
  //   return <LockIcon />;
  // };

  const text = () => {
    if (animator) {
      return i18n.__('components.GroupDetails.groupAnimator');
    }
    if (member) {
      return i18n.__('components.GroupDetails.groupMember');
    }
    if (candidate) {
      return i18n.__('components.GroupDetailsPersSpace.groupCandidate');
    }
    if (admin) {
      return i18n.__('components.GroupDetailsPersSpace.groupAdmin');
    }
    return i18n.__('components.GroupDetailsPersSpace.groupNone');
  };
  const hasAdmin = admin || globalAdmin;

  const backToDefaultButtonLabel = i18n.__('components.GroupDetailsPersSpace.backToDefault');

  const handleBackToDefault = () => {
    Meteor.call('personalspaces.backToDefaultElement', { elementId: group._id, type: 'group' }, (err) => {
      if (err) {
        msg.error(err.reason);
      } else {
        needUpdate();
      }
    });
  };

  return (
    <Card className={classes.card}>
      <Tooltip
        TransitionComponent={Zoom}
        enterDelay={600}
        title={
          <>
            <Typography>{getGroupName(group)}</Typography>
            {i18n.__('pages.PersonalPage.typeGroup')}
          </>
        }
        aria-label={getGroupName(group)}
      >
        {/* this span is to allow display of tooltip when CardActionArea is disabled 
        (occur when a service is disabled) */}
        <span className={classes.span}>
          <CardActionArea
            className={classes.actionarea}
            onClick={() => history.push(`/groups/${group.slug}`)}
            disabled={customDrag}
          >
            <CardHeader
              classes={{ content: classes.cardHeaderContent }}
              avatar={
                animator || hasAdmin ? (
                  <GroupBadge
                    overlap="circular"
                    className={classes.badge}
                    color="error"
                    badgeContent={group.numCandidates}
                  >
                    <GroupAvatar type={type} avatar={group.avatar} className={classes.avatar} />
                  </GroupBadge>
                ) : (
                  <GroupAvatar type={type} avatar={group.avatar} className={classes.avatar} />
                )
              }
              title={
                <Typography className={classes.serviceName} gutterBottom noWrap={!isMobile} variant="h6" component="h2">
                  {getGroupName(group)}
                </Typography>
              }
              subheader={
                <Typography className={classes.buttonText} variant="body2" component="p">
                  {text()}
                </Typography>
              }
            />
          </CardActionArea>
        </span>
      </Tooltip>
      {/* <CardActions className={classes.cardActionsUnique}>
        {hasAdmin || globalAdmin && (
          <Tooltip
            title={i18n.__('components.GroupDetails.manageGroupButtonLabel')}
            aria-label={i18n.__('components.GroupDetails.manageGroupButtonLabel')}
          >
            <Link to={`/admingroups/${group._id}`}>
              <Button variant="outlined" size="small" className={classes.button}>
                <EditIcon />
              </Button>
            </Link>
          </Tooltip>
        )}
      </CardActions> */}
      {customDrag && isSorted ? (
        <CardActions className={classes.cardActionsUnique}>
          <Tooltip title={backToDefaultButtonLabel} aria-label={backToDefaultButtonLabel}>
            <Button variant="outlined" size="small" className={classes.fab} onClick={handleBackToDefault}>
              <PublishIcon />
            </Button>
          </Tooltip>
        </CardActions>
      ) : null}
    </Card>
  );
}

GroupDetailsPersSpace.propTypes = {
  group: PropTypes.objectOf(PropTypes.any).isRequired,
  member: PropTypes.bool.isRequired,
  candidate: PropTypes.bool.isRequired,
  admin: PropTypes.bool.isRequired,
  animator: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
  globalAdmin: PropTypes.bool.isRequired,
  customDrag: PropTypes.bool.isRequired,
  isSorted: PropTypes.bool.isRequired,
  needUpdate: PropTypes.func.isRequired,
};

export default GroupDetailsPersSpace;
