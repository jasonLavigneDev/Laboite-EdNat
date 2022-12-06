import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import i18n from 'meteor/universe:i18n';
import InputAdornment from '@mui/material/InputAdornment';
import { useTracker } from 'meteor/react-meteor-data';
import Groups from '../../../api/groups/groups';
import { getGroupName } from '../../utils/utilsFuncs';

function GroupFinder({ onSelected, exclude = [], opened }) {
  const options = useTracker(() => {
    Meteor.subscribe('groups.member');
    return Groups.find({ _id: { $nin: exclude } }).fetch();
  });
  const [open, setOpen] = useState(false);
  const existingTags = options.map((group) => getGroupName(group).toLowerCase());

  React.useEffect(() => {
    setOpen(opened);
  }, [opened]);

  const filter = createFilterOptions();

  return (
    <Autocomplete
      id="group-select"
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      autoHighlight
      freeSolo
      filterOptions={(opts, params) => {
        const filtered = filter(opts, params);
        // Suggest the creation of a new value if it does not already exist
        if (params.inputValue !== '') {
          if (!existingTags.includes(params.inputValue.toLowerCase())) {
            filtered.push({
              inputValue: params.inputValue,
              name: `"${params.inputValue.toLowerCase()}" : ${i18n.__('components.GroupFinder.noTag')} `,
            });
          }
        }
        return filtered;
      }}
      isOptionEqualToValue={(option, value) => {
        return option.name.toLowerCase === value.toLowerCase;
      }}
      getOptionLabel={(option) => {
        // Value selected with enter, right from the input
        if (typeof option === 'string') {
          return option;
        }
        // Add "xxx" option created dynamically
        if (option.inputValue) {
          return option.inputValue;
        }
        // Regular option
        return getGroupName(option);
      }}
      noOptionsText={i18n.__('components.GroupFinder.noGroup')}
      clearText={i18n.__('components.GroupFinder.clear')}
      loadingText={i18n.__('components.GroupFinder.loading')}
      openText={i18n.__('components.GroupFinder.open')}
      closeText={i18n.__('components.GroupFinder.close')}
      onChange={onSelected}
      options={options}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            label={i18n.__('components.GroupFinder.groupLabel')}
            variant="outlined"
            placeholder={i18n.__('components.GroupFinder.placeholder')}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            fullWidth
          />
        );
      }}
    />
  );
}

GroupFinder.defaultProps = {
  exclude: null,
  opened: false,
};

GroupFinder.propTypes = {
  onSelected: PropTypes.func.isRequired,
  exclude: PropTypes.arrayOf(PropTypes.string),
  opened: PropTypes.bool,
};

export default GroupFinder;
