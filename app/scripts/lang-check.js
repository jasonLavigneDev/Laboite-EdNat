/* eslint-disable no-console */
const fs = require('fs/promises');
const path = require('path');
const glob = require('glob');

const { compareObjects } = require('./utils');

async function handleAndCompare(files) {
  if (files.length < 2) throw new Error('Require at least two files to compare');

  // get files and format from JSON to objects
  const objects = await Promise.all(
    files.map(async (file) => {
      const filePath = path.resolve(file);
      const data = await fs.readFile(filePath, { encoding: 'utf-8' });

      return JSON.parse(data);
    }),
  );

  // Compare all the objects
  const diff = compareObjects(objects, files);

  return diff;
}

async function checkFiles(files) {
  const results = await handleAndCompare(files);

  const report = results.reduce(
    (reports, fileReport) => {
      if (fileReport?.wordsNotFound?.length) {
        // eslint-disable-next-line no-param-reassign
        reports.files[fileReport?.file] = {
          count: fileReport?.wordsNotFound?.length,
          missmatches: fileReport?.wordsNotFound,
        };
        // eslint-disable-next-line no-param-reassign
        reports.count += fileReport?.wordsNotFound?.length;
      }

      return reports;
    },
    {
      count: 0,
      files: {},
    },
  );

  return report || {};
}

/**
 *
 * @param {string[]} paths Glob paths to search files for
 */
async function main(paths) {
  const files = await Promise.all(
    paths.map((filePath) => {
      return new Promise((resolve, reject) => {
        glob(filePath, { nodir: true }, (err, res) => {
          if (err) reject(err);

          resolve(...res);
        });
      });
    }),
  );

  const report = await checkFiles(files);
  console.log('Analysis complete!');

  if (report.count > 0) {
    const reportPath = path.resolve(`./.reports/lang-report-${Date.now()}.json`);

    await fs.mkdir(path.dirname(reportPath), { recursive: true });

    console.warn(`Found ${report.count} differences.\nRefer to ${reportPath} for more information`);

    fs.writeFile(reportPath, JSON.stringify(report, null, 2), (err) => {
      if (err) throw err;
    });
  } else {
    console.info('There are no missing words');
  }
}

if (require.main === module) {
  const paths = process.argv.slice(2);

  if (paths.length === 0) {
    throw new Error('You need to provide a path to lookup translation files');
  }

  main(paths)
    .catch(console.error)
    .then(() => console.info('Done !'));
}
