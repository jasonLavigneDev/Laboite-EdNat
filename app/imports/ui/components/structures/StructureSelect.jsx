import React from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CustomSelect from '../admin/CustomSelect';
import { propTypes as structuresPropTypes } from '../../../api/structures/structures';

const StructureSelect = ({
  structures,
  selectedStructureId,
  setSelectedStructureId,
  customSelectProps = {},
  formControlProps = {},
  emptyPossible,
}) => {
  return (
    <FormControl variant="filled" fullWidth {...formControlProps}>
      <InputLabel id="structure-label">{i18n.__('components.StructureSelect.label')}</InputLabel>
      <CustomSelect
        value={selectedStructureId || ''}
        error={false}
        onChange={(e) => {
          if (e.target.value.trim().length < 1 && !emptyPossible) return;
          setSelectedStructureId(e.target.value);
        }}
        options={structures.map((opt) => ({ value: opt._id, label: opt.name }))}
        {...customSelectProps}
      />
    </FormControl>
  );
};

StructureSelect.propTypes = {
  structures: PropTypes.arrayOf(structuresPropTypes).isRequired,
  setSelectedStructureId: PropTypes.func.isRequired,
  selectedStructureId: PropTypes.string.isRequired,
  emptyPossible: PropTypes.bool,
  customSelectProps: PropTypes.objectOf(PropTypes.any),
  formControlProps: PropTypes.objectOf(PropTypes.any),
};

StructureSelect.defaultProps = {
  customSelectProps: {},
  formControlProps: {},
  emptyPossible: false,
};

export default StructureSelect;
