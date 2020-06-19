import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import LaunchIcon from '@material-ui/icons/Launch';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import { Avatar, Tooltip, IconButton, TextField, CardActionArea, CardActions, Typography } from '@material-ui/core';
import i18n from 'meteor/universe:i18n';
import { useObjectState } from '../../utils/hooks';

const linkColor = 'brown';
const useStyles = makeStyles((theme) => ({
  avatar: {
    backgroundColor: linkColor,
    width: theme.spacing(5),
    height: theme.spacing(5),
    margin: 'auto',
  },
  cardActions: {
    justifyContent: 'space-between',
    paddingTop: 0,
    paddingBottom: 0,
  },
  card: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  cardContent: {
    padding: 10,
  },
  cardContentEdit: {
    padding: 10,
    paddingBottom: 0,
  },
  cardContentForm: {
    padding: 10,
    paddingBottom: 0,
    textAlign: 'center',
    marginTop: 20,
  },
  actionarea: {
    textAlign: 'center',
    marginTop: 20,
  },
  linkName: {
    color: theme.palette.primary.main,
  },
  linkUrl: {
    color: linkColor,
  },
  zoneButton: {
    color: theme.palette.primary.main,
    opacity: 0.5,
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
}));

function PersonalLinkDetails({ link, globalEdit, delLink, updateLink }) {
  const { title = '', url = '', element_id: elementId } = link;

  const classes = useStyles();
  const [localEdit, setLocalEdit] = useState(title === '');
  const [state, setState] = useObjectState({ title, url });

  const handleLocalEdit = (event) => {
    setLocalEdit(!localEdit);
    if (!event.target.checked) {
      if (state.title !== title || state.url !== url) {
        updateLink({ element_id: elementId, ...state });
      }
    }
  };

  const handleChangeState = (event) => {
    const { name, value } = event.target;
    setState({ [name]: value });
  };

  const showData = () => {
    if (globalEdit && localEdit) {
      return (
        <CardContent className={classes.cardContentForm}>
          <form onSubmit={handleLocalEdit} className={classes.form}>
            <TextField
              label={i18n.__('components.PersonalLinkDetails.titleLabel')}
              value={state.title}
              name="title"
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
          </form>{' '}
        </CardContent>
      );
    }
    return (
      <CardActionArea
        className={classes.actionarea}
        onClick={() => window.open(url, '_blank', 'noreferrer,noopener')}
        disabled={globalEdit}
      >
        {globalEdit && localEdit ? null : (
          <Avatar className={classes.avatar}>
            <LaunchIcon />
          </Avatar>
        )}
        <CardContent className={globalEdit ? classes.cardContentEdit : classes.cardContent}>
          <Typography className={classes.linkName} gutterBottom noWrap variant="h6" component="h2">
            {state.title || i18n.__('components.PersonalLinkDetails.titleLabel')}
          </Typography>
          <Typography variant="body2" className={classes.linkUrl} noWrap component="p">
            {state.url || i18n.__('components.PersonalLinkDetails.urlLabel')}
          </Typography>
        </CardContent>
      </CardActionArea>
    );
  };

  return (
    <Card className={classes.card} elevation={3}>
      {showData()}
      {globalEdit ? (
        <CardActions className={classes.cardActions}>
          <Tooltip
            title={i18n.__(`components.PersonalLinkDetails.${localEdit ? 'saveLink' : 'modifyLink'}`)}
            aria-label={i18n.__(`components.PersonalLinkDetails.${localEdit ? 'saveLink' : 'modifyLink'}`)}
          >
            <IconButton className={classes.zoneButton} color="primary" onClick={handleLocalEdit}>
              {localEdit ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip
            title={i18n.__('components.PersonalLinkDetails.delLink')}
            aria-label={i18n.__('components.PersonalLinkDetails.delLink')}
          >
            <IconButton className={classes.zoneButton} color="primary" onClick={delLink(elementId)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      ) : null}
    </Card>
  );
}

PersonalLinkDetails.propTypes = {
  link: PropTypes.objectOf(PropTypes.any).isRequired,
  globalEdit: PropTypes.bool.isRequired,
  updateLink: PropTypes.func.isRequired,
  delLink: PropTypes.func.isRequired,
};

export default PersonalLinkDetails;
