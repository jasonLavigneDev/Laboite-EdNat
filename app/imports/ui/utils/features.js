/**
 *
 * @param {string} feature
 */
export function isFeatureEnabled(feature) {
  return Meteor.settings.public.disabledFeatures[feature] === false;
}
