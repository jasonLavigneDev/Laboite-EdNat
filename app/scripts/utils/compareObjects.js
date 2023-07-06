const { extractMissingWords } = require('./extractMissingWords');
const { getWordPaths } = require('./getWordPaths');

module.exports.compareObjects = (objects, files) => {
  const paths = objects.map(getWordPaths); // list des paths des mots de chaque fichier JSON
  const allPaths = [...new Set(paths.flat())]; // list des path de tous les mots des fichier JSON

  return Object.keys(objects).map((key, index) => {
    return {
      object: objects[key],
      wordsNotFound: extractMissingWords(allPaths, paths[index]),
      file: files[index],
    };
  });
};
