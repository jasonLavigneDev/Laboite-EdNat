import i18n from 'meteor/universe:i18n';
import { mergeDeep } from '../api/utils';
import fr from './i18n/fr.i18n.json';
import en from './i18n/en.i18n.json';

const { I18N_EN = '{}', I18N_FR = '{}' } = Meteor.isServer ? process.env : window;

const addLanguages = async () => {
  i18n.addTranslations('fr', mergeDeep(fr, JSON.parse(I18N_FR)));
  i18n.addTranslations('en', mergeDeep(en, JSON.parse(I18N_EN)));
};

Meteor.startup(addLanguages);
