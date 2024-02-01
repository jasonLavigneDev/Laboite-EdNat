import React, { useState } from 'react';
import Card from '@mui/material/Card';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from 'tss-react/mui';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import ClearIcon from '@mui/icons-material/Clear';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { useAppContext } from '../../contexts/context';
import COMMON_STYLES from '../../themes/styles';

const useStyles = makeStyles()((theme, isMobile) => ({
  root: COMMON_STYLES.root,
  media: COMMON_STYLES.media,
  video: COMMON_STYLES.video,
  actions: COMMON_STYLES.actions,
  paper: COMMON_STYLES.paper(isMobile, '50%'),
  iconWrapper: COMMON_STYLES.iconWrapper,
  groupCountInfo: COMMON_STYLES.groupCountInfo,
  alert: COMMON_STYLES.alert,
}));

const AdminGroupQuota = ({ data, open, onClose, fetchUsers }) => {
  const [{ isMobile }] = useAppContext();
  const [quota, setQuota] = useState(data.groupQuota);
  const { classes } = useStyles(isMobile);
  const changeQuota = () => {
    const quotaInt = parseInt(quota, 10);
    Meteor.call(
      'users.setQuota',
      {
        quota: quotaInt,
        userId: data._id,
      },
      function callbackQuota(error) {
        if (error) {
          msg.error(error.message);
        } else {
          msg.success(i18n.__('api.methods.operationSuccessMsg'));
          fetchUsers();
        }
      },
    );
    onClose();
  };

  const updateQuota = (e) => {
    setQuota(e.target.value);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className={classes.paper}>
        <Card className={classes.root}>
          <CardHeader
            title={i18n.__('components.AdminGroupQuota.subtitle') + data.username}
            action={
              <IconButton onClick={onClose} size="large">
                <ClearIcon />
              </IconButton>
            }
          />
          <CardContent>
            <Typography>{i18n.__('components.AdminGroupQuota.mainText')}</Typography>
            <TextField
              defaultValue={data.groupQuota}
              type="number"
              onChange={updateQuota}
              InputProps={{
                inputProps: {
                  max: 9999,
                  min: data.groupCount || 0,
                },
              }}
            />
            <Typography className={classes.groupCountInfo}>
              {data.groupCount} {i18n.__('components.AdminGroupQuota.createdGroup')}
            </Typography>
          </CardContent>
          <CardActions className={classes.actions}>
            <Button onClick={onClose}>{i18n.__('components.AdminGroupQuota.cancel')}</Button>
            <Button onClick={changeQuota} variant="contained" color="primary">
              {i18n.__('components.AdminGroupQuota.ValidateForm')}
            </Button>
          </CardActions>
        </Card>
      </div>
    </Modal>
  );
};

AdminGroupQuota.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fetchUsers: PropTypes.func.isRequired,
};

export default AdminGroupQuota;
