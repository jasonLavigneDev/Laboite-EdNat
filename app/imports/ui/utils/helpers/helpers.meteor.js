/**
 * It's a wrapper around Meteor's `Meteor.call` function that returns a promise instead of using a
 * callback
 * @param methodName - The name of the method you want to call.
 * @param args - The arguments to pass to the method.
 * @returns A promise that resolves to the result of the Meteor method call.
 */
export const callMethod = async (methodName, ...args) => {
  return new Promise((resolve, reject) => {
    Meteor.call(methodName, ...args, (err, result) => {
      if (err) {
        console.error(err);
        return reject(err);
      }

      return resolve(result);
    });
  });
};
