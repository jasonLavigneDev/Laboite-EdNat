import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Meteor } from 'meteor/meteor';
import { saveAs } from 'file-saver';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import ArrowBack from '@mui/icons-material/ArrowBack';
import MaterialTable from '@material-table/core';
import Grid from '@mui/material/Grid';
import { makeStyles } from 'tss-react/mui';
import Checkbox from '@mui/material/Checkbox';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import LanguageIcon from '@mui/icons-material/Language';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import Link from '@mui/material/Link';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Container from '@mui/material/Container';
import { Roles } from 'meteor/alanning:roles';
import add from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import Spinner from '../../components/system/Spinner';
import { useAppContext } from '../../contexts/context';
import { removeUserBookmark, updateUserBookmark } from '../../../api/userBookmarks/methods';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import BookMarkEdit from '../../components/users/BookMarkEdit';
import QRCanvas from '../../components/users/QRCanvas';
import UserBookmarks from '../../../api/userBookmarks/userBookmarks';
import { useMethod } from '../../utils/hooks/hooks.meteor';
import { ImportBookmarkTableRow } from './ImportBookmarkTableRow';
import './types';

export const useBookmarkPageStyles = makeStyles()(() => ({
  ErrorPage: {
    textAlign: 'center',
  },
  goBackButton: {
    marginBottom: 30,
  },
  link: {
    color: 'blue',
    textDecoration: 'underline',
    width: 'inherit',
    display: 'block',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  icon: {
    height: 25,
    width: 25,
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dialogContent: {
    // overflowY: 'hidden'
  },
  tableContainer: { maxHeight: 600, marginTop: 24 },
}));

/**
 * @param {Record<string, any>} classes Styles
 * @returns {import('@material-table/core').Column<any>[]}
 */
export const bookmarkColumns = (classes) => [
  {
    title: i18n.__('pages.BookmarksPage.columnIcon'),
    field: 'icon',
    editable: 'never',
    width: 0,
    align: 'center',
    headerStyle: {
      position: 'unset',
    },
    render: (rowData) => {
      const { icon } = rowData;

      if (icon !== '') {
        // eslint-disable-next-line jsx-a11y/alt-text
        return <img src={icon} className={classes.icon} />;
      }
      return <LanguageIcon className={classes.icon} />;
    },
  },
  {
    title: i18n.__('pages.BookmarksPage.columnName'),
    field: 'name',
    headerStyle: {
      position: 'unset',
    },
  },
  {
    title: i18n.__('pages.BookmarksPage.columnUrl'),
    field: 'url',
    headerStyle: {
      position: 'unset',
    },
    render: (rowData) => {
      const { url } = rowData;
      return (
        <a href={url} className={classes.link} target="_blank" rel="noreferrer noopener">
          {url}
        </a>
      );
    },
  },
  {
    title: i18n.__('pages.BookmarksPage.columnTag'),
    field: 'tag',
    headerStyle: {
      position: 'unset',
    },
  },
];

const getLocalStorageValue = (key, defaultValue) => {
  let localStorageValue = sessionStorage.getItem(key);
  if (localStorageValue == null) {
    localStorageValue = defaultValue;
  }
  return localStorageValue;
};

function htmlToBookmarks(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');

  function traverse(node, tag) {
    const bookmarks = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const child of node.children) {
      if (child.tagName === 'DT') {
        const h3 = child.querySelector('H3');

        if (h3) {
          // If H3 tag found, update tag value and continue traversal
          // eslint-disable-next-line no-param-reassign
          tag = h3.textContent;
        }

        const a = child.querySelector('A');
        if (a) {
          const bookmark = {
            url: a.href,
            name: a.textContent,
            icon: a.getAttribute('ICON'),
            tag: a.getAttribute('TAGS') || tag,
          };
          bookmarks.push(bookmark);
        }

        const dl = child.querySelector('DL');
        if (dl) {
          bookmarks.push(...traverse(dl, tag));
        }
      }
    }

    return bookmarks;
  }

  return traverse(doc.querySelector('DL'), '');
}

const generateExportHTML = (bookmarks) => {
  // Group bookmarks by tag
  const groupedBookmarks = bookmarks.reduce((groups, bookmark) => {
    const { tag = 'Autres' } = bookmark;

    if (!groups[tag]) {
      // eslint-disable-next-line no-param-reassign
      groups[tag] = [];
    }

    groups[tag].push(bookmark);

    return groups;
  }, {});

  // Start HTML Document
  let html = `
    <!DOCTYPE NETSCAPE-Bookmark-file-1>
    <!-- This is an automatically generated file.
         It will be read and overwritten.
         DO NOT EDIT! -->
    <META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
    <TITLE>Bookmarks</TITLE>
    <H1>Bookmarks</H1>
    <DL><p>
      <DT><H3>${Meteor.settings.public.appName}</H3>
      <DL><p>
  `;

  // Add each group of bookmarks
  // eslint-disable-next-line no-restricted-syntax
  for (const tag in groupedBookmarks) {
    if (Object.prototype.hasOwnProperty.call(groupedBookmarks, tag)) {
      html += `
      <DT><H3>${tag}</H3>
      <DL><p>
    `;

      // Add each bookmark in this group
      // eslint-disable-next-line no-restricted-syntax
      for (const bookmark of groupedBookmarks[tag]) {
        html += `
        <DT><A HREF="${bookmark.url}" ADD_DATE="0" LAST_MODIFIED="0" ICON="${bookmark.icon}">${bookmark.name}</A>
      `;
      }

      html += `
      </DL><p>
    `;
    }
  }

  // End HTML Document
  html += `
      </DL><p>
    </DL><p>
  `;

  return html;
};

function UserBookmarksPage({ loading, bookmarksList }) {
  const [{ user, userId }] = useAppContext();
  const history = useHistory();
  const { classes } = useBookmarkPageStyles();

  const columns = bookmarkColumns(classes);

  const [editUrl, setEditUrl] = useState(false);
  const [bkData, setBkData] = useState({});
  const [onEdit, setOnEdit] = useState(false);
  const [pageSize, setPageSize] = useState(getLocalStorageValue('cstRowsPerPage', 10));
  const [qrUrl, setQrUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  /**
   * @type {[BookmarkToImport[]]}
   */
  const [bookmarksToImport, setBookmarksToImport] = useState([]);
  const [keepAll, setKeepAll] = useState(false);
  const [dialogMode, setDialogMode] = useState('export');
  const [importBookmark, { loading: importing }] = useMethod(`userBookmark.import`);
  const [exportBookmark, { loading: exporting }] = useMethod(`userBookmark.export`);
  const inputRef = useRef(null);
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const closeImportModal = useCallback(() => {
    setIsImportModalOpen(false);
    setBookmarksToImport([]);
    setKeepAll(false);
  }, []);
  const openURLEditor = useCallback(() => setEditUrl(true), []);
  const goBack = useCallback(() => history.goBack(), []);
  const hideEditActions = (checkId) => !(checkId === userId || Roles.userIsInRole(userId, 'admin'));

  const proceedWithImport = useCallback(async () => {
    const filteredBookmarks = bookmarksToImport
      .filter((bookmark) => bookmark.keep)
      .map(({ keep, ...bookmark }) => bookmark);

    importBookmark({ bookmarks: filteredBookmarks }).then((result) => {
      closeImportModal();
      toast.success(i18n.__('pages.UserBookmarksPage.importSuccess', { nbOfBoomarks: result.finalUrlsCount }));
    });
  }, [bookmarksToImport]);

  const proceedWithExport = useCallback(async () => {
    exportBookmark().then((result) => {
      // Generate HTML using previous function
      const html = generateExportHTML(result);

      // Create Blob from HTML
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });

      // Use file-saver to save the file
      saveAs(blob, 'bookmarks.html');

      toast.success(i18n.__('pages.UserBookmarksPage.exportSuccess', { nbOfBoomarks: result.length }));
    });
  }, []);

  /**
   * @type {import('@material-table/core').Options}
   */
  const options = useMemo(
    () => ({
      pageSize,
      pageSizeOptions: [10, 20, 50, 100],
      paginationType: 'stepped',
      addRowPosition: 'first',
      emptyRowsWhenPaging: false,
      actionsColumnIndex: -1,
      actionsCellStyle: {
        position: 'sticky',
        right: 0,
        background: 'white',
      },
      headerStyle: {
        position: 'sticky',
        right: 0,
        background: 'white',
      },
    }),
    [pageSize],
  );

  const handleChangeRowsPerPage = (rowsPerPage) => {
    // Access initial value from session storage
    const cstRowsPerPage = getLocalStorageValue('cstRowsPerPage', 10);

    if (cstRowsPerPage !== rowsPerPage) {
      // Update session storage
      sessionStorage.setItem('cstRowsPerPage', rowsPerPage);
      setPageSize(rowsPerPage);
    }
  };

  const nbBookmarksToImport = useRef(0);

  const handleFileChange = useCallback((event) => {
    setIsReadingFile(true);
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        // Here is your HTML file content
        const content = reader.result;
        const parsedBookmarks = htmlToBookmarks(content);

        const seenUrls = {};
        const mappedBookmarks = [];

        // eslint-disable-next-line no-restricted-syntax
        for (const bookmark of parsedBookmarks) {
          if (!seenUrls[bookmark.url]) {
            seenUrls[bookmark.url] = true;
            mappedBookmarks.push({ ...bookmark, keep: false, addToPersonalSpace: false });
          }
        }

        setBookmarksToImport(mappedBookmarks);
        nbBookmarksToImport.current = 0;

        setIsReadingFile(false);
      };
      reader.onerror = () => {
        // TODO display error to the user ?
        console.error('Failed to read file!');
        setIsReadingFile(false);
      };
      reader.readAsText(file); // read file as text
    }
  }, []);

  const handleImportBookmarkRowKeepChange = useCallback((idx, keep) => {
    setBookmarksToImport((previous) => {
      const next = [...previous];
      next[idx] = { ...next[idx], keep, addToPersonalSpace: keep ? next[idx].addToPersonalSpace : false };
      nbBookmarksToImport.current += keep ? 1 : -1;
      return next;
    });
  }, []);
  const handleImportBookmarkRowAddToFavChange = useCallback((idx, addToPersonalSpace) => {
    setBookmarksToImport((previous) => {
      const next = [...previous];
      next[idx] = { ...next[idx], addToPersonalSpace };
      return next;
    });
  }, []);
  const handleKeepAll = useCallback(() => {
    let shouldKeep = true;

    setKeepAll((prevKeepAll) => {
      shouldKeep = !prevKeepAll;
      return shouldKeep;
    });
    setBookmarksToImport((previousBookmarks) => {
      nbBookmarksToImport.current = shouldKeep ? previousBookmarks?.length : 0;

      return previousBookmarks.map((bookmark) => ({
        ...bookmark,
        keep: shouldKeep,
        addToPersonalSpace: shouldKeep ? bookmark.addToPersonalSpace : false,
      }));
    });
  }, []);

  return (
    <>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <Container style={{ overflowX: 'auto' }}>
            <Grid className={classes.goBackButton} item xs={12} sm={12} md={12}>
              <Button color="primary" startIcon={<ArrowBack />} onClick={goBack}>
                {i18n.__('pages.UserBookmarksPage.back')}
              </Button>
            </Grid>
            <MaterialTable
              // other props
              title={i18n.__('pages.BookmarksPage.title')}
              columns={columns}
              data={bookmarksList.map((row) => {
                return { ...row, id: row._id };
              })}
              options={options}
              localization={setMaterialTableLocalization('pages.BookmarksPage')}
              onRowsPerPageChange={handleChangeRowsPerPage}
              actions={[
                {
                  icon: add,
                  tooltip: i18n.__('pages.BookmarksPage.materialTableLocalization.body_addTooltip'),
                  isFreeAction: true,
                  onClick: () => {
                    setOnEdit(false);
                    setBkData({});
                    openURLEditor();
                  },
                },
                {
                  icon: CloudUploadIcon,
                  tooltip: i18n.__('pages.BookmarksPage.materialTableLocalization.body_importTooltip'),
                  isFreeAction: true,
                  onClick: () => {
                    setDialogMode('import');
                    setOnEdit(false);
                    setBkData({});
                    setIsImportModalOpen(true);
                  },
                },
                {
                  icon: BrowserUpdatedIcon,
                  tooltip: i18n.__('pages.BookmarksPage.materialTableLocalization.body_exportTooltip'),
                  isFreeAction: true,
                  onClick: () => {
                    setDialogMode('export');
                    setIsImportModalOpen(true);
                    setOnEdit(false);
                    setBkData({});
                  },
                },

                (rowData) => {
                  const isFavorite = user.favUserBookmarks.indexOf(rowData._id) !== -1;
                  return {
                    icon: () => (isFavorite ? <StarIcon /> : <StarBorderIcon />),
                    tooltip: i18n.__(
                      `pages.UserBookmarksPage.${isFavorite ? 'unfavoriteBookmark' : 'favoriteBookmark'}`,
                    ),
                    onClick: () => {
                      Meteor.call(
                        `userBookmarks.${isFavorite ? 'unfavUserBookmark' : 'favUserBookmark'}`,
                        { bookmarkId: rowData._id },
                        (err) => {
                          if (err) {
                            msg.error(err.reason);
                          }
                        },
                      );
                    },
                  };
                },
                (rowData) => {
                  return {
                    icon: () => <QrCode2Icon />,
                    tooltip: i18n.__('pages.UserBookmarksPage.showQrCode'),
                    onClick: () => {
                      setIsModalOpen(true);
                      setQrUrl(rowData.url);
                    },
                  };
                },
              ]}
              editable={{
                isDeleteHidden: (rowData) => hideEditActions(rowData.userId),
                isEditHidden: (rowData) => hideEditActions(rowData.userId),
                onRowUpdate: (newData, oldData) =>
                  new Promise((resolve, reject) => {
                    updateUserBookmark.call(
                      {
                        id: oldData._id,
                        url: newData.url,
                        name: newData.name,
                        tag: newData.tag,
                      },
                      (err, res) => {
                        if (err) {
                          msg.error(err.reason);
                          reject(err);
                        } else {
                          msg.success(i18n.__('api.methods.operationSuccessMsg'));
                          resolve(res);
                        }
                      },
                    );
                    Meteor.call('userBookmark.getFavicon', { url: newData.url });
                  }),
                onRowDelete: (oldData) =>
                  new Promise((resolve, reject) => {
                    removeUserBookmark.call(
                      {
                        id: oldData._id,
                      },
                      (err, res) => {
                        if (err) {
                          msg.error(err.reason);
                          reject(err);
                        } else {
                          msg.success(i18n.__('api.methods.operationSuccessMsg'));
                          resolve(res);
                        }
                      },
                    );
                  }),
              }}
            />
          </Container>
          <Dialog className={classes.modal} open={isModalOpen} onClose={closeModal}>
            <DialogContent>
              <QRCanvas url={qrUrl} />
            </DialogContent>
            <DialogActions>
              <Button onClick={closeModal}>{i18n.__('pages.UserBookmarksPage.close')}</Button>
            </DialogActions>
          </Dialog>
          <Dialog
            className={classes.modal}
            open={isImportModalOpen}
            onClose={closeImportModal}
            PaperProps={{ style: { maxWidth: 'fit-content' } }}
          >
            <DialogContent className={classes.dialogContent}>
              {dialogMode === 'import' && (
                <>
                  {importing ? (
                    <LinearProgress variant="indeterminate" />
                  ) : bookmarksToImport.length ? (
                    <div>
                      <Typography>
                        {i18n.__('pages.UserBookmarksPage.wantToImport', { nbOfBoomarks: nbBookmarksToImport.current })}
                      </Typography>
                      <TableContainer className={classes.tableContainer}>
                        <Table stickyHeader size="small" aria-label="a sticky dense table">
                          <TableHead>
                            <TableRow>
                              <TableCell>{i18n.__('api.bookmarks.labels.name')}</TableCell>
                              <TableCell>{i18n.__('api.bookmarks.labels.url')}</TableCell>
                              <TableCell>
                                <div className="flex align-center">
                                  {i18n.__('api.bookmarks.keep')}
                                  <Checkbox
                                    checked={keepAll}
                                    onChange={handleKeepAll}
                                    title={i18n.__('api.bookmarks.keepOrAddAll')}
                                  />
                                </div>
                              </TableCell>
                              <TableCell>{i18n.__('api.bookmarks.addToPersonalSpace')}</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {bookmarksToImport.map((bookmark, index) => (
                              <ImportBookmarkTableRow
                                // eslint-disable-next-line react/no-array-index-key
                                key={index}
                                id={index}
                                bookmark={bookmark}
                                handleKeepChange={handleImportBookmarkRowKeepChange}
                                handleAddToFavChange={handleImportBookmarkRowAddToFavChange}
                              />
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </div>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        onClick={() => inputRef.current?.click()}
                        disabled={importing || isReadingFile}
                      >
                        {i18n.__('pages.UserBookmarksPage.importHtmlFile')}
                      </Button>
                      <br />
                      <input type="file" accept=".html" ref={inputRef} className="hidden" onChange={handleFileChange} />
                    </>
                  )}
                  <br />
                  <Divider />
                </>
              )}
              <div>
                <Typography variant="caption">Ressources :</Typography>
                <ul>
                  <li>
                    {dialogMode === 'import' ? (
                      <Link
                        href="https://support.mozilla.org/fr/kb/importer-marque-pages-fichier-html"
                        target="blank"
                        rel="noopener noreferrer"
                      >
                        <Typography variant="caption">{i18n.__('pages.UserBookmarksPage.importFirefox')}</Typography>
                      </Link>
                    ) : (
                      <Link
                        href="https://support.mozilla.org/fr/kb/exporter-marque-pages-firefox-fichier-html"
                        target="blank"
                        rel="noopener noreferrer"
                      >
                        <Typography variant="caption">{i18n.__('pages.UserBookmarksPage.exportFirefox')}</Typography>
                      </Link>
                    )}
                  </li>
                  <li>
                    <Link
                      href="https://support.google.com/chrome/answer/96816?hl=fr"
                      target="blank"
                      rel="noopener noreferrer"
                    >
                      <Typography variant="caption">{i18n.__('pages.UserBookmarksPage.exportChrome')}</Typography>
                    </Link>
                  </li>
                </ul>
              </div>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeImportModal} disabled={importing}>
                {i18n.__('pages.UserBookmarksPage.close')}
              </Button>
              {dialogMode === 'import' ? (
                <Button onClick={proceedWithImport} disabled={importing || !nbBookmarksToImport.current}>
                  {i18n.__('pages.UserBookmarksPage.proceedWithImport')}
                </Button>
              ) : (
                <Button onClick={proceedWithExport} disabled={exporting}>
                  {i18n.__('pages.UserBookmarksPage.proceedWithExport')}
                </Button>
              )}
            </DialogActions>
          </Dialog>
          {editUrl ? (
            <BookMarkEdit
              method="userBookmark"
              data={bkData}
              onEdit={onEdit}
              open={editUrl}
              onClose={() => setEditUrl(false)}
            />
          ) : null}
        </>
      )}
    </>
  );
}

UserBookmarksPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  bookmarksList: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default withTracker(() => {
  const userId = Meteor.userId();
  const bookmarksHandle = Meteor.subscribe('bookmark.user.all', { userId });
  const bookmarksList = UserBookmarks.find({ userId }, { sort: { name: 1 } }).fetch();
  const loading = !bookmarksHandle.ready();
  return {
    loading,
    bookmarksList,
  };
})(UserBookmarksPage);
