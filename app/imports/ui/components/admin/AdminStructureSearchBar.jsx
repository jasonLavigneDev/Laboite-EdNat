import React from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';
import ClearIcon from '@material-ui/icons/Clear';
import InputAdornment from '@material-ui/core/InputAdornment';

const AdminStructureSearchBar = (props) => {
  const { searchValue, setSearchText, resetSearchText, resetFilter } = props;
  return (
    <Box sx={{ p: 0.5, pb: 0 }}>
      <TextField
        variant="outlined"
        value={searchValue}
        onChange={(e) => {
          setSearchText(e.target.value);
          if (e.target.value.length < 1) resetFilter();
        }}
        placeholder={i18n.__('components.AdminStructuresSearchBar.filterByName')}
        title={i18n.__('components.AdminStructuresSearchBar.filterByName')}
        InputProps={{
          type: 'text',
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: (
            <IconButton
              title={i18n.__('components.AdminStructuresSearchBar.clear')}
              aria-label={i18n.__('components.AdminStructuresSearchBar.clear')}
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
