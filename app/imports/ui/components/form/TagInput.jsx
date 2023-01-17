/* eslint-disable react/jsx-no-bind */
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from 'tss-react/mui';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Downshift from 'downshift';
import Box from '@mui/material/Box';
import { useAppContext } from '../../contexts/context';

const useStyles = makeStyles()((theme) => ({
  chipList: {
    maxHeight: '5rem',
    overflowY: 'auto',
  },
  chip: {
    margin: theme.spacing(0.5, 0.25),
  },
  input: {
    flexWrap: 'wrap',
    gap: theme.spacing(0.5),
  },
}));

/**
 * @typedef {Object} TagsInputProps
 * @property {string[]} tags
 * @property {(tags: string) => void} onAddTag
 * @property {(index: number) => void} onRemoveTag
 * @property {(tags: string) => boolean} validate
 */

/**
 * @param {import('@mui/material/TextField').TextFieldProps & TagsInputProps} props
 * @returns
 */
export default function TagsInput({ ...props }) {
  const [{ isMobile }] = useAppContext();
  const { classes } = useStyles(isMobile);
  const { onAddTag, onRemoveTag, validate, placeholder, tags = [], ...other } = props;
  const [inputValue, setInputValue] = React.useState('');
  /**
   * @type {import('react').MutableRefObject<HTMLDivElement>}
   */
  const boxRef = useRef();

  function scrollToBottonTag() {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }

  useEffect(() => {
    scrollToBottonTag();
  }, [tags]);

  function handleKeyDown(event) {
    if (['Enter', 'Tab', 'Space', ' '].includes(event.key)) {
      event.preventDefault();
      const value = event.target.value.trim();
      const duplicatedValues = tags.indexOf(value);

      if (!validate(value)) return;

      if (duplicatedValues !== -1) {
        setInputValue('');
        return;
      }
      if (!value.replace(/\s/g, '').length) return;

      onAddTag(value);
      setInputValue('');
    }
    if (tags.length && !inputValue.length && event.key === 'Backspace') {
      event.preventDefault();
      setInputValue(tags[tags.length - 1]);
      onRemoveTag(tags.length - 1);
    }
  }

  function handleChange(item) {
    if (tags.indexOf(item) === -1) {
      onAddTag(item);
    }
    setInputValue('');
  }

  const handleDelete = (item) => () => {
    onRemoveTag(tags.indexOf(item));
  };

  function handleInputChange(event) {
    setInputValue(event.target.value);
  }
  return (
    <>
      <Downshift id="downshift-multiple" inputValue={inputValue} onChange={handleChange} selectedItem={tags}>
        {({ getInputProps }) => {
          const { onBlur, onChange, onFocus, ...inputProps } = getInputProps({
            onKeyDown: handleKeyDown,
            placeholder,
          });
          return (
            <div>
              <TextField
                InputProps={{
                  className: classes.input,
                  startAdornment: (
                    <Box ref={boxRef} className={classes.chipList}>
                      {tags.map((item) => (
                        <Chip
                          key={item}
                          tabIndex={-1}
                          label={item}
                          title={item}
                          className={classes.chip}
                          onDelete={handleDelete(item)}
                        />
                      ))}
                    </Box>
                  ),
                  onBlur,
                  onChange: (event) => {
                    handleInputChange(event);
                    onChange(event);
                  },
                  onFocus,
                }}
                {...other}
                {...inputProps}
              />
            </div>
          );
        }}
      </Downshift>
    </>
  );
}

// eslint-disable-next-line prettier/prettier
const noop = () => { };
TagsInput.defaultProps = {
  tags: [],
  onAddTag: noop,
  onRemoveTag: noop,
  validate: () => true,
};
TagsInput.propTypes = {
  onAddTag: PropTypes.func,
  onRemoveTag: PropTypes.func,
  validate: PropTypes.func,
  tags: PropTypes.arrayOf(PropTypes.string),
  ...TextField.propTypes,
};
