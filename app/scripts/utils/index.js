const compareObjects = require('./compareObjects');
const extractMissingWords = require('./extractMissingWords');
const getWordPaths = require('./getWordPaths');

module.exports = {
  ...compareObjects,
  ...extractMissingWords,
  ...getWordPaths,
};
