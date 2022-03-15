import i18n from 'meteor/universe:i18n';

const { I18N_EN, I18N_FR } = process.env;

if (I18N_FR) {
  i18n.addTranslations('fr', I18N_FR);
} else {
  const fr = import('../../i18n/fr.i18n.json');
  i18n.addTranslations('fr', fr);
}
if (I18N_EN) {
  i18n.addTranslations('en', I18N_EN);
} else {
  const en = import('../../i18n/en.i18n.json');
  i18n.addTranslations('en', en);
}
