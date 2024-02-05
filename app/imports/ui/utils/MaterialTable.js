// see https://claritydev.net/blog/diacritic-insensitive-string-comparison-javascript
const normalizeRegex = /[\u0300-\u036f]/g;

export const normalizeString = (str) => {
  return str.normalize('NFD').replace(normalizeRegex, '').toLowerCase();
};

export const accentInsensitiveSearch = (value, rowData, fieldName) => {
  // create regEx for accent insensitive search ?
  if (rowData[fieldName]) return normalizeString(rowData[fieldName]).includes(normalizeString(value));
  return false;
};
