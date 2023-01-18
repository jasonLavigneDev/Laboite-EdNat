import { useState, useEffect } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import validate from 'validate.js';

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

// easy to manage complex state like in react Class
export const useObjectState = (initialState) => {
  const [state, setState] = useState(initialState);

  const updateState = (args) =>
    setState((previousState) => ({
      ...previousState,
      ...args,
    }));

  return [state, updateState];
};

export const useOnScreen = (ref, rootMargin = '0px') => {
  // State and setter for storing whether element is visible
  const [isIntersecting, setIntersecting] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update our state when observer callback fires
        setIntersecting(entry.isIntersecting);
      },
      {
        rootMargin,
      },
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      observer.unobserve(ref.current);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return isIntersecting;
};

function getSize() {
  return {
    width: Meteor.isClient ? window.innerWidth : undefined,
    height: Meteor.isClient ? window.innerHeight : undefined,
  };
}

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState(getSize);

  useEffect(() => {
    if (!Meteor.isClient) {
      return false;
    }

    const handleResize = () => {
      setWindowSize(getSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return windowSize;
};

export const useBoolean = (defaultBoolean = false) => {
  const [state, setState] = useState(defaultBoolean);
  const toggle = () => setState(!state);
  return [state, toggle, setState];
};

validate.options = {
  fullMessages: false,
};

export const useFormStateValidator = (formSchema) => {
  const [formState, setFormState] = useState({
    isValid: false,
    values: {},
    touched: {},
    errors: {},
  });
  useEffect(() => {
    const errors = validate(formState.values, formSchema);

    setFormState(() => ({
      ...formState,
      isValid: !errors,
      errors: errors || {},
    }));
  }, [formState.values]);

  const handleChange = (event) => {
    const isSyntheticBaseEvent = event.constructor.name === 'SyntheticBaseEvent';

    // Check is is synthetic base event to persist it, since it does not exist on `PointerEvent`
    // https://reactjs.org/docs/events.html
    if (isSyntheticBaseEvent) event.persist();

    setFormState(() => ({
      ...formState,
      values: {
        ...formState.values,
        [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
      },
      touched: {
        ...formState.touched,
        [event.target.name]: true,
      },
    }));
  };

  return [formState, handleChange, setFormState];
};

export const forkRef =
  (...refs) =>
  (node) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') ref(node);
      // eslint-disable-next-line no-param-reassign
      else if (ref) ref.current = node;
    });
  };
