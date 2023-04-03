import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';

import DeleteIcon from '@mui/icons-material/Delete';
import InputLabel from '@mui/material/InputLabel';
import CardContent from '@mui/material/CardContent';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import PublishIcon from '@mui/icons-material/Publish';
import IconButton from '@mui/material/IconButton';

import { useObjectState } from '../../utils/hooks';
import { useStyles } from './InfoEditionComponent';
import { useAppContext } from '../../contexts/context';
import { toBase64 } from '../../utils/filesProcess';
import Spinner from '../system/Spinner';

const getSplitedLastValue = (stringValue, separator) => {
  return stringValue.split(separator)[stringValue.split(separator).length - 1];
};

const initialFile = { name: '', type: '', path: '' };

const AdminStructureUploadIconAndCoverImage = ({ structure }) => {
  const { classes } = useStyles();
  const [loading, setLoading] = useState(false);

  const [coverFile, setCoverFile] = useObjectState(initialFile);
  const [iconFile, setIconFile] = useObjectState(initialFile);
  const [{ uploads }, dispatch] = useAppContext();

  const updateStructureIconOrCoverImg = (iconUrlImage, coverUrlImage) => {
    Meteor.call(
      'structures.updateStructureIconOrCoverImage',
      {
        structureId: structure._id,
        iconUrlImage,
        coverUrlImage,
      },
      (err) => {
        if (err) {
          const messages = err.details.map((detail) => detail.message);
          msg.error(messages.join(' / '));
        } else {
          msg.success(i18n.__('api.methods.operationSuccessMsg'));
        }
      },
    );
  };

  const removeIconOrCoverImg = (iconOrCoverImgFolder) => {
    Meteor.call(
      'structures.deleteIconOrCoverImage',
      {
        structureId: structure._id,
        iconUrlImage: iconOrCoverImgFolder === 'iconImg' ? structure.iconUrlImage : '-1',
        coverUrlImage: iconOrCoverImgFolder === 'coverImg' ? structure.coverUrlImage : '-1',
      },
      (err) => {
        if (err) {
          const messages = err.details.map((detail) => detail.message);
          msg.error(messages.join(' / '));
        } else {
          if (iconOrCoverImgFolder === 'iconImg') setIconFile({ name: '' });
          else setCoverFile({ name: '' });

          msg.success(i18n.__('api.methods.operationSuccessMsg'));
        }
      },
    );
  };
  const setIconOrCoverImg = (image, setfileDatas, file, iconOrCoverImgFolder) => {
    const extension = getSplitedLastValue(file.name, '.');
    const fileNam = file.name.replace(`.${extension}`, '');
    const structFolderPath = `structures/${structure._id}/${iconOrCoverImgFolder}`;
    setfileDatas({
      name: fileNam,
      type: extension,
      path: structFolderPath,
    });
    dispatch({
      type: 'uploads.add',
      data: {
        name: fileNam,
        fileName: fileNam,
        file: image,
        type: extension,
        path: structFolderPath,
        storage: false,
        onFinish: (url, error) => {
          if (!error && url) {
            updateStructureIconOrCoverImg(
              iconOrCoverImgFolder === 'iconImg' ? url : '-1',
              iconOrCoverImgFolder === 'coverImg' ? url : '-1',
            );
          } else {
            msg.error(error.message);
          }
          setLoading(false);
        },
      },
    });
  };
  const uploadIconImg = async (e) => {
    const { files } = e.target;
    const file = files[0];
    const image = await toBase64(file);
    setIconOrCoverImg(image, setIconFile, file, 'iconImg');
  };
  const uploadCoverImg = async (e) => {
    const { files } = e.target;
    const file = files[0];
    const image = await toBase64(file);
    setIconOrCoverImg(image, setCoverFile, file, 'coverImg');
  };

  useEffect(() => {
    const currentImagePath = uploads.find((img) => img.name === iconFile.name);
    if (currentImagePath && currentImagePath.error) {
      setLoading(false);
    }
  }, [uploads]);

  return (
    <form className={classes.root}>
      <div>
        <InputLabel>{i18n.__('components.AdminStructureUploadIconAndCoverImage.label')}</InputLabel>
        {loading && <Spinner full />}
        <CardContent>
          <Card>
            <Typography className={classes.actionsTitle}>
              {`${i18n.__('components.AdminStructureTreeItem.actions.selectIconImage')} : ${
                iconFile?.name !== ''
                  ? iconFile?.name
                  : structure?.iconUrlImage
                  ? getSplitedLastValue(structure?.iconUrlImage, '/')
                  : ''
              }`}
              <Tooltip
                title={i18n.__('components.AdminStructureTreeItem.actions.selectIconImage')}
                aria-label={i18n.__('components.AdminStructureTreeItem.actions.selectIconImage')}
              >
                <IconButton tabIndex={-1} size="large">
                  <PublishIcon />
                  <input className={classes.inputFil} type="file" title=" " onChange={uploadIconImg} />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={i18n.__('components.AdminStructureTreeItem.actions.DeleteIconImage')}
                aria-label={i18n.__('components.AdminStructureTreeItem.actions.DeleteIconImage')}
              >
                <IconButton
                  onClick={() => removeIconOrCoverImg('iconImg')}
                  tabIndex={-1}
                  size="large"
                  style={{ display: iconFile?.name !== '' || structure?.iconUrlImage ? 'inline-grid' : 'none' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Typography>
            <div className={classes.logoWrapper}>
              <div className={`${classes.imageWrapper} ${classes.logo}`}>
                <img
                  src={structure?.iconUrlImage ? structure?.iconUrlImage : ''}
                  alt={structure?.iconUrlImage ? getSplitedLastValue(structure?.iconUrlImage, '/') : ''}
                  className={classes.image}
                />
              </div>
            </div>
          </Card>
          <br />
          <Card>
            <Typography className={classes.actionsTitle}>
              {`${i18n.__('components.AdminStructureTreeItem.actions.selectCoverImage')} : ${
                coverFile?.name !== ''
                  ? coverFile?.name
                  : structure?.coverUrlImage
                  ? getSplitedLastValue(structure?.coverUrlImage, '/')
                  : ''
              }`}
              <Tooltip
                title={i18n.__('components.AdminStructureTreeItem.actions.selectCoverImage')}
                aria-label={i18n.__('components.AdminStructureTreeItem.actions.selectCoverImage')}
              >
                <IconButton tabIndex={-1} size="large">
                  <PublishIcon />
                  <input className={classes.inputFil} type="file" title=" " onChange={uploadCoverImg} />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={i18n.__('components.AdminStructureTreeItem.actions.DeleteCoverImage')}
                aria-label={i18n.__('components.AdminStructureTreeItem.actions.DeleteCoverImage')}
              >
                <IconButton
                  onClick={() => removeIconOrCoverImg('coverImg')}
                  tabIndex={-1}
                  size="large"
                  style={{ display: iconFile?.name !== '' || structure?.coverUrlImage ? 'inline-grid' : 'none' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Typography>
            <div className={classes.logoWrapper}>
              <div className={`${classes.imageWrapper} ${classes.logo}`}>
                <img
                  src={structure?.coverUrlImage ? structure?.coverUrlImage : ''}
                  alt={structure?.coverUrlImage ? getSplitedLastValue(structure?.coverUrlImage, '/') : ''}
                  className={classes.image}
                />
              </div>
            </div>
          </Card>
        </CardContent>
      </div>
    </form>
  );
};

AdminStructureUploadIconAndCoverImage.propTypes = {
  structure: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default AdminStructureUploadIconAndCoverImage;
