import React from 'react';
import i18n from 'meteor/universe:i18n';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Modal from '@material-ui/core/Modal';
import ClearIcon from '@material-ui/icons/Clear';
import PropTypes from 'prop-types';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { useHistory } from 'react-router-dom';
import { useAppContext } from '../../contexts/context';
import COMMON_STYLES from '../../themes/styles';

const useStyles = (isMobile) =>
  makeStyles((theme) => ({
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
  const classes = useStyles(isMobile)();
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
              <IconButton onClick={onClose}>
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
