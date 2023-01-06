module.exports.extractMissingWords = (allWords, element) => {
  return allWords?.filter((word) => !element.includes(word));
};
