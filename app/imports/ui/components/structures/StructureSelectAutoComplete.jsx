import React from 'react';
import AutoComplete from '@mui/material/Autocomplete';
import PropTypes from 'prop-types';
import { normalizeString } from '../../utils/MaterialTable';

// filter options ignores accentuated characters
const filterOptions = (options, state) =>
  options.filter((option) => {
    return normalizeString(option.name).includes(normalizeString(state.inputValue));
  });

export const renderStructure = (flatData) => (props, option) => {
  let parent;
  const { parentId, name, _id } = option;
  if (parentId) {
    parent = flatData.find((s) => s._id === parentId);
  }
  return (
    <div {...props} style={{ display: 'flex', flexDirection: 'column', alignItems: 'start' }} key={_id}>
      <div>{name}</div>
      {!!parentId && (
        <div style={{ fontSize: 10, color: 'grey', fontStyle: 'italic' }}>{parent ? parent.name : ''}</div>
      )}
    </div>
  );
};

const StructureSelectAutoComplete = ({
  flatData,
  loading,
  onChange,
  searchText,
  noOptionsText,
  onInputChange,
  disabled = false,
  renderInput,
  ...rest
}) => {
  return (
    <AutoComplete
      options={flatData}
      noOptionsText={noOptionsText}
      filterOptions={filterOptions}
      loading={loading}
      getOptionLabel={(option) => option.name}
      renderOption={(props, option) => {
        let parent;
        if (option.parentId) {
          parent = flatData.find((s) => s._id === option.parentId);
        }
        return (
          <div
            key={option.id}
            {...props}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
          >
            <div>{option.name}</div>
            {!!option.parentId && (
              <div style={{ fontSize: 10, color: 'grey', fontStyle: 'italic' }}>{parent ? parent.name : ''}</div>
            )}
          </div>
        );
      }}
      onChange={onChange}
      inputValue={searchText}
      onInputChange={onInputChange}
      disabled={disabled}
      // getOptionSelected={(opt, val) => opt._id === val._id}
      style={{ width: 500 }}
      renderInput={renderInput}
      {...rest}
    />
  );
};

StructureSelectAutoComplete.propTypes = {
  flatData: PropTypes.arrayOf(PropTypes.any).isRequired,
  loading: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onInputChange: PropTypes.func.isRequired,
  searchText: PropTypes.string.isRequired,
  renderInput: PropTypes.func.isRequired,
  noOptionsText: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

StructureSelectAutoComplete.defaultProps = {
  disabled: false,
};
export default StructureSelectAutoComplete;
