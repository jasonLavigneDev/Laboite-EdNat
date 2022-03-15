import i18n from 'meteor/universe:i18n';
import { mergeDeep } from '../api/utils';

const { I18N_EN = {}, I18N_FR = {} } = process.env;

const addLanguages = async () => {
  const fr = await import('./i18n/fr.i18n.json');
  const en = await import('./i18n/en.i18n.json');
  i18n.addTranslations('fr', mergeDeep(fr, I18N_FR));
  i18n.addTranslations('en', mergeDeep(en, I18N_EN));
};

Meteor.startup(addLanguages);
