import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import 'react-quill/dist/quill.snow.css';
import { makeStyles } from 'tss-react/mui';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import i18n from 'meteor/universe:i18n';
import { useObjectState } from '../../utils/hooks';
import { updateAppsettings } from '../../../api/appsettings/methods';
import Spinner from '../system/Spinner';
import '../../utils/QuillVideo';

const useStyles = makeStyles()((theme) => ({
  root: {
    padding: `0 ${theme.spacing(2)} 0 ${theme.spacing(2)}`,
    flex: 1,
  },
  wysiwyg: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(5),
  },
}));

const LegalComponent = ({ tabkey, ...props }) => {
  const configData = props[tabkey] || {};
  const { classes } = useStyles();
  const [state, setState] = useObjectState(configData);
  const [loading, setLoading] = useState(true);
  const [changes, setChanges] = useState(false);

  useEffect(() => {
    setState({ ...configData });
    setLoading(false);
  }, []);

  useEffect(() => {
    if (JSON.stringify(state) !== JSON.stringify(configData)) {
      setChanges(true);
    } else {
      setChanges(false);
    }
  }, [state]);

  const onUpdateField = (event) => {
    const { name, value } = event.target;
    setState({ [name]: value });
  };

  const onSubmitUpdateconfigData = () => {
    setLoading(true);
    updateAppsettings.call({ ...state, key: tabkey }, (error) => {
      setLoading(false);
      if (error) {
        msg.error(error.message);
      } else {
        msg.success(i18n.__('api.methods.operationSuccessMsg'));
      }
    });
  };

  const onCancel = () => {
    setState({ ...configData });
  };

  if (loading && !!state) {
    return <Spinner full />;
  }

  return (
    <form className={classes.root}>
      <Typography variant="h4">{i18n.__(`components.LegalComponent.title_${tabkey}`)}</Typography>
      <TextField
        onChange={onUpdateField}
        value={state.link}
        name="link"
        label={i18n.__(`components.LegalComponent.link_${tabkey}`)}
        variant="outlined"
        fullWidth
        margin="normal"
      />
      {changes && (
        <div className={classes.buttonGroup}>
          <Button variant="contained" color="grey" onClick={onCancel} disabled={loading}>
            {i18n.__('components.LegalComponent.cancel')}
          </Button>

          <Button variant="contained" color="primary" onClick={onSubmitUpdateconfigData} disabled={loading}>
            {i18n.__('components.LegalComponent.update')}
          </Button>
        </div>
      )}
    </form>
  );
};

LegalComponent.propTypes = {
  tabkey: PropTypes.string.isRequired,
  configData: PropTypes.objectOf(PropTypes.any),
};

LegalComponent.defaultProps = {
  configData: {},
};

export default LegalComponent;
