import { ValidatedMethod } from 'meteor/mdg:validated-method';

import { makeCreateSearchQuery } from '../users/server/utils';
import { checkPaginationParams } from '../utils';
import * as mixins from './mixins';

export const makePaginatedMethod = ({
  name = '',
  searchableFields = [],
  mixin = mixins.noOp,
  //   hooks = [],
  collection,
  fields = {},
  sort = {},
}) => {
  const methodName = name || `${collection._name}.search`;
  const createSearchQuery = makeCreateSearchQuery(searchableFields);

  return new ValidatedMethod({
    name: methodName,

    validate: checkPaginationParams.validator({ clean: true }),

    run: mixin(function ({ page = 1, itemPerPage = 10, search = '', ...rest }) {
      const query = createSearchQuery({ search });

      const total = collection.find(query).count();
      const data = collection
        .find(query, {
          sort,
          fields,
          limit: itemPerPage,
          skip: itemPerPage * (page - 1),
          ...rest,
        })
        .fetch();

      return { data, pageSize: itemPerPage, page, total };
    }),
  });
};
