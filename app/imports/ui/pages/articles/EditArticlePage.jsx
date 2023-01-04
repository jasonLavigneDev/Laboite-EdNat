/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import { Meteor } from 'meteor/meteor';
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import Paper from '@mui/material/Paper';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { withTracker } from 'meteor/react-meteor-data';
import FormControl from '@mui/material/FormControl';
import DeleteIcon from '@mui/icons-material/Delete';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { Random } from 'meteor/random';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import ImageResize from 'quill-image-resize-module';
import { makeStyles } from 'tss-react/mui';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Articles from '../../../api/articles/articles';
import Spinner from '../../components/system/Spinner';
import { useAppContext } from '../../contexts/context';
import { useObjectState } from '../../utils/hooks';
import { getExtension } from '../../utils/filesProcess';
import slugy from '../../utils/slugy';
import { updateArticle, createArticle, removeArticle } from '../../../api/articles/methods';
import ValidationButton from '../../components/system/ValidationButton';
import ImagePicker from '../../components/articles/ImagePicker';
import WebcamModal from '../../components/system/WebcamModal';

import '../../utils/QuillImage';
import '../../utils/QuillWebcam';
import '../../utils/QuillAudio';
import '../../utils/QuillVideo';
import { CustomToolbarArticle } from '../../components/system/CustomQuill';
import AudioModal from '../../components/system/AudioModal';
import { PICTURES_TYPES, VIDEO_TYPES, SOUND_TYPES } from '../../components/mediaStorage/SingleStoragefile';
import ToastUIEditor from '../../components/system/ToastUIEditor';
import Tags from '../../../api/tags/tags';
import TagFinder from '../../components/articles/TagFinder';
import GroupFinder from '../../components/articles/GroupFinder';
import { testMeteorSettingsUrl, getGroupName } from '../../utils/utilsFuncs';

Quill.register('modules/ImageResize', ImageResize);

const { minioEndPoint, minioPort, minioBucket } = Meteor.settings.public;
const { laboiteBlogURL } = Meteor.settings.public.services;

const HOST = `https://${minioEndPoint}${minioPort ? `:${minioPort}` : ''}/${minioBucket}/`;

const useStyles = makeStyles()((theme, isTablet) => ({
  flex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexVertical: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: theme.spacing(2),
  },
  titleDialog: {
    color: 'darkblue',
    fontWeight: 'bold',
    fontSize: 20,
  },
  gridItem: {
    display: 'flex',
    justifyContent: 'center',
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  wysiwyg: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
    '& label': {
      marginBottom: theme.spacing(1),
    },
  },
  buttonGroup: {
    display: isTablet ? 'block' : 'flex',
    justifyContent: 'space-between',
    marginTop: 60,
    '& .MuiButton-root': {
      marginTop: 10,
    },
  },
  tagInputs: {
    marginBottom: theme.spacing(3),
    marginTop: theme.spacing(2),
  },
  tags: {
    marginTop: 10,
    marginBottom: 10,
  },
  tag: {
    margin: 2,
  },
  buttonsContainer: {
    display: 'flex',
    margin: 'auto',
    justifyContent: 'center',
    '& button': {
      margin: theme.spacing(2),
    },
  },
  cardGrid: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  smallTitle: {
    marginRigt: theme.spacing(1),
  },
  structure: {
    marginBottom: '0px',
  },
  licencePaper: {
    padding: theme.spacing(1.5),
    marginTop: 5,
    marginBottom: 10,
  },
}));

const emptyArticle = {
  title: '',
  slug: '',
  content: '',
  description: '',
  licence: '',
  tags: [],
};

let quillOptions;

function EditArticlePage({
  article = {},
  tags = [],
  ready,
  match: {
    params: { slug },
  },
  history,
}) {
  const [{ isMobile, language, user, isTablet }, dispatch] = useAppContext();
  const { classes } = useStyles(isTablet);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [quill, setQuill] = useState(null);
  const [picker, togglePicker] = useState(false);
  const [webcam, toggleWebcam] = useState(false);
  const [audio, toggleAudio] = useState(false);
  const [data, setData] = useObjectState(emptyArticle);
  const [content, setContent] = useState('');
  const [newTag, setNewTag] = useState({ _id: null, name: '' });
  const [toastInstance, setToast] = useState();
  const [toastRange, setRange] = useState(0);
  const [updateStructure, setUpdateStructure] = useState(false);
  const [open, setOpen] = useState(false);
  const [showUpdateStructure, setShowUpdateStructure] = useState(false);

  const licences = [
    ['CC BY', i18n.__('pages.EditArticlePage.Licences.CC_BY')],
    ['CC BY-SA', i18n.__('pages.EditArticlePage.Licences.CC_BY-SA')],
    ['CC BY-ND', i18n.__('pages.EditArticlePage.Licences.CC_BY-ND')],
    ['CC BY-NC', i18n.__('pages.EditArticlePage.Licences.CC_BY-NC')],
    ['CC BY-NC-SA', i18n.__('pages.EditArticlePage.Licences.CC_BY-NC-SA')],
    ['CC BY-NC-ND', i18n.__('pages.EditArticlePage.Licences.CC_BY-NC-ND')],
  ];

  const quillOptionsMaker = (options) => ({
    modules: {
      toolbar: {
        container: '#quill-toolbar',
        handlers: minioEndPoint
          ? {
              image: options.imageHandler,
              webcam: options.webcamHandler,
              audio: options.audioHandler,
            }
          : {},
      },
      clipboard: {
        matchVisual: false,
        matchers: [],
      },
      imageResize: {
        displayStyles: {
          backgroundColor: 'black',
          border: 'none',
          color: 'white',
        },
        modules: ['Resize', 'DisplaySize', 'Toolbar'],
      },
    },
    formats: [
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'blockquote',
      'list',
      'bullet',
      'indent',
      'link',
      'image',
      'video',
      'width',
      'style',
      'webcam',
      'audio',
    ],
  });
  let publicURL;
  if (laboiteBlogURL) {
    publicURL = `${testMeteorSettingsUrl(laboiteBlogURL)}/articles/${data.slug}`;
  } else {
    publicURL = `${Meteor.absoluteUrl()}public/${Meteor.userId()}/${data.slug}`;
  }
  const toastRef = useRef();
  // tagsKey : used to force re-render of autocomplete component (tags)
  const [tagsKey, setTagsKey] = useState(new Date().toISOString());

  useEffect(() => {
    if (toastRef.current) {
      setToast(toastRef.current.getInstance());
    }
  }, [toastRef.current, data.markdown]);

  function imageHandler(instance) {
    if (data.markdown) {
      setRange(instance.getSelection());
    }
    togglePicker(true);
    // eslint-disable-next-line react/no-this-in-sfc
    setQuill(this.quill);
  }
  function webcamHandler(instance) {
    if (data.markdown) {
      setRange(instance.getSelection());
    }
    toggleWebcam(true);
    // eslint-disable-next-line react/no-this-in-sfc
    setQuill(this.quill);
  }
  function audioHandler(instance) {
    if (data.markdown) {
      setRange(instance.getSelection());
    }
    toggleAudio(true);
    // eslint-disable-next-line react/no-this-in-sfc
    setQuill(this.quill);
  }

  useEffect(() => {
    if (minioEndPoint) {
      quillOptions = quillOptionsMaker({
        imageHandler,
        webcamHandler,
        audioHandler,
      });
    } else {
      quillOptions = quillOptionsMaker({});
    }
  }, []);

  const handleOpenDialog = () => {
    if (content.length !== 0) {
      setOpen(true);
    } else {
      history.push('/publications');
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const closeEditPage = () => {
    setOpen(false);
    history.push('/publications');
  };

  const onUpdateRichText = (html) => {
    let imgData;
    let fileName;
    let format;
    let imgTag;
    let newContent = html;
    if (!data.markdown) {
      const noScriptHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      newContent = noScriptHtml.replace(/cursor: nesw-resize;/gi, '');
      const isImageBase64 = newContent.search('<img src="data:');
      if (isImageBase64 > -1) {
        const imgString = newContent.substring(isImageBase64);
        const endImgTag = imgString.search('>');
        imgTag = imgString.substring(0, endImgTag + 1);
        [, imgData] = imgTag.split('"');
        format = getExtension(null, imgData);
        fileName = `File_${Random.id()}`;
      }
      setContent(newContent);
    } else {
      setContent(newContent);
      const isImageBase64 = newContent.indexOf('(data:');
      if (isImageBase64 > -1) {
        const imgString = newContent.substring(isImageBase64 + 1);
        const endImgTag = imgString.indexOf(')');
        imgData = imgString.substring(0, endImgTag);
        format = getExtension(null, imgData);
        fileName = `File_${Random.id()}`;
      }
    }

    if (imgData) {
      dispatch({
        type: 'uploads.add',
        data: {
          name: fileName,
          fileName,
          file: imgData,
          type: format,
          path: `users/${Meteor.userId()}`,
          storage: true,
          onFinish: (url) => {
            let newHTML;
            let isImage = false;
            PICTURES_TYPES.forEach((extension) => {
              if (format.search(extension) > -1) {
                isImage = true;
              }
            });
            if (isImage || data.markdown) {
              newHTML = newContent.replace(imgData, url);
            } else if (!data.markdown) {
              newHTML = newContent.replace(imgTag, `<a target="_blank" href="${url}">${url}</a>`);
            }
            if (data.markdown) {
              toastRef.current.getInstance().setMarkdown(newHTML);
            } else {
              setContent(newHTML);
            }
          },
        },
      });
    }
  };
  const insertVideo = (videoUrl) => {
    const range = quill ? quill.getSelection(true) : toastRange;
    if (quill) {
      quill.insertEmbed(range.index, 'webcam', videoUrl);
    } else {
      const stringToAdd = toastInstance.isMarkdownMode()
        ? `[${videoUrl}](${videoUrl})`
        : `<a target="_blank" href="${videoUrl}">${videoUrl}</a>`;
      toastInstance.insertText(stringToAdd);
    }
    toggleWebcam(false);
  };
  const insertAudio = (audioUrl) => {
    const range = quill ? quill.getSelection(true) : toastRange;
    if (quill) {
      quill.insertEmbed(range.index, 'audio', audioUrl);
    } else {
      const stringToAdd = toastInstance.isMarkdownMode()
        ? `[${audioUrl}](${audioUrl})`
        : `<a target="_blank" href="${audioUrl}">${audioUrl}</a>`;
      toastInstance.insertText(stringToAdd);
    }
    toggleAudio(false);
  };

  const selectFile = (file) => {
    const range = quill ? quill.getSelection(true) : toastRange;
    let format = 'attachment';
    PICTURES_TYPES.forEach((extension) => {
      if (file.name.search(extension) > -1) {
        format = 'image';
      }
    });
    VIDEO_TYPES.forEach((extension) => {
      if (file.name.search(extension) > -1) {
        format = 'video';
      }
    });
    SOUND_TYPES.forEach((extension) => {
      if (file.name.search(extension) > -1) {
        format = 'audio';
      }
    });
    const url = `${HOST}${file.name}`;
    if (quill) {
      if (format === 'image') {
        quill.insertEmbed(range.index, format, url);
      } else if (format === 'video') {
        quill.insertEmbed(range.index, 'webcam', url);
      } else if (format === 'audio') {
        quill.insertEmbed(range.index, 'audio', url);
      } else {
        quill.pasteHTML(range.index, `![${url}](${url})`);
      }
      setQuill(null);
    } else {
      let stringToAdd = '';
      if (format === 'image') {
        stringToAdd = toastInstance.isMarkdownMode()
          ? `![${url}](${url.replaceAll(' ', '%20')})`
          : `<img src="${url}" />`;
      } else {
        stringToAdd = toastInstance.isMarkdownMode()
          ? `[${url}](${url})`
          : `<a target="_blank" href="${url}">${url}</a>`;
      }
      toastInstance.insertText(stringToAdd);
    }
    togglePicker(false);
  };

  useEffect(() => {
    if (article._id && slug && !mounted) {
      setMounted(true);
      setData(article);
      setContent(article.content);
      setShowUpdateStructure(user.structure && article.structure !== user.structure);
    }
  }, [article]);

  const handleCopyURL = () => {
    navigator.clipboard.writeText(publicURL).then(msg.success(i18n.__('pages.EditArticlePage.successCopyURL')));
  };

  const onUpdateField = (event) => {
    const { name, value } = event.target;
    if (name === 'title') {
      const date = new Date();
      setData({
        [name]: value,
        slug: article._id ? article.slug : slugy(`${value}_${date.toISOString()}`),
      });
    } else if (name === 'description') {
      setData({ [name]: value.substring(0, 400) });
    }
  };

  const deleteArticle = () => {
    setLoading(true);
    removeArticle.call({ articleId: article._id }, (err) => {
      setLoading(false);
      if (err) {
        msg.error(err.reason);
      } else {
        msg.success(i18n.__('pages.EditArticlePage.successDelete'));
        history.push('/publications');
      }
    });
  };

  const submitUpdateArticle = (draft) => {
    setLoading(true);
    const method = slug ? updateArticle : createArticle;
    data.content = content;
    delete data._id;
    const payload = { data };
    if (article._id) {
      payload.articleId = article._id;
      payload.updateStructure = updateStructure;
    }
    payload.data.draft = draft;
    method.call(payload, (err) => {
      setLoading(false);
      if (err) {
        msg.error(err.reason || err.message);
      } else {
        msg.success(i18n.__(`pages.EditArticlePage.${slug ? 'successUpdate' : 'successCreate'}`));
        history.push('/publications');
      }
    });
  };

  const submitUpdateArticlePublished = () => {
    submitUpdateArticle(false);
  };

  const submitUpdateArticleDraft = () => {
    submitUpdateArticle(true);
  };

  const addTag = () => {
    if (newTag._id === null) {
      // add new Tag in database and get its Id
      Meteor.call('tags.createTag', { name: newTag.name }, (err) => {
        if (err) msg.error(err.reason);
        else data.tags.push(newTag.name);
      });
    } else if (!data.tags.includes(newTag.name)) {
      const newTags = [...data.tags, newTag.name];
      setData({ ...data, tags: newTags });
    }
    setNewTag({ _id: null, name: '' });
    // hack : change key to reset component selected value
    setTagsKey(new Date().toISOString());
  };

  const addGroupToArticle = (event, group) => {
    if (group && group._id) {
      const { _id, name, type } = group;
      const groups = [...(data.groups || []), { _id, name, type }];
      setData({ ...data, groups });
    }
  };

  const removeTag = (tagName) => {
    const newTags = data.tags.filter((tag) => tag !== tagName);
    setData({ ...data, tags: newTags });
  };

  const removeGroup = (group) => {
    const groups = data.groups.filter(({ _id }) => _id !== group._id);
    setData({ ...data, groups });
  };

  const newTagChanged = (evt, newValue) => {
    if (typeof newValue === 'string') {
      // check if value already exists (in case the user entered manually an already selected tag)
      if (!tags.map((tag) => tag.name.toLowerCase()).includes(newValue.toLowerCase()))
        setNewTag({
          _id: null,
          name: newValue.toLowerCase(),
        });
    } else if (newValue && newValue.inputValue) {
      // Create a new value from the user input
      if (!tags.map((tag) => tag.name.toLowerCase()).includes(newValue.inputValue.toLowerCase()))
        setNewTag({
          _id: null,
          name: newValue.inputValue.toLowerCase(),
        });
    } else if (newValue === null) setNewTag({ _id: null, name: '' });
    else setNewTag(newValue);
  };

  const toggleMarkdown = (bool) => {
    setData({ markdown: bool });
  };

  const handleLicence = (event) => {
    setData({ licence: event.target.value });
  };

  if (!ready || (slug && !article._id && !data._id) || loading) {
    return <Spinner />;
  }
  // Add tag when user press enter key
  const keyPress = (e) => {
    if (e.keyCode === 13) {
      addTag();
    }
  };

  return (
    <>
      <Container>
        <Grid container spacing={4}>
          <Grid item xs={12} className={isMobile ? null : classes.flex}>
            <Typography variant={isMobile ? 'h6' : 'h4'} className={classes.flex}>
              {i18n.__(`pages.EditArticlePage.${slug ? 'title' : 'creationTitle'}`)}{' '}
              {article.draft ? ` - ${i18n.__(`pages.EditArticlePage.draft`)}` : null}
            </Typography>
          </Grid>
        </Grid>
        <form noValidate autoComplete="off">
          <TextField
            onChange={onUpdateField}
            value={data.title}
            name="title"
            label={i18n.__('pages.EditArticlePage.titleLabel')}
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            value={publicURL}
            label={i18n.__('pages.EditArticlePage.slugLabel')}
            variant="outlined"
            fullWidth
            margin="normal"
            disabled
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton
                    title={i18n.__('pages.EditArticlePage.copyPublicURL')}
                    aria-label={i18n.__('pages.EditArticlePage.copyPublicURL')}
                    onClick={handleCopyURL}
                    size="large"
                  >
                    <AssignmentIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <FormControl fullWidth>
            <InputLabel id="licence-selector-label">{i18n.__('pages.EditArticlePage.license')}</InputLabel>
            <Select
              labelId="licence-selector-label"
              id="licence-selector"
              name="licence"
              variant="outlined"
              label={i18n.__('pages.EditArticlePage.license')}
              fullWidth
              value={data.licence}
              onChange={handleLicence}
            >
              {licences.map((lic) => (
                <MenuItem value={lic[0]} key={lic[1]}>
                  {lic[1]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Paper className={classes.licencePaper}>
            {i18n.__('pages.EditArticlePage.licenceInfo')}{' '}
            <a href="https://creativecommons.org/licenses/" target="_blank" style={{ color: 'blue' }} rel="noreferrer">
              https://creativecommons.org/licenses/
            </a>
          </Paper>

          <TextField
            onChange={onUpdateField}
            value={data.description}
            name="description"
            label={i18n.__('pages.EditArticlePage.descriptionLabel')}
            variant="outlined"
            fullWidth
            margin="normal"
            multiline
            helperText={`${data.description.length}/400`}
          />
          {article._id && showUpdateStructure ? (
            <div className={classes.flexVertical}>
              <TextField
                className={classes.structure}
                value={article.structure}
                label={i18n.__('api.articles.labels.structure')}
                variant="outlined"
                margin="normal"
                disabled
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={updateStructure}
                    onChange={() => setUpdateStructure(!updateStructure)}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />
                }
                label={i18n.__('pages.EditArticlePage.structureMessage', { structure: user.structure })}
              />
            </div>
          ) : null}

          <Grid className={classes.tagInputs}>
            <GroupFinder exclude={data.groups ? data.groups.map((g) => g._id) : []} onSelected={addGroupToArticle} />
            <div className={classes.tags}>
              {data.groups &&
                data.groups.map((group) => {
                  return (
                    <Chip
                      className={classes.tag}
                      key={group._id}
                      label={getGroupName(group)}
                      color="secondary"
                      onDelete={() => removeGroup(group)}
                    />
                  );
                })}
            </div>
          </Grid>

          <ButtonGroup>
            <TagFinder
              resetKey={tagsKey}
              tags={tags}
              exclude={data.tags}
              onSelected={newTagChanged}
              inputWidth={isMobile ? 310 : 1138}
              keyPressEnter={newTag.name !== '' ? keyPress : null}
            />
            <Button variant="contained" disabled={newTag.name === ''} color="primary" onClick={addTag}>
              {i18n.__(
                newTag._id === null && newTag.name
                  ? 'pages.EditArticlePage.createTag'
                  : 'pages.EditArticlePage.selectTag',
              )}
            </Button>
          </ButtonGroup>
          <div className={classes.tags}>
            {data.tags.map((tagName) => {
              // const tagName = Tags.findOne(tagId).name;
              return (
                <Chip
                  className={classes.tag}
                  key={tagName}
                  label={tagName}
                  color="secondary"
                  onDelete={() => removeTag(tagName)}
                />
              );
            })}
          </div>

          <div className={classes.wysiwyg}>
            <InputLabel htmlFor="content">{i18n.__('pages.EditArticlePage.contentLabel')}</InputLabel>

            {typeof data.markdown === 'undefined' && (
              <div className={classes.buttonsContainer}>
                <Button variant="contained" onClick={() => toggleMarkdown(false)}>
                  {i18n.__('pages.EditArticlePage.switchToHtml')}
                </Button>

                <Button variant="contained" onClick={() => toggleMarkdown(true)}>
                  {i18n.__('pages.EditArticlePage.switchToMarkdown')}
                </Button>
              </div>
            )}

            {typeof data.markdown !== 'undefined' ? (
              data.markdown ? (
                <ToastUIEditor
                  id="content"
                  language={language}
                  toastRef={toastRef}
                  value={content}
                  onChange={onUpdateRichText}
                  handlers={minioEndPoint ? { imageHandler, webcamHandler, audioHandler } : {}}
                />
              ) : (
                <>
                  <CustomToolbarArticle withMedia withWebcam={!!minioEndPoint} />
                  <ReactQuill {...quillOptions} id="content" value={content} onChange={onUpdateRichText} />
                </>
              )
            ) : null}
          </div>
          <div className={classes.buttonGroup}>
            <Button fullWidth={isTablet} variant="contained" onClick={() => handleOpenDialog(true)}>
              {i18n.__('pages.EditArticlePage.cancel')}
            </Button>
            {!!slug && (
              <ValidationButton
                color="red"
                icon={<DeleteIcon />}
                fullWidth={isTablet}
                text={i18n.__('pages.EditArticlePage.delete')}
                onAction={deleteArticle}
              />
            )}

            <div>
              {(!slug || article.draft) && (
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth={isTablet}
                  style={{ marginRight: 10 }}
                  onClick={submitUpdateArticleDraft}
                >
                  {i18n.__('pages.EditArticlePage.save_draf')}
                </Button>
              )}
              <Button fullWidth={isTablet} variant="contained" color="primary" onClick={submitUpdateArticlePublished}>
                {slug ? i18n.__('pages.EditArticlePage.update') : i18n.__('pages.EditArticlePage.save')}
                {slug && article.draft && ` - ${i18n.__('pages.EditArticlePage.save')}`}
              </Button>
            </div>
          </div>
        </form>
        {picker && minioEndPoint && (
          <ImagePicker selectFile={selectFile} onClose={() => togglePicker(false)} isMobile={isMobile} />
        )}
        {webcam && minioEndPoint && <WebcamModal selectFile={insertVideo} onClose={() => toggleWebcam(false)} />}
        {audio && minioEndPoint && <AudioModal selectFile={insertAudio} onClose={() => toggleAudio(false)} />}
      </Container>
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <h3 className={classes.titleDialog}>{i18n.__('pages.EditArticlePage.CloseEditArticle.title')}</h3>
            {i18n.__('pages.EditArticlePage.CloseEditArticle.mainText')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditPage} color="primary" autoFocus>
            {i18n.__('pages.EditArticlePage.CloseEditArticle.confirm')}
          </Button>
          <Button onClick={handleCloseDialog} color="primary">
            {i18n.__('pages.EditArticlePage.CloseEditArticle.cancel')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

EditArticlePage.propTypes = {
  article: PropTypes.objectOf(PropTypes.any).isRequired,
  tags: PropTypes.arrayOf(PropTypes.any).isRequired,
  ready: PropTypes.bool.isRequired,
  match: PropTypes.objectOf(PropTypes.any).isRequired,
  history: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default withTracker(
  ({
    match: {
      params: { slug },
    },
  }) => {
    let ready = false;
    let article = {};
    const tagsHandle = Meteor.subscribe('tags.all');
    const tags = Tags.find({}).fetch();
    if (slug) {
      const articleHandle = Meteor.subscribe('articles.one.admin', { slug });
      article = Articles.findOneFromPublication('articles.one.admin', {}) || {};
      ready = articleHandle.ready() && tagsHandle.ready();
    } else {
      // create new article
      ready = tagsHandle.ready();
    }
    return {
      article,
      tags,
      ready,
    };
  },
)(EditArticlePage);
