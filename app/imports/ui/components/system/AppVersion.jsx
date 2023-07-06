import React from 'react';
import i18n from 'meteor/universe:i18n';

import PackageJSON from '../../../../package.json';
import { checkAccessAndLogin } from '../../pages/system/SignIn';
import { useAppContext } from '../../contexts/context';

const { version } = PackageJSON;

const style = {
  opacity: 0.5,
  border: 'none',
  background: 'transparent',
};

const AppVersion = () => {
  const [{ isIframed }] = useAppContext();
  return (
    <button style={style} type="button" onClick={() => checkAccessAndLogin(isIframed)}>
      {i18n.__('components.AppVersion.title')} {version}
    </button>
  );
};

export default AppVersion;
