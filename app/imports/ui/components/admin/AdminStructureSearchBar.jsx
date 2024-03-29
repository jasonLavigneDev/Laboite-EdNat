import React from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import IconButton from '@mui/material/IconButton';
import ClearIcon from '@mui/icons-material/Clear';
import InputAdornment from '@mui/material/InputAdornment';

const AdminStructureSearchBar = (props) => {
  const { searchValue, setSearchText, resetSearchText, resetFilter } = props;
  return (
    <Box sx={{ p: 0.5, pb: 0 }}>
      <TextField
        fullWidth
        variant="outlined"
        value={searchValue}
        onChange={(e) => {
          setSearchText(e.target.value);
          if (e.target.value.length < 1) resetFilter();
        }}
        placeholder={i18n.__('components.AdminStructureSearchBar.filterByName')}
        title={i18n.__('components.AdminStructureSearchBar.filterByName')}
        InputProps={{
          type: 'text',
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <IconButton
              title={i18n.__('components.AdminStructureSearchBar.clear')}
              aria-label={i18n.__('components.AdminStructureSearchBar.clear')}
              size="small"
              style={{ visibility: searchValue ? 'visible' : 'hidden' }}
              onClick={() => {
                resetSearchText();
                resetFilter();
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          ),
        }}
      />
    </Box>
  );
};

AdminStructureSearchBar.propTypes = {
  searchValue: PropTypes.string.isRequired,
  setSearchText: PropTypes.func.isRequired,
  resetSearchText: PropTypes.func.isRequired,
  resetFilter: PropTypes.func.isRequired,
};

export default AdminStructureSearchBar;
