import React from 'react';
import PropTypes from 'prop-types';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default function CustomSelect({ value, error, onChange, labelWidth, options }) {
  return (
    <Select
      labelId="structure-label"
      name="structureSelect"
      value={value || ''}
      error={error}
      onChange={onChange}
      labelWidth={labelWidth}
    >
      <MenuItem value="">
        <em>Aucune</em>
      </MenuItem>
      {options.map((op) => (
        <MenuItem key={op.value} value={op.value}>
          {op.label}
        </MenuItem>
      ))}
    </Select>
  );
}

CustomSelect.propTypes = {
  value: PropTypes.string.isRequired,
  error: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  labelWidth: PropTypes.number.isRequired,
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
};
