import React, { useState } from 'react';
import { Random } from 'meteor/random';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LaunchIcon from '@mui/icons-material/Launch';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import RemoveIcon from '@mui/icons-material/Remove';
import PublishIcon from '@mui/icons-material/Publish';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import Zoom from '@mui/material/Zoom';
import Button from '@mui/material/Button';
import i18n from 'meteor/universe:i18n';
import { useObjectState } from '../../utils/hooks';
import { useAppContext } from '../../contexts/context';

const linkColor = 'brown';
const useStyles = makeStyles()((theme) => ({
  card: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeaderContent: { display: 'grid' },
  cardContentForm: {
    padding: 10,
    paddingBottom: 0,
    textAlign: 'center',
    marginTop: 20,
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingTop: 0,
    paddingBottom: 0,
    flexShrink: 0,
  },
  span: {
    display: 'flex',
    flex: '1 0 auto',
  },
  avatar: {
    backgroundColor: linkColor,
    width: theme.spacing(5),
    height: theme.spacing(5),
    margin: 'auto',
  },
  actionarea: {
    textDecoration: 'none',
    outline: 'none',
    '&:hover': {
      backgroundColor: theme.palette.backgroundFocus.main,
    },
    flexGrow: 100,
  },
  linkName: {
    color: theme.palette.primary.main,
  },
  linkUrl: {
    color: linkColor,
  },
  zoneButton: {
    color: theme.palette.primary.main,
    cursor: 'pointer',
    '&:hover': {
      opacity: 1,
      color: theme.palette.error.main,
    },
  },
  form: {
    marginTop: 10,
    marginBottom: 10,
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

function PersonalLinkDetails({ link, globalEdit, isMobile, isSorted, needUpdate, type }) {
  const { name = '', url = '', tag = '', _id = Random.id(), icon = '' } = link;
  const { classes } = useStyles();
  const [{ userId }] = useAppContext();
  const [localEdit, setLocalEdit] = useState(name === '');
  const [state, setState] = useObjectState({ name, url, tag });
  const favButtonLabel = i18n.__('components.PersonalLinkDetails.favButtonLabelNoFav');
  const backToDefaultButtonLabel = i18n.__('components.PersonalLinkDetails.backToDefault');

  const handleLocalEdit = (event) => {
    setLocalEdit(!localEdit);
    if (!event.target.checked) {
      if (state.name !== name || state.url !== url) {
        if (type === 'link') {
          Meteor.call('userBookmark.updateURL', { id: _id, url: state.url, name: state.name, tag: link.tag });
          Meteor.call('userBookmark.getFavicon', { url: state.url });
        } else if (type === 'groupLink') {
          Meteor.call(
            'bookmark.updateURL',
            {
              id: _id,
              url: state.url,
              name: state.name,
              tag: link.tag,
              groupId: link.groupId,
            },
            (err) => {
              if (err) {
                msg.error(err.reason);
              }
            },
          );
          Meteor.call('bookmark.getFavicon', { url: state.url });
        }
      }
    }
  };

  const handleFavorite = () => {
    if (type === 'link') {
      Meteor.call('userBookmarks.unfavUserBookmark', { bookmarkId: link._id }, (err) => {
        if (err) {
          msg.error(err.reason);
        } else {
          msg.success(i18n.__('components.PersonalLinkDetails.unfavSuccessMsg'));
        }
      });
    } else if (type === 'groupLink') {
      Meteor.call('bookmarks.unfavGroupBookmark', { bookmarkId: link._id }, (err) => {
        if (err) {
          msg.error(err.reason);
        } else {
          msg.success(i18n.__('components.PersonalLinkDetails.unfavSuccessMsg'));
        }
      });
    }
  };

  const handleBackToDefault = () => {
    Meteor.call('personalspaces.backToDefaultElement', { elementId: link._id, type }, (err) => {
      if (err) {
        msg.error(err.reason);
      } else {
        needUpdate();
      }
    });
  };

  const handleChangeState = (event) => {
    const { name: linkName, value } = event.target;
    setState({ [linkName]: value });
  };

  const showAvatar = () => {
    if (icon !== '') {
      return <Avatar variant="rounded" src={icon} />;
    }
    return (
      <Avatar className={classes.avatar}>
        <LaunchIcon />
      </Avatar>
    );
  };

  const canEdit = () => {
    if (type === 'link') return true;
    if (type === 'groupLink' && link.author === userId) return true;
    return false;
  };

  const showData = () => {
    if (globalEdit && localEdit) {
      // We can custom the link's fields
      return (
        <CardContent className={classes.cardContentForm}>
          <form onSubmit={handleLocalEdit} className={classes.form}>
            <TextField
              label={i18n.__('components.PersonalLinkDetails.titleLabel')}
              value={state.name}
              name="name"
              onChange={handleChangeState}
              autoFocus
            />
            <TextField
              label={i18n.__('components.PersonalLinkDetails.urlLabel')}
              value={state.url}
              name="url"
              onChange={handleChangeState}
            />
            <button type="submit" aria-label="masked" style={{ display: 'none' }} />
          </form>
        </CardContent>
      );
    }
    return (
      <Tooltip
        TransitionComponent={Zoom}
        enterDelay={600}
        title={
          <>
            <Typography>{state.url}</Typography>
            {i18n.__('pages.PersonalPage.typeLink')}
          </>
        }
        aria-label={state.name}
      >
        {/* this span is to allow display of tooltip when CardActionArea is disabled 
        (occur when a service is disabled) */}
        <span className={classes.span}>
          <CardActionArea
            className={classes.actionarea}
            onClick={() => window.open(url, '_blank', 'noreferrer,noopener')}
            disabled={globalEdit}
          >
            <CardHeader
              classes={{ content: classes.cardHeaderContent }}
              avatar={showAvatar()}
              title={
                <Typography className={classes.linkName} gutterBottom noWrap={!isMobile} variant="h6" component="h2">
                  {state.name || i18n.__('components.PersonalLinkDetails.titleLabel')}
                </Typography>
              }
            />
          </CardActionArea>
        </span>
      </Tooltip>
    );
  };

  return (
    <Card className={classes.card}>
      {showData()}
      {globalEdit && canEdit() ? (
        <CardActions className={classes.cardActions}>
          <Tooltip
            title={i18n.__(`components.PersonalLinkDetails.${localEdit ? 'saveLink' : 'modifyLink'}`)}
            aria-label={i18n.__(`components.PersonalLinkDetails.${localEdit ? 'saveLink' : 'modifyLink'}`)}
          >
            <IconButton className={classes.zoneButton} color="primary" onClick={handleLocalEdit} size="large">
              {localEdit ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Tooltip>
          {isSorted ? (
            <Tooltip title={backToDefaultButtonLabel} aria-label={backToDefaultButtonLabel}>
              <Button variant="outlined" size="small" className={classes.fab} onClick={handleBackToDefault}>
                <PublishIcon />
              </Button>
            </Tooltip>
          ) : null}
          <Tooltip title={favButtonLabel} aria-label={favButtonLabel}>
            <Button variant="outlined" size="small" className={classes.fab} onClick={handleFavorite}>
              <RemoveIcon />
            </Button>
          </Tooltip>
        </CardActions>
      ) : null}
    </Card>
  );
}

PersonalLinkDetails.propTypes = {
  link: PropTypes.objectOf(PropTypes.any).isRequired,
  globalEdit: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
  isSorted: PropTypes.bool.isRequired,
  needUpdate: PropTypes.func.isRequired,
  type: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default PersonalLinkDetails;
