'use strict';
const Promise = require('wise-promise');
const River = require('wise-river');
const nextTick = Promise.promisify(process.nextTick);

/*
  These methods are ones whose results may be paginated by DynamoDB. To provide
  a simple interface for retrieving the pages, each of these methods returns a
  river containing each page of the entire result set. Iterating through the
  result set will stop if the river is cancelled or rejected.
  If `params.itemsOnly` is set to `true`, the river will contain each individual
  item, rather than the entire result objects.
 */

module.exports = dynaflow => Object.assign(dynaflow, {
  scan: wrap(dynaflow.db.scan, 'LastEvaluatedKey', 'ExclusiveStartKey', 'Items'),
  query: wrap(dynaflow.db.query, 'LastEvaluatedKey', 'ExclusiveStartKey', 'Items'),
  listTables: wrap(dynaflow.db.listTables, 'LastEvaluatedTableName', 'ExclusiveStartTableName', 'TableNames'),
  listTagsOfResource: wrap(dynaflow.db.listTagsOfResource, 'NextToken', 'NextToken', 'Tags'),
});

const wrap = (method, lastPage, nextPage, itemList) => {
  const wrapped = paginated(Promise.promisify(method), lastPage, nextPage, itemList);
  Object.defineProperty(wrapped, 'name', { configurable: true, value: method.name });
  return wrapped;
};

const paginated = (method, lastPage, nextPage, itemList) => function paginatedMethod(params) {
  return new River((resolve, reject, write, free) => {
    let op = method;
    free(() => { op = undefined; });
    params = Object.assign({}, params);

    const itemsOnly = !!params.itemsOnly;
    const readPage = () => nextTick()
      .then(() => op && op.call(this.db, params)
        .then((result) => {
          if (itemsOnly) for (const item of result[itemList]) write(item);
          else write(result);
          if (!result[lastPage]) return;
          params[nextPage] = result[lastPage];
          return readPage();
        })
      );

    readPage().then(resolve, reject);
  });
};
