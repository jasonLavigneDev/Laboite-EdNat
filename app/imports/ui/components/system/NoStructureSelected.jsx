import React from 'react';
import CardMessage from './CardMessage';

const NoStructureSelected = () => {
  return (
    <CardMessage
      title="components.NoStructureSelected.noStructure"
      subtitle="components.NoStructureSelected.selectStructure"
      link="/profile"
      linkText="components.NoStructureSelected.editProfileLabel"
    />
  );
};

export default NoStructureSelected;
