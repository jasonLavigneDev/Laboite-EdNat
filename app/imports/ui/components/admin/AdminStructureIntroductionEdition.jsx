import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactQuill from 'react-quill'; // ES6
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import MenuItem from '@mui/material/MenuItem';
import 'react-quill/dist/quill.snow.css';
import Select from '@mui/material/Select';
import i18n from 'meteor/universe:i18n';
import { CustomToolbarArticle } from '../system/CustomQuill';
import { quillOptions, useStyles } from './IntroductionEdition';
import Spinner from '../system/Spinner';
import { getCurrentIntroduction } from '../../../api/utils';
import { stripEmptyHtml } from '../../utils/QuillText';

const AdminStructuresIntroductionEdition = ({ /** Can be a state */ structure }) => {
  const classes = useStyles();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState(i18n.getLocale().split('-')[0]);
  const [loading, setLoading] = useState(false);
  const [changes, setChanges] = useState(false);
  const translations = Object.keys(i18n._translations);

  useEffect(() => {
    if (structure.introduction) {
      const currentIntroduction = getCurrentIntroduction({ introduction: structure.introduction, language });
      setContent(currentIntroduction.content || '');
      setTitle(currentIntroduction.title || '');
      setLoading(false);
    }
  }, [structure.introduction, language]);

  useEffect(() => {
    if (structure.introduction) {
      const currentIntroduction = getCurrentIntroduction({ introduction: structure.introduction, language });
      setChanges(title !== currentIntroduction.title || content !== currentIntroduction.content);
    }
  }, [content, title]);

  const onUpdateRichText = (html) => {
    const strippedHTML = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    setContent(strippedHTML);
  };

  const onUpdateTitle = (e) => {
    setTitle(e.target.value);
  };

  const onCancel = () => {
    const currentIntroduction = getCurrentIntroduction({ introduction: structure.introduction, language });
    setContent(currentIntroduction ? currentIntroduction.content || '' : '');
  };

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
  };

  const onSubmitUpdateData = () => {
    setLoading(true);
    Meteor.call(
      'structures.updateIntroduction',
      { structureId: structure._id, language, content: stripEmptyHtml(content), title },
      (error) => {
        setLoading(false);
        if (error) {
          msg.error(error.message);
        } else {
          msg.success(i18n.__('api.methods.operationSuccessMsg'));
        }
      },
    );
  };

  if (loading) return <Spinner />;

  return (
    <form className={classes.root}>
      <FormControl className={classes.formControl} fullWidth>
        <InputLabel id="language-selector-label">{i18n.__('components.IntroductionEdition.language')}</InputLabel>
        <Select
          labelId="language-selector-label"
          id="language-selector"
          value={language}
          onChange={handleLanguageChange}
        >
          {translations.map((tra) => (
            <MenuItem value={tra} key={`components.IntroductionEdition.language_${tra}`}>
              {i18n.__(`components.IntroductionEdition.language_${tra}`)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div>
        <InputLabel htmlFor="introtitle">
          {i18n.__('components.AdminStructureIntroductionEdition.form.title')}
        </InputLabel>
        <TextField id="introtitle" value={title || ''} onChange={onUpdateTitle} fullWidth />
      </div>
      <div className={classes.wysiwyg}>
        <InputLabel htmlFor="content">
          {i18n.__('components.AdminStructureIntroductionEdition.form.content')}
        </InputLabel>
        <CustomToolbarArticle />
        <ReactQuill id="content" value={content || ''} onChange={onUpdateRichText} {...quillOptions} />
      </div>
      {changes && (
        <Fade in>
          <div className={classes.buttonGroup}>
            <Button variant="contained" onClick={onCancel} disabled={loading}>
              {i18n.__('components.IntroductionEdition.cancel')}
            </Button>
            <Button variant="contained" color="primary" onClick={onSubmitUpdateData} disabled={loading}>
              {i18n.__('components.IntroductionEdition.update')}
            </Button>
          </div>
        </Fade>
      )}
    </form>
  );
};

AdminStructuresIntroductionEdition.propTypes = {
  structure: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default AdminStructuresIntroductionEdition;
