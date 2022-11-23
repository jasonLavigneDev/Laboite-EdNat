import React from 'react';
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
      height: '175px',
    },
    coverImg: {
      display: 'block',
      width: '100%',
      height: '100%',
    },
    iconImg: {
      position: 'absolute',
      bottom: '-48px',
      height: '100px',
    },
    containerGrid: {
      paddingTop: theme.spacing(0),
      paddingBottom: theme.spacing(0),
      paddingLeft: theme.spacing(0),
      paddingRight: theme.spacing(0),
      maxWidth: 3000,
    },
    containerGridItem: {
      paddingLeft: '0px !important',
      paddingRight: '0px !important',
    },
    containerGridImgWrapper: {
      // marginRight: '-32px !important',
      // marginLeft: '-32px !important'',
      marginLeft: '0px !important',
      width: 'auto !important',
    },
  }));

const IconAndCoverImagePage = () => {
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

  return (
    <>
      {loadingUser ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container className={classes.containerGrid}>
            <Grid container spacing={4} className={classes.containerGridImgWrapper}>
              {userStructure?.coverUrlImage !== undefined && (
                <Grid item xs={12} sm={12} md={12} className={classes.containerGridItem}>
                  <div className={classes.parentImgWrapper}>
                    <div className={classes.imgWrapper}>
                      <img src={userStructure?.coverUrlImage} alt={coverAltValue} className={classes.coverImg} />
                      <Container>
                        <img
                          src={userStructure?.iconUrlImage}
                          alt={iconAltValue}
                          className={classes.iconImg}
                          id="iconImgId"
                        />
                      </Container>
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

export default IconAndCoverImagePage;
