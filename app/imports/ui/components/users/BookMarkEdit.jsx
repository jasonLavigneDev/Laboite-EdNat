import React, { useState, useEffect } from 'react';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from 'tss-react/mui';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardActions from '@mui/material/CardActions';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import ClearIcon from '@mui/icons-material/Clear';
import PropTypes from 'prop-types';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import { useAppContext } from '../../contexts/context';
import COMMON_STYLES from '../../themes/styles';

const useStyles = makeStyles()((theme, isMobile) => ({
  root: COMMON_STYLES.root,
  actions: COMMON_STYLES.actions,
  paper: COMMON_STYLES.paper(isMobile),
  widgetDisplay: {
    bottom: '200px',
  },
}));

const BookMarkEdit = ({ data, group, onEdit, open, onClose, method }) => {
  const [{ isMobile }] = useAppContext();
  const [url, setUrl] = useState(data.url);
  const [tag, setTag] = useState(data.tag);
  const [name, setName] = useState(data.name);
  const [isValid, setIsValid] = useState(false);
  const { classes } = useStyles(isMobile);
  const [favBookmarkDirectry, setFavBookmarkDirectry] = useState(true);
  const args = {
    url,
    name,
    tag,
  };

  if (method === 'bookmark') {
    args.groupId = group._id;
  } else if (method === 'userBookmark') {
    args.favUserBookmarkDirectry = favBookmarkDirectry;
  }

  useEffect(() => {
    setIsValid(!!url && !!name);
  }, [url, name]);

  const changeBookmark = () => {
    if (isValid) {
      Meteor.call(`${method}.updateURL`, args, function callbackQuota(error) {
        if (error) {
          msg.error(error.reason || error.message);
        } else {
          msg.success(i18n.__('api.methods.operationSuccessMsg'));
          onClose();
        }
      });
    } else {
      msg.error(i18n.__('api.bookmarks.creationFailed'));
    }
  };

  const createBookmark = () => {
    if (isValid) {
      Meteor.call(`${method}.create`, args, function callbackQuota(error, urlFinal) {
        if (error) {
          msg.error(error.reason || error.message);
        } else {
          msg.success(i18n.__('api.methods.operationSuccessMsg'));
          Meteor.call(`${method}.getFavicon`, { url: urlFinal });
          onClose();
        }
      });
    } else {
      msg.error(i18n.__('api.bookmarks.creationFailed'));
    }
  };

  const updateURL = (e) => {
    setUrl(e.target.value);
  };

  const updateName = (e) => {
    setName(e.target.value);
  };

  const updateTag = (e) => {
    setTag(e.target.value);
  };

  const updateFavBookmark = (e) => {
    setFavBookmarkDirectry(e.target.checked);
    args.favUserBookmarkDirectry = e.target.checked;
  };
  return (
    <Modal open={open} onClose={onClose} className={isMobile ? `${classes.widgetDisplay}` : ``}>
      <div className={classes.paper}>
        <Card className={classes.root}>
          <CardHeader
            title={
              onEdit ? i18n.__('components.BookMarkEdit.title-edit') : i18n.__('components.BookMarkEdit.title-create')
            }
            action={
              <IconButton onClick={onClose} size="large">
                <ClearIcon />
              </IconButton>
            }
          />
          <CardContent>
            <Typography>{i18n.__('components.BookMarkEdit.mainText')}</Typography>
            <TextField
              defaultValue={name}
              label={i18n.__('components.BookMarkEdit.labelName')}
              type="text"
              onChange={updateName}
              variant="outlined"
              fullWidth
            />
          </CardContent>
          <CardContent>
            {onEdit ? (
              <TextField
                defaultValue={url}
                disabled
                label={i18n.__('components.BookMarkEdit.labelUrl')}
                type="text"
                onChange={updateURL}
                variant="outlined"
                fullWidth
              />
            ) : (
              <TextField
                defaultValue={url}
                label={i18n.__('components.BookMarkEdit.labelUrl')}
                type="text"
                onChange={updateURL}
                variant="outlined"
                fullWidth
              />
            )}
          </CardContent>
          <CardContent>
            <TextField
              defaultValue={tag}
              label={i18n.__('components.BookMarkEdit.labelTag')}
              type="text"
              onChange={updateTag}
              variant="outlined"
              fullWidth
            />
          </CardContent>
          <CardContent>
            {i18n.__('components.ServiceDetails.favButtonLabelFav')}
            <Checkbox
              name="isFavBookmark"
              onChange={updateFavBookmark}
              checked={favBookmarkDirectry}
              inputProps={{ 'aria-label': 'primary checkbox' }}
            />
          </CardContent>
          <CardActions className={classes.actions}>
            <Button onClick={onClose}>{i18n.__('components.BookMarkEdit.cancel')}</Button>
            {onEdit ? (
              <Button onClick={changeBookmark} disabled={!isValid} variant="contained" color="primary">
                {i18n.__('components.BookMarkEdit.ValidateFormUpdate')}
              </Button>
            ) : (
              <Button onClick={createBookmark} disabled={!isValid} variant="contained" color="primary">
                {i18n.__('components.BookMarkEdit.ValidateFormCreate')}
              </Button>
            )}
          </CardActions>
        </Card>
      </div>
    </Modal>
  );
};

BookMarkEdit.defaultProps = {
  group: null,
};

BookMarkEdit.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  group: PropTypes.objectOf(PropTypes.any),
  onEdit: PropTypes.bool.isRequired,
  method: PropTypes.string.isRequired,
};

export default BookMarkEdit;
