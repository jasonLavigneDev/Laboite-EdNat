import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import Grid from '@mui/material/Grid';
import Fade from '@mui/material/Fade';
import Container from '@mui/material/Container';
import i18n from 'meteor/universe:i18n';
import { useTracker } from 'meteor/react-meteor-data';
import Spinner from '../../components/system/Spinner';

import { useAppContext } from '../../contexts/context';
import Structures from '../../../api/structures/structures';

const useStyles = () =>
  makeStyles()((theme) => ({
    parentImgWrapper: {
      flexDirection: 'column',
    },
    imgWrapper: {
      position: 'relative',
      height: 350,
    },
    coverImg: {
      display: 'block',
      width: '100%',
      height: '100%',
    },
    iconImg: {
      position: 'absolute',
      bottom: '-10%',
      left: '10%',
      height: '30%',
    },
    containerGrid: {
      paddingTop: theme.spacing(0),
      paddingBottom: theme.spacing(2),
      maxWidth: 2000,
    },
  }));

const IconAndCoverImagePage = ({ setMainPosition, topBarHeight, setMainMarginTop, setSecBarBorderTop }) => {
  const [{ user, loadingUser }] = useAppContext();
  const { classes } = useStyles()();

  const { userStructure, coverAltValue, iconAltValue } = useTracker(() => {
    if (user) {
      const st = Structures.findOne({ _id: user.structure }) || {};
      return {
        userStructure: st,
        coverAltValue: `${st?.name} ${i18n.__('pages.PersonalPage.coverImage')}`,
        iconAltValue: `${st?.name} ${i18n.__('pages.PersonalPage.iconImage')}`,
      };
    }
    return { userStructure: null, coverAltValue: null, iconAltValue: null };
  }, [user]);

  if (setMainPosition !== null && userStructure?.coverUrlImage !== undefined) {
    setMainPosition(topBarHeight > 0 ? `${topBarHeight + 10}px` : '25%');
    if (setMainMarginTop !== null) setMainMarginTop(false);
    if (setSecBarBorderTop !== null) setSecBarBorderTop(false);
  } else if (setMainPosition !== null) {
    setMainPosition('');
  }
  return (
    <>
      {loadingUser ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container className={classes.containerGrid}>
            <Grid container spacing={4}>
              {userStructure?.coverUrlImage !== undefined && (
                <Grid item xs={12} sm={12} md={12}>
                  <div className={classes.parentImgWrapper}>
                    <div className={classes.imgWrapper}>
                      <img src={userStructure?.coverUrlImage} alt={coverAltValue} className={classes.coverImg} />
                      <img src={userStructure?.iconUrlImage} alt={iconAltValue} className={classes.iconImg} />
                    </div>
                  </div>
                </Grid>
              )}
            </Grid>
          </Container>
        </Fade>
      )}
    </>
  );
};

IconAndCoverImagePage.propTypes = {
  setMainPosition: PropTypes.func,
  topBarHeight: PropTypes.number,
  setMainMarginTop: PropTypes.func,
  setSecBarBorderTop: PropTypes.func,
};

IconAndCoverImagePage.defaultProps = {
  setMainPosition: null,
  topBarHeight: 0,
  setMainMarginTop: null,
  setSecBarBorderTop: null,
};

export default IconAndCoverImagePage;
