import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill'; // ES6
import 'react-quill/dist/quill.snow.css';
import { makeStyles } from 'tss-react/mui';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import i18n from 'meteor/universe:i18n';
import { updateAppsettings } from '../../../api/appsettings/methods';
import Spinner from '../system/Spinner';
import { CustomToolbarArticle } from '../system/CustomQuill';
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

const quillOptions = {
  modules: {
    toolbar: {
      container: '#quill-toolbar',
    },
    clipboard: {
      matchVisual: false,
      matchers: [],
    },
  },
  formats: ['header', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'list', 'bullet', 'indent', 'link'],
};

const LegalComponent = ({ tabkey, ...props }) => {
  const configData = props[tabkey] || {};
  const { classes } = useStyles();
  const [config, setConfig] = useState({ ...configData });
  const [loading, setLoading] = useState(false);

  const changes =
    config.content !== configData.content || config.external !== configData.external || config.link !== configData.link;

  const onCheckExternal = (event) => {
    const { name, checked } = event.target;
    setConfig({ ...config, [name]: checked });
  };

  const onUpdateField = (event) => {
    const { name, value } = event.target;
    setConfig({ ...config, [name]: value });
  };

  const onUpdateRichText = (html) => {
    const content = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    if (config.external) {
      setConfig({ ...config, content: config.content });
    } else {
      setConfig({ ...config, content });
    }
  };

  const onSubmitUpdateconfigData = () => {
    setLoading(true);
    updateAppsettings.call({ ...config, key: tabkey }, (error) => {
      setLoading(false);
      if (error) {
        msg.error(error.message);
      } else {
        msg.success(i18n.__('api.methods.operationSuccessMsg'));
      }
    });
  };

  const onCancel = () => {
    setConfig({ ...configData });
  };

  if (loading && !!config) {
    return <Spinner full />;
  }

  return (
    <form className={classes.root}>
      <Typography variant="h4">{i18n.__(`components.LegalComponent.title_${tabkey}`)}</Typography>
      <FormControlLabel
        control={<Checkbox checked={config.external || false} onChange={onCheckExternal} name="external" />}
        label={i18n.__(`components.LegalComponent.external_${tabkey}`)}
      />
      {config.external ? (
        <TextField
          onChange={onUpdateField}
          value={config.link}
          name="link"
          label={i18n.__(`components.LegalComponent.link_${tabkey}`)}
          variant="outlined"
          fullWidth
          margin="normal"
        />
      ) : (
        <div className={classes.wysiwyg}>
          <InputLabel htmlFor="content">{i18n.__(`components.LegalComponent.content_${tabkey}`)}</InputLabel>
          <CustomToolbarArticle />
          <ReactQuill id="content" value={config.content || ''} onChange={onUpdateRichText} {...quillOptions} />
        </div>
      )}
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
