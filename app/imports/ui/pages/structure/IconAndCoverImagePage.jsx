import React, { useEffect, useRef } from 'react';
import { makeStyles } from 'tss-react/mui';
import Grid from '@mui/material/Grid';
import Fade from '@mui/material/Fade';
import Container from '@mui/material/Container';
import i18n from 'meteor/universe:i18n';
import { useTracker } from 'meteor/react-meteor-data';
import Spinner from '../../components/system/Spinner';

import { useAppContext } from '../../contexts/context';
import Structures from '../../../api/structures/structures';

const useStyles = (isMobile) =>
  makeStyles()((theme) => ({
    parentImgWrapper: {
      flexDirection: 'column',
    },
    imgWrapper: {
      position: 'relative',
      height: !isMobile ? '175px' : '',
    },
    coverImg: {
      display: 'block',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    iconImg: {
      position: 'absolute',
      bottom: !isMobile ? '-48px' : '-25px',
      height: !isMobile ? '100px' : '50px',
      width: '8vw',
    },
    containerGrid: {
      display: isMobile ? 'none' : 'inherit',
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
      marginLeft: '0px !important',
      width: 'auto !important',
    },
  }));

const IconAndCoverImagePage = () => {
  const [{ user, loadingUser, isMobile }] = useAppContext();
  const { classes } = useStyles(isMobile)();

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

  const imgWrapperRef = useRef(null);
  const iconImgRef = useRef(null);
  useEffect(() => {
    // update cover and icon images style for a widget mode

    if (userStructure?.iconUrlImage !== undefined && userStructure?.coverUrlImage !== undefined) {
      imgWrapperRef.current.style.height = !isMobile ? '175px' : 'auto';
      iconImgRef.current.style.bottom =
        !isMobile || (isMobile && userStructure?.coverUrlImage === undefined) ? '-48px' : '-25px';
      iconImgRef.current.style.height = !isMobile ? '100px' : '50px';
    }
  }, [isMobile]);
  return (
    <>
      {loadingUser ? (
        <Spinner />
      ) : (
        <Fade in>
          <Container className={classes.containerGrid}>
            <Grid container spacing={4} className={classes.containerGridImgWrapper}>
              {userStructure?.coverUrlImage !== undefined && userStructure?.iconUrlImage !== undefined && (
                <Grid item xs={12} sm={12} md={12} className={classes.containerGridItem}>
                  <div className={classes.parentImgWrapper}>
                    <div
                      className={userStructure?.coverUrlImage !== undefined ? classes.imgWrapper : ''}
                      ref={imgWrapperRef}
                    >
                      {userStructure?.coverUrlImage !== undefined && (
                        <img src={userStructure?.coverUrlImage} alt={coverAltValue} className={classes.coverImg} />
                      )}
                      {userStructure?.iconUrlImage !== undefined && (
                        <Container>
                          <img
                            src={userStructure?.iconUrlImage}
                            alt={iconAltValue}
                            className={classes.iconImg}
                            id="iconImgId"
                            ref={iconImgRef}
                          />
                        </Container>
                      )}
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
