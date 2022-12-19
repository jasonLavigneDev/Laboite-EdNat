import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill'; // ES6
import { makeStyles } from 'tss-react/mui';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import 'react-quill/dist/quill.snow.css';
import Select from '@mui/material/Select';

import i18n from 'meteor/universe:i18n';
import { updateTextInfoLanguage } from '../../../api/appsettings/methods';
import Spinner from '../system/Spinner';
import { CustomToolbarArticle } from '../system/CustomQuill';
import '../../utils/QuillVideo';
import { getCurrentText } from '../../../api/utils';
import { stripEmptyHtml } from '../../utils/QuillText';

export const useStyles = makeStyles()((theme) => ({
  root: {
    padding: `0 ${theme.spacing(2)} 0 ${theme.spacing(2)}`,
    flex: 1,
  },
  wysiwyg: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(5),
  },
  formControl: {
    minWidth: '50%',
  },
  marginTop: {
    marginTop: theme.spacing(3),
  },
  inputFil: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
  },
  logoWrapper: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(1),
  },
  logo: {
    height: 100,
    width: 100,
    boxShadow: theme.shadows[2],
    borderRadius: theme.shape.borderRadius,
    marginRight: theme.spacing(3),
  },
  imageWrapper: {
    position: 'relative',
  },
  image: {
    height: '100%',
  },
}));

export const quillOptions = {
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

const InfoEditionComponent = ({ tabkey, data = [] }) => {
  const { classes } = useStyles();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [changes, setChanges] = useState(false);

  const translations = Object.keys(i18n._translations);

  const getLanguage = (lang) => {
    if (translations.includes(lang)) return lang;
    return 'fr';
  };

  const [language, setLanguage] = useState(getLanguage(i18n._locale));

  useEffect(() => {
    if (data) {
      const currentData = getCurrentText({ data, language });
      setContent(currentData.content || '');
      setLoading(false);
    }
  }, [data, language]);

  useEffect(() => {
    if (data) {
      const currentData = getCurrentText({ data, language }) || {};
      if (content !== currentData.content) {
        setChanges(true);
      } else {
        setChanges(false);
      }
    }
  }, [content]);

  const onUpdateRichText = (html) => {
    const strippedHTML = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    setContent(strippedHTML);
  };

  const onSubmitUpdateData = () => {
    setLoading(true);

    updateTextInfoLanguage.call({ tabkey, language, content: stripEmptyHtml(content) }, (error) => {
      setLoading(false);
      if (error) {
        msg.error(error.message);
      } else {
        msg.success(i18n.__('api.methods.operationSuccessMsg'));
      }
    });
  };

  const onCancel = () => {
    const currentData = getCurrentText({ data, language }) || {};
    setContent(currentData.content || '');
  };

  const handleChange = (event) => {
    setLanguage(event.target.value);
  };

  if (loading) {
    return <Spinner full />;
  }

  return (
    <form className={classes.root}>
      <Typography variant="h4">{i18n.__(`components.InfoEditionComponent.title_${tabkey}`)}</Typography>

      <FormControl className={classes.formControl}>
        <InputLabel id="language-selector-label">{i18n.__('components.InfoEditionComponent.language')}</InputLabel>
        <Select
          labelId="language-selector-label"
          id="language-selector"
          label={i18n.__('components.InfoEditionComponent.language')}
          value={language}
          onChange={handleChange}
        >
          {translations.map((tra) => (
            <MenuItem value={tra} key={`components.InfoEditionComponent.language_${tra}`}>
              {i18n.__(`components.InfoEditionComponent.language_${tra}`)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div className={classes.wysiwyg}>
        <InputLabel htmlFor="content">{i18n.__(`components.InfoEditionComponent.content_${tabkey}`)}</InputLabel>
        <CustomToolbarArticle />
        <ReactQuill id="content" value={content || ''} onChange={onUpdateRichText} {...quillOptions} />
      </div>
      {changes && (
        <div className={classes.buttonGroup}>
          <Button variant="contained" color="grey" onClick={onCancel} disabled={loading}>
            {i18n.__('components.InfoEditionComponent.cancel')}
          </Button>

          <Button variant="contained" color="primary" onClick={onSubmitUpdateData} disabled={loading}>
            {i18n.__('components.InfoEditionComponent.update')}
          </Button>
        </div>
      )}
    </form>
  );
};

InfoEditionComponent.propTypes = {
  tabkey: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(PropTypes.any),
};

InfoEditionComponent.defaultProps = {
  data: [],
};

export default InfoEditionComponent;
