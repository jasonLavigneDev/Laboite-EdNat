import React from 'react';
import AutoComplete from '@mui/material/Autocomplete';
import PropTypes from 'prop-types';

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
      loading={loading}
      getOptionLabel={(option) => option.name}
      renderOption={(option) => {
        let parent;
        if (option.parentId) {
          parent = flatData.find((s) => s._id === option.parentId);
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
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
      getOptionSelected={(opt, val) => opt._id === val._id}
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
