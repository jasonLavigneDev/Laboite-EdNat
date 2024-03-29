import { useCallback, useState, useRef, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import debounce from 'lodash.debounce';
import { callMethod as callAsyncMethod } from '../helpers/helpers.meteor';

export const usePagination = (subName, args = {}, Collection, query = {}, options = {}, itemPerPage, deps = []) => {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const subscription = useTracker(() =>
    Meteor.subscribe(
      subName,
      { ...args, page, itemPerPage },
      {
        onStop: (err) => {
          if (err) {
            if (err.error === 'validation-error')
              err.details.forEach((detail) => console.log(`Subscribe ${subName}: ${detail.message}`));
            else console.log(`Subscribe ${subName}: ${err.reason || err.message}`);
          }
        },
      },
    ),
  );
  const loading = useTracker(() => !subscription.ready());

  const itemsTrackerDeps = [page, loading, total];
  if (deps.length > 0) itemsTrackerDeps.push(...deps);

  const items = useTracker(
    () => Collection.findFromPublication(subName, query, { ...options, limit: itemPerPage }).fetch(),
    itemsTrackerDeps,
  );

  useEffect(() => {
    Meteor.call(`get_${subName}_count`, args, (error, result) => setTotal(result));
  }, [page, args]);

  const nextPage = () => setPage(page + 1);
  const previousPage = () => setPage(page - 1);
  const changePage = (newPage) => setPage(newPage);

  return {
    page,
    nextPage,
    previousPage,
    changePage,
    loading,
    items,
    total,
  };
};

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
    (...args) => {
      if (!called) {
        setCalled(true);
      }

      setLoading(true);

      const promise = callAsyncMethod(methodName, ...args).then((callResult) => {
        setResult(callResult);
        setError(null);
        setLoading(false);

        return callResult;
      });

      promise.catch((err) => {
        setResult(null);
        setError(err);
        setLoading(false);
      });

      return promise;
    },
    [methodName],
  );

  return [call, { loading, result, error, called }];
};

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_PAGE = 1;

/**
 * React hooks that lazily calls a Meteor method, and an object that contains both the result and metadata of the
 * method call, and some helper functions to navigate through the result
 * @param methodName - the name of the method to call
 * @param defaultOptions @optional { defaultpageSize: int = 10, defaultPage: int = 1 }
 */
export const usePaginatedMethod = (
  methodName,
  { pageSize: defaultpageSize = DEFAULT_PAGE_SIZE, defaultPage = DEFAULT_PAGE } = {},
) => {
  const [callMethod, meta] = useMethod(methodName);
  const [page, setPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(defaultpageSize);
  const [total, setTotal] = useState(0);
  const [nbPage, setNbPage] = useState(0);
  const lastSearchRef = useRef(null);
  const lastOtherArgs = useRef({});

  // Paginated methods should always return { data: any[], total: int, page: int, pageSize: int, nbPage: int}
  const call = useCallback(
    debounce(async (search, otherArguments = {}) => {
      lastSearchRef.current = search;
      lastOtherArgs.current = otherArguments;

      return callMethod({ search, page, itemPerPage: pageSize, ...otherArguments }).then((result) => {
        const res = {
          pageSize: result.pageSize,
          page: result.page,
          nbPage: Math.ceil(result.total / result.pageSize),
          total: result.total,
          data: result.data,
        };
        setPageSize(res.pageSize);
        if (res.nbPage < res.page) setPage(1);
        else setPage(res.page);
        setTotal(res.total);
        setNbPage(res.nbPage);

        return res;
      });
    }, 500),
    [page, pageSize],
  );

  const { current: changePage } = useRef(async (modifier, isDirect = false) => {
    setPage(
      (currentpage) =>
        isDirect // if is direct page number to access
          ? modifier // go to page
          : modifier > 0 // else if going next N page
          ? meta?.result.nbPages >= currentpage + modifier // and if not going above last page
          : currentpage + modifier // then add N to current page
          ? currentpage + modifier < 1 // else if going below first page
          : currentpage, // then stay on current page,
    );
  });

  const goToNextPage = useCallback(() => changePage(1), []);
  const goToPreviousPage = useCallback(() => changePage(-1), []);
  const goToPage = useCallback((targetPage) => changePage(targetPage, true), []);

  useEffect(async () => {
    if (meta.called) {
      await call(lastSearchRef.current, lastOtherArgs.current);
    }
  }, [pageSize, page]);

  return [
    call,
    {
      page,
      nbPage,
      total,
      goToPage,
      goToNextPage,
      goToPreviousPage,
      data: meta.result?.data,
      loading: meta.loading,
      called: meta.called,
    },
  ];
};
