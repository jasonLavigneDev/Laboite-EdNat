import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import sanitizeHtml from 'sanitize-html';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import ArrowBack from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { makeStyles } from 'tss-react/mui';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import html2pdf from 'html2pdf.js';
import 'react-quill/dist/quill.snow.css';
import 'codemirror/lib/codemirror.css'; // Editor's Dependency Style
import '@toast-ui/editor/dist/toastui-editor.css'; // Editor's Style
import { Viewer } from '@toast-ui/react-editor';
import chart from '@toast-ui/editor-plugin-chart';
import uml from '@toast-ui/editor-plugin-uml';
import '@toast-ui/editor/dist/i18n/fr-fr';
import codeSyntaxHighlight from '@toast-ui/editor-plugin-code-syntax-highlight';
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';
import tableMergedCell from '@toast-ui/editor-plugin-table-merged-cell';
import Articles from '../../../api/articles/articles';
import Spinner from '../../components/system/Spinner';
import { useAppContext } from '../../contexts/context';
import TopBar from '../../components/menus/TopBar';
import Footer from '../../components/menus/Footer';
import { sanitizeParameters } from '../../../api/utils';
// import Tags from '../../../api/tags/tags';

const modifiedColorSyntax = (context, options) => {
  const newContext = { ...context };
  const {
    i18n: {
      langs: { values },
    },
  } = newContext;
  const newValues = values.map((lang) => ({
    ...lang,
    OK: 'OK',
  }));
  newContext.i18n.langs.values = newValues;
  return colorSyntax(newContext, options);
};

const useStyles = makeStyles()((theme) => ({
  root: {
    paddingTop: 60,
    marginBottom: -64,
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
  },
  rootMobile: {
    paddingTop: 60,
    marginBottom: -128,
    display: 'flex',
    minHeight: '100vh',
    flexDirection: 'column',
  },
  flex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  space: {
    height: 150,
  },
  content: {
    textAlign: 'justify',
    width: '100%',
    marginBottom: theme.spacing(3),
    '& p': {
      marginTop: 0,
      marginBottom: 0,
    },
  },
  visitCounter: {
    cursor: 'default !important',
    backgroundColor: '#F9F9FD',
    '&:hover': { backgroundColor: '#F9F9FD' },
  },
  buttonText: {
    textTransform: 'none',
    marginRight: 5,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.tertiary.main,
    fontWeight: 'bold',
    '&:hover': {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.tertiary.main,
    },
  },
  cardGrid: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
    marginBottom: theme.spacing(3),
  },
  tag: {
    marginLeft: theme.spacing(1),
  },
  smallTitle: {
    marginBottom: theme.spacing(1),
  },
}));

function PublicArticleDetailsPage({
  article = {},
  ready,
  history,
  match: {
    params: { userId },
  },
}) {
  const [{ isMobile }] = useAppContext();
  const { classes } = useStyles();
  const [user, setUser] = useState({});
  const [counted, setCounted] = useState(false);
  const [landscape, setLandscape] = useState(false);
  const toastRef = useRef(null);

  const isFirstRender = history.action === 'POP';

  useEffect(() => {
    Meteor.call('users.findUser', { userId }, (error, result) => {
      setUser(result);
    });
  }, []);

  useEffect(() => {
    if (ready && article && article._id && !counted) {
      setCounted(true);
      Meteor.call('articles.visitArticle', { articleId: article._id });
    }
  }, [article]);

  const handleExport = () => {
    // Export to PDF. Currently exported as images
    // try to use jsPDF directly ?
    // https://stackoverflow.com/questions/18191893/generate-pdf-from-html-in-div-using-javascript
    const divContents = article.markdown ? toastRef.current.rootEl.current.innerHTML : article.content;
    const opt = {
      filename: `article_${article.slug}.pdf`,
      enableLinks: true,
      margin: 4,
      image: { type: 'jpeg', quality: 0.98 },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      html2canvas: {
        useCORS: true,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: landscape ? 'landscape' : 'portrait' },
    };
    html2pdf().set(opt).from(divContents).save();
  };

  const handleGoList = () => {
    if (isFirstRender) {
      history.push(`/public/${userId}`);
    } else {
      history.goBack();
    }
  };
  if (!ready) {
    return <Spinner />;
  }
  return (
    <>
      <TopBar publicMenu />
      <Fade in>
        <Container className={isMobile ? classes.rootMobile : classes.root}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={12} md={12} className={classes.flex}>
              <Button color="primary" startIcon={<ArrowBack />} onClick={handleGoList}>
                {i18n.__(`pages.PublicArticleDetailsPage.${isFirstRender ? 'goToList' : 'backToList'}`)}
              </Button>
            </Grid>
            <Grid item xs={12} className={isMobile ? null : classes.flex}>
              <Typography variant={isMobile ? 'h6' : 'h4'} className={classes.flex}>
                {article.title}
              </Typography>
              <div name="export">
                <Button
                  startIcon={<PictureAsPdfIcon />}
                  className={classes.buttonText}
                  color="primary"
                  variant="contained"
                  onClick={handleExport}
                >
                  {i18n.__('pages.PublicArticleDetailsPage.exportPDF')}
                </Button>
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      name="checkLandscape"
                      inputProps={{ 'aria-label': 'export to landscape' }}
                      checked={landscape}
                      onChange={() => setLandscape(!landscape)}
                      value="lanscape"
                    />
                  }
                  label={
                    landscape
                      ? i18n.__('pages.PublicArticleDetailsPage.exportLandscape')
                      : i18n.__('pages.PublicArticleDetailsPage.exportPortrait')
                  }
                />
              </div>
              <Typography variant="subtitle2" align="right">
                {`${user.firstName} ${user.lastName}`}
                <br />
                {article.createdAt.toLocaleString()}
                <br />
                <Button
                  startIcon={<VisibilityIcon />}
                  className={classes.visitCounter}
                  disableElevation
                  disableRipple
                  disableFocusRipple
                  title={i18n.__('pages.PublicArticleDetailsPage.views')}
                >
                  {article.visits}
                </Button>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={12} md={12} className={classes.cardGrid}>
              <Typography className={classes.smallTitle} variant="h5">
                {i18n.__('api.articles.labels.tags')}
              </Typography>
              {article.tags.map((tag) => (
                <Chip className={classes.tag} key={tag} label={tag} color="secondary" />
              ))}
            </Grid>
            <Grid item xs={12} className={isMobile ? null : classes.flex}>
              {article.markdown ? (
                <Viewer
                  ref={toastRef}
                  initialValue={article.content}
                  plugins={[chart, codeSyntaxHighlight, tableMergedCell, uml, modifiedColorSyntax]}
                />
              ) : (
                <div
                  className={`ql-editor ${classes.content}`}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content, sanitizeParameters) }}
                />
              )}
            </Grid>
          </Grid>
          <div className={classes.space} />
        </Container>
      </Fade>
      <Footer />
    </>
  );
}

PublicArticleDetailsPage.propTypes = {
  article: PropTypes.objectOf(PropTypes.any).isRequired,
  // tags: PropTypes.arrayOf(PropTypes.any).isRequired,
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
    const articleHandle = Meteor.subscribe('articles.one', { slug });
    const article = Articles.findOne({ slug }) || {};
    // const tags = Tags.find({}).fetch();
    const ready = articleHandle.ready();
    return {
      article,
      // tags,
      ready,
    };
  },
)(PublicArticleDetailsPage);
