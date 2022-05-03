import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

const defaultSize = 24;

const propTypes = {
  size: PropTypes.number,
};
const defaultPropTypes = {
  size: defaultSize,
};

const pxSize = (size) => `${size}px`;

export const useIconStyles = makeStyles((theme) => ({
  svg: {
    fill: theme.palette.primary.main,
  },
  size: {
    height: pxSize(defaultSize),
    width: pxSize(defaultSize),
  },
}));

export const DetaiIconCustom = forwardRef(({ size = defaultSize }, ref) => {
  const classes = useIconStyles();
  const viewBox = `0 0 ${size} ${size}`;

  return (
    <span className={classes.size} ref={ref}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height={pxSize(size)}
        width={pxSize(size)}
        viewBox={viewBox}
        className={classes.svg}
      >
        <path d="M0 0h24v24H0V0z" fill="none" />
        {/* eslint-disable-next-line max-len */}
        <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
      </svg>
    </span>
  );
});

DetaiIconCustom.propTypes = { ...propTypes };
DetaiIconCustom.defaultProps = { ...defaultPropTypes };

export const SimpleIconCustom = forwardRef(({ size = defaultSize }, ref) => {
  const classes = useIconStyles();
  const viewBox = `0 0 ${size} ${size}`;

  return (
    <span className={classes.size} ref={ref}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height={pxSize(size)}
        width={pxSize(size)}
        viewBox={viewBox}
        className={classes.svg}
      >
        <path d="M0 0h24v24H0V0z" fill="none" />
        {/* eslint-disable-next-line max-len */}
        <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
      </svg>
    </span>
  );
});

SimpleIconCustom.propTypes = { ...propTypes };
SimpleIconCustom.defaultProps = { ...defaultPropTypes };
