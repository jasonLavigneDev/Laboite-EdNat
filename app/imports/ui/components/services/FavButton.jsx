import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import i18n from 'meteor/universe:i18n';

import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';

const FavButton = ({ service, favorite, classesArray = [], isIcon = false }) => {
  const handleFavorite = (e) => {
    e.stopPropagation(); // To prevent the CardActionArea onClick to launch
    if (!favorite) {
      Meteor.call('services.unfavService', { serviceId: service._id }, (err) => {
        if (err) {
          msg.error(err.reason);
        } else {
          msg.success(i18n.__('components.ServiceDetails.unfavSuccessMsg'));
        }
      });
    } else {
      Meteor.call('services.favService', { serviceId: service._id }, (err) => {
        if (err) {
          msg.error(err.reason);
        } else {
          msg.success(i18n.__('components.ServiceDetails.favSuccessMsg'));
        }
      });
    }
  };
  const buttonProps = {
    variant: 'outlined',
    color: 'primary',
    size: isIcon ? 'small' : 'large',
    className: classesArray.join(' '),
    onClick: handleFavorite,
  };

  const favButtonLabel = !favorite
    ? i18n.__('components.ServiceDetails.favButtonLabelNoFav')
    : i18n.__('components.ServiceDetails.favButtonLabelFav');
  const FavIcon = () => (favorite ? <AddIcon /> : <RemoveIcon />);
  return (
    <Tooltip title={favButtonLabel} aria-label={favButtonLabel}>
      {isIcon ? (
        <IconButton {...buttonProps}>
          <FavIcon />
        </IconButton>
      ) : (
        <Button {...buttonProps}>
          <FavIcon />
        </Button>
      )}
    </Tooltip>
  );
};

FavButton.propTypes = {
  classesArray: PropTypes.arrayOf(PropTypes.string),
  isIcon: PropTypes.bool,
  service: PropTypes.objectOf(PropTypes.any).isRequired,
  favorite: PropTypes.bool,
};

FavButton.defaultProps = {
  favorite: false,
  classesArray: [],
  isIcon: false,
};

export default FavButton;
