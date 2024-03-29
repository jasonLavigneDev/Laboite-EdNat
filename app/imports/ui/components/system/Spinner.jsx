import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import { keyframes } from 'tss-react';

const cubes = [
  '0.5s',
  '0.6s',
  '0.7s',
  '0.8s',
  '0.9s',
  '0.4s',
  '0.5s',
  '0.6s',
  '0.7s',
  '0.8s',
  '0.3s',
  '0.4s',
  '0.5s',
  '0.6s',
  '0.7s',
  '0.2s',
  '0.3s',
  '0.4s',
  '0.5s',
  '0.6s',
  '0.1s',
  '0.2s',
  '0.3s',
  '0.4s',
  '0.5s',
];

const useStyles = makeStyles()((theme) => ({
  wrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    zIndex: 10,
    animation: `${keyframes`
    0% {
      opacity: 0%;
    }
    100% {
      opacity: 100%;
    }
    `} 0.5s ease-in-out`,
  },
  mainLoader: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100000,
  },
  loaderWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '30px',
  },
  loaderSvg: {
    margin: 'auto',
  },
  subtitle: {
    textTransform: 'uppercase',
  },
  skGrid: {
    width: 60,
    height: 60,
    marginBottom: '15px',
  },
  skGridCube: {
    width: '20%',
    height: '20%',
    float: 'left',
    backgroundImage: `url("${theme.logos.SMALL_LOGO}")`,
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'inherit',
    backgroundSize: 60,
    animation: `${keyframes`
    0%, 70% {}
    100% {
      transform: scale3D(1, 1, 1);
    }
    50% {
      transform: scale3D(0.1, 0.1, 1);
    }
    `} 1.5s infinite ease-in-out`,
  },
}));

const Spinner = ({ full = false, message = null }) => {
  const { classes } = useStyles();
  return (
    <div className={`${classes.wrapper} ${full ? classes.mainLoader : ''}`}>
      <div className={classes.loaderWrapper}>
        <div className={classes.skGrid}>
          {cubes.map((c, i) => (
            <div
              className={classes.skGridCube}
              key={Math.random()}
              style={{
                animationDelay: c,
                backgroundPosition: `${(i % 5) * 25}% ${Math.floor(i / 5) * 25}%`,
              }}
            />
          ))}
        </div>
        {message && <span className={classes.subtitle}>{message}</span>}
      </div>
    </div>
  );
};

export default Spinner;

Spinner.defaultProps = {
  full: false,
  message: null,
};

Spinner.propTypes = {
  full: PropTypes.bool,
  message: PropTypes.string,
};
