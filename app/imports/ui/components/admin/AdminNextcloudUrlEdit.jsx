import React, { useState } from 'react';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from 'tss-react/mui';
import Grid from '@mui/material/Grid';
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
import { useAppContext } from '../../contexts/context';
import COMMON_STYLES from '../../themes/styles';

const useStyles = makeStyles()((theme, isMobile) => ({
  root: COMMON_STYLES.root,
  media: COMMON_STYLES.media,
  video: COMMON_STYLES.video,
  actions: COMMON_STYLES.actions,
  paper: COMMON_STYLES.paper(isMobile),
  iconWrapper: COMMON_STYLES.iconWrapper,
  groupCountInfo: COMMON_STYLES.groupCountInfo,
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(5),
  },
  alert: COMMON_STYLES.alert,
}));

const AdminNextCloudUrlEdit = ({ data, open, onClose }) => {
  const [{ isMobile }] = useAppContext();
  const [url, setUrl] = useState(data.url);
  const active = true;
  const { classes } = useStyles(isMobile);
  const changeURL = () => {
    Meteor.call(
      'nextcloud.updateURL',
      {
        url,
        active,
      },
      function callbackQuota(error) {
        if (error) {
          msg.error(error.message);
        } else {
          msg.success(i18n.__('api.methods.operationSuccessMsg'));
        }
      },
    );
    onClose();
  };

  const updateURL = (e) => {
    setUrl(e.target.value);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className={classes.paper}>
        <Card className={classes.root}>
          <CardHeader
            title={i18n.__('components.AdminNextCloudUrlEdit.subtitle')}
            action={
              <IconButton onClick={onClose} size="large">
                <ClearIcon />
              </IconButton>
            }
          />
          <CardContent>
            <Typography>{i18n.__('components.AdminNextCloudUrlEdit.mainText')}</Typography>
            <Grid>
              <TextField
                defaultValue={url}
                fullWidth
                label={i18n.__('components.AdminNextCloudUrlEdit.labelUrl')}
                type="text"
                onChange={updateURL}
              />
            </Grid>
          </CardContent>
          <CardActions className={classes.actions}>
            <div className={classes.buttonGroup}>
              <Button style={{ marginRight: 10 }} onClick={onClose}>
                {i18n.__('components.AdminNextCloudUrlEdit.cancel')}
              </Button>
              <Button onClick={changeURL} variant="contained" color="primary">
                {i18n.__('components.AdminNextCloudUrlEdit.ValidateForm')}
              </Button>
            </div>
          </CardActions>
        </Card>
      </div>
    </Modal>
  );
};

AdminNextCloudUrlEdit.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AdminNextCloudUrlEdit;
