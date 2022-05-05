import React from 'react';
import PropTypes from 'prop-types';
import i18n from 'meteor/universe:i18n';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import CustomSelect from '../admin/CustomSelect';
import { propTypes as structuresPropTypes } from '../../../api/structures/structures';

const StructureSelect = ({
  structures,
  selectedStructureId,
  setSelectedStructureId,
  customSelectProps = {},
  formControlProps = {},
}) => {
  return (
    <FormControl variant="filled" fullWidth {...formControlProps}>
      <InputLabel id="structure-label">{i18n.__('components.StructureSelect.label')}</InputLabel>
      <CustomSelect
        labelWidth={100}
        value={selectedStructureId || ''}
        error={false}
        onChange={(e) => {
          if (e.target.value.trim().length < 1) return;
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
  customSelectProps: PropTypes.objectOf(PropTypes.any),
  formControlProps: PropTypes.objectOf(PropTypes.any),
};

StructureSelect.defaultProps = {
  customSelectProps: {},
  formControlProps: {},
};

export default StructureSelect;
