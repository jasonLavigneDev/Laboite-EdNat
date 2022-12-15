import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import { withTracker } from 'meteor/react-meteor-data';
import ArrowBack from '@mui/icons-material/ArrowBack';
import MaterialTable from '@material-table/core';
import Grid from '@mui/material/Grid';
import { makeStyles } from 'tss-react/mui';
import LanguageIcon from '@mui/icons-material/Language';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import Container from '@mui/material/Container';
import { Roles } from 'meteor/alanning:roles';
import add from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import { useHistory } from 'react-router-dom';
import Spinner from '../../components/system/Spinner';
import { useAppContext } from '../../contexts/context';
import { removeUserBookmark, updateUserBookmark } from '../../../api/userBookmarks/methods';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import BookMarkEdit from '../../components/users/BookMarkEdit';
import UserBookmarks from '../../../api/userBookmarks/userBookmarks';

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
        return <img src={`${icon}`} className={classes.icon} />;
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

function UserBookmarksPage({ loading, bookmarksList }) {
  const [{ user, userId }] = useAppContext();
  const history = useHistory();
  const { classes } = useBookmarkPageStyles();

  const columns = bookmarkColumns(classes);

  const [editUrl, setEditUrl] = useState(false);
  const [bkData, setBkData] = useState({});
  const [onEdit, setOnEdit] = useState(false);
  const [pageSize, setPageSize] = useState(getLocalStorageValue('cstRowsPerPage', 10));

  const OpenURLEditor = () => setEditUrl(true);

  const goBack = () => {
    history.goBack();
  };

  const hideEditActions = (checkId) => {
    return !(checkId === userId || Roles.userIsInRole(userId, 'admin'));
  };

  /**
   * @type {import('@material-table/core').Options}
   */
  const options = {
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
  };

  const handleChangeRowsPerPage = (rowsPerPage) => {
    // Access initial value from session storage
    const cstRowsPerPage = getLocalStorageValue('cstRowsPerPage', 10);

    if (cstRowsPerPage !== rowsPerPage) {
      // Update session storage
      sessionStorage.setItem('cstRowsPerPage', rowsPerPage);
      setPageSize(rowsPerPage);
    }
  };
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
              title={`${i18n.__('pages.BookmarksPage.title')}`}
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
                    OpenURLEditor();
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
  const [{ userId }] = useAppContext();
  const bookmarksHandle = Meteor.subscribe('bookmark.user.all', { userId });
  const bookmarksList = UserBookmarks.find({ userId }, { sort: { name: 1 } }).fetch();
  const loading = !bookmarksHandle.ready();
  return {
    loading,
    bookmarksList,
  };
})(UserBookmarksPage);
