const featureList =
  Meteor?.settings?.public?.features && Array.isArray(Meteor?.settings?.public?.features)
    ? Meteor?.settings?.public?.features
    : false;

/**
 * @enum {string}
 */
export const FEATURES = {
  franceTransfert: 'franceTransfert',
};

/**
 *
 * @param {FEATURES} feature
 */
export function isFeatureEnabled(feature) {
  if (!featureList) {
    return false;
  }

  return featureList.includes(feature);
}
