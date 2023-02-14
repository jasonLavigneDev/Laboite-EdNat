import { useCallback, useState } from 'react';
import { callMethod } from '../helpers/helpers.meteor';
/**
 * React hook that lazily calls a Meteor method, and return a tuple
 * @param methodName - The name of the method to call.
 * @returns A function and an object containing the result with the loading, error, and called states
 */
export const useMethod = (methodName) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [called, setCalled] = useState(false);

  const call = useCallback(
    async (...args) => {
      if (!called) {
        setCalled(true);
      }

      setLoading(true);

      try {
        const results = await callMethod(methodName, ...args);

        setResult(results);
        setError(null);
        setLoading(false);

        return result;
      } catch (e) {
        setResult(null);
        setError(e);
        setLoading(false);
        return e;
      }
    },
    [methodName],
  );

  return [call, { loading, result, error, called }];
};
