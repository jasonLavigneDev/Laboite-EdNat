module.exports.getWordPaths = function getWordPaths(object) {
  const result = [];
  Object.keys(object).forEach((key) => {
    if (Object.prototype.toString.call(object[key]) === '[object Object]') {
      // Recursive step
      const keys = getWordPaths(object[key]);
      keys.forEach((subKey) => {
        result.push(`${key}.${subKey}`);
      });
    } else {
      result.push(key);
    }
  });
  return result;
};
