import React from 'react';
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
import Typography from '@mui/material/Typography';
import { useHistory } from 'react-router-dom';
import { useAppContext } from '../../contexts/context';
import COMMON_STYLES from '../../themes/styles';

const useStyles = makeStyles()((theme, isMobile) => ({
  root: COMMON_STYLES.root,
  actions: COMMON_STYLES.actions,
  paper: COMMON_STYLES.paper(isMobile),
  groupCountInfo: COMMON_STYLES.groupCountInfo,
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(5),
  },
  alert: COMMON_STYLES.alert,
}));

const AdminGroupDelete = ({ group, open, onClose }) => {
  const [{ isMobile }] = useAppContext();
  const history = useHistory();
  const { classes } = useStyles(isMobile);
  const removeGroup = () => {
    Meteor.call('groups.removeGroup', { groupId: group._id }, (err) => {
      if (err) {
        msg.error(err.reason);
      } else {
        msg.success(i18n.__('pages.AdminSingleGroupPage.groupRemoved'));
        const loc = window.location.toString();
        if (loc.includes('/admin/groups')) history.push('/admin/groups');
        else history.push('/groups');
      }
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className={classes.paper}>
        <Card className={classes.root}>
          <CardHeader
            title={i18n.__('components.AdminGroupDelete.subtitle')}
            action={
              <IconButton onClick={onClose} size="large">
                <ClearIcon />
              </IconButton>
            }
          />
          <CardContent>
            <Typography>{i18n.__('components.AdminGroupDelete.mainText')}</Typography>
          </CardContent>
          <CardActions className={classes.actions}>
            <div className={classes.buttonGroup}>
              <Button style={{ marginRight: 10 }} onClick={onClose}>
                {i18n.__('components.AdminGroupDelete.cancel')}
              </Button>
              <Button onClick={removeGroup} variant="contained" style={{ backgroundColor: 'red', color: 'white' }}>
                {i18n.__('components.AdminGroupDelete.ValidateForm')}
              </Button>
            </div>
          </CardActions>
        </Card>
      </div>
    </Modal>
  );
};

AdminGroupDelete.propTypes = {
  group: PropTypes.objectOf(PropTypes.any).isRequired,
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AdminGroupDelete;
