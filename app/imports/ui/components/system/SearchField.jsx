import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';

const SearchField = ({ updateSearch, checkEscape, search, inputRef, resetSearch, label }) => (
  <TextField
    margin="normal"
    id="search"
    // label={label}
    name="search"
    fullWidth
    onChange={updateSearch}
    onKeyDown={checkEscape}
    type="text"
    value={search}
    variant="filled"
    placeholder={label}
    inputProps={{
      ref: inputRef,
    }}
    // eslint-disable-next-line react/jsx-no-duplicate-props
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon />
        </InputAdornment>
      ),
      endAdornment: search ? (
        <InputAdornment position="end">
          <IconButton onClick={resetSearch} size="large">
            <ClearIcon />
          </IconButton>
        </InputAdornment>
      ) : null,
    }}
  />
);

export default SearchField;

SearchField.defaultProps = {
  checkEscape: () => null,
  inputRef: null,
};

SearchField.propTypes = {
  updateSearch: PropTypes.func.isRequired,
  checkEscape: PropTypes.func,
  search: PropTypes.string.isRequired,
  inputRef: PropTypes.objectOf(PropTypes.any),
  resetSearch: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};
