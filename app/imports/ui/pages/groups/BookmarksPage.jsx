import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import Switch from '@mui/material/Switch';
import { withTracker } from 'meteor/react-meteor-data';
import ArrowBack from '@mui/icons-material/ArrowBack';
import MaterialTable from '@material-table/core';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import { Roles } from 'meteor/alanning:roles';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import FormControlLabel from '@mui/material/FormControlLabel';
import Tooltip from '@mui/material/Tooltip';
import add from '@mui/icons-material/Add';
import Button from '@mui/material/Button';
import Fade from '@mui/material/Fade';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { useHistory } from 'react-router-dom';
import Spinner from '../../components/system/Spinner';
import { useAppContext } from '../../contexts/context';
import { removeBookmark, updateBookmark } from '../../../api/bookmarks/methods';
import setMaterialTableLocalization from '../../components/initMaterialTableLocalization';
import BookMarkEdit from '../../components/users/BookMarkEdit';
import Bookmarks from '../../../api/bookmarks/bookmarks';
import Groups from '../../../api/groups/groups';
import { bookmarkColumns, useBookmarkPageStyles } from '../users/UserBookmarksPage';
import QRCanvas from '../../components/users/QRCanvas';

function BookmarksPage({ loading, bookmarksList, group }) {
  const [{ user, userId }] = useAppContext();

  const history = useHistory();
  const [filter, setFilter] = useState(false);
  const { classes } = useBookmarkPageStyles();
  const columns = bookmarkColumns(classes);

  const [editUrl, setEditUrl] = useState(false);
  const [bkData, setBkData] = useState({});
  const [onEdit, setOnEdit] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const bookmarksListFinal = bookmarksList.filter((bookmark) => bookmark.author === userId);

  const OpenURLEditor = () => setEditUrl(true);

  const filterOnURL = () => setFilter(!filter);

  const userInGroup = Roles.userIsInRole(userId, ['member', 'animator', 'admin'], group._id);

  const goBack = () => {
    history.goBack();
  };

  const hideEditActions = (checkId) => {
    return !(
      checkId === userId ||
      Roles.userIsInRole(userId, 'admin', group._id) ||
      Roles.userIsInRole(userId, 'admin')
    );
  };

  const options = {
    pageSize: 10,
    pageSizeOptions: [10, 20, 50, 100],
    paginationType: 'stepped',
    actionsColumnIndex: 6,
    addRowPosition: 'first',
    emptyRowsWhenPaging: false,
  };

  const tableActions = [];
  if (userInGroup) {
    tableActions.push({
      icon: add,
      tooltip: i18n.__('pages.BookmarksPage.materialTableLocalization.body_addTooltip'),
      isFreeAction: true,
      onClick: () => {
        setOnEdit(false);
        setBkData({});
        OpenURLEditor();
      },
    });
  }
  tableActions.push((rowData) => {
    return {
      icon: () => <QrCode2Icon />,
      tooltip: i18n.__('pages.UserBookmarksPage.showQrCode'),
      onClick: () => {
        setIsModalOpen(true);
        setQrUrl(rowData.url);
      },
    };
  });
  tableActions.push((rowData) => {
    const isFavorite = user.favUserBookmarks.indexOf(rowData._id) !== -1;
    return {
      icon: () => (isFavorite ? <StarIcon /> : <StarBorderIcon />),
      tooltip: i18n.__(`pages.UserBookmarksPage.${isFavorite ? 'unfavoriteBookmark' : 'favoriteBookmark'}`),
      onClick: () => {
        Meteor.call(
          `bookmarks.${isFavorite ? 'unfavGroupBookmark' : 'favGroupBookmark'}`,
          { bookmarkId: rowData._id },
          (err) => {
            if (err) {
              msg.error(err.reason);
            }
          },
        );
      },
    };
  });

  return (
    <Fade in>
      <Container style={{ overflowX: 'auto' }}>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={12} md={12}>
            <Button color="primary" startIcon={<ArrowBack />} onClick={goBack}>
              {i18n.__('pages.ExtService.back')}
            </Button>
          </Grid>
        </Grid>
        {loading ? (
          <Spinner />
        ) : userInGroup || group.type === 0 ? (
          <div>
            <Tooltip
              title={
                filter
                  ? `${i18n.__('pages.BookmarksPage.disableFilter')}`
                  : `${i18n.__('pages.BookmarksPage.enableFilter')}`
              }
            >
              <FormControlLabel
                value="start"
                control={
                  <Switch
                    checked={filter}
                    onChange={filterOnURL}
                    color="primary"
                    name="checkedB"
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                  />
                }
                label={i18n.__('pages.BookmarksPage.filterTitle')}
                labelPlacement="start"
              />
            </Tooltip>
            <MaterialTable
              // other props
              title={i18n.__('pages.BookmarksPage.title')}
              columns={columns}
              data={(filter ? bookmarksListFinal : bookmarksList).map((row) => ({ ...row, id: row._id }))}
              options={options}
              localization={setMaterialTableLocalization('pages.BookmarksPage')}
              actions={tableActions}
              editable={{
                isDeleteHidden: (rowData) => hideEditActions(rowData.author),
                isEditHidden: (rowData) => hideEditActions(rowData.author),
                onRowUpdate: (newData, oldData) =>
                  new Promise((resolve, reject) => {
                    updateBookmark.call(
                      {
                        id: oldData._id,
                        url: newData.url,
                        name: newData.name,
                        tag: newData.tag,
                        groupId: group._id,
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
                    Meteor.call('bookmark.getFavicon', { url: newData.url });
                  }),
                onRowDelete: (oldData) =>
                  new Promise((resolve, reject) => {
                    removeBookmark.call(
                      {
                        url: oldData.url,
                        groupId: group._id,
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
            {editUrl ? (
              <BookMarkEdit
                data={bkData}
                group={group}
                onEdit={onEdit}
                open={editUrl}
                onClose={() => setEditUrl(false)}
                method="bookmark"
              />
            ) : null}
          </div>
        ) : (
          <p className={classes.ErrorPage}>{i18n.__('pages.BookmarksPage.noAccess')}</p>
        )}
        <Dialog className={classes.modal} open={isModalOpen} onClose={closeModal}>
          <DialogContent>
            <QRCanvas url={qrUrl} />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeModal}>{i18n.__('pages.UserBookmarksPage.close')}</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Fade>
  );
}

BookmarksPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  bookmarksList: PropTypes.arrayOf(PropTypes.object).isRequired,
  group: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default withTracker(
  ({
    match: {
      params: { slug },
    },
  }) => {
    const subGroup = Meteor.subscribe('groups.single', { slug });
    const group = Groups.findOne({ slug }) || {};
    const bookmarksHandle = Meteor.subscribe('bookmark.group.all', { groupId: group._id });
    const bookmarksList = Bookmarks.find({ groupId: group._id }, { sort: { name: 1 } }).fetch();
    const loading = !bookmarksHandle.ready() || !subGroup.ready();
    return {
      loading,
      bookmarksList,
      group,
    };
  },
)(BookmarksPage);
