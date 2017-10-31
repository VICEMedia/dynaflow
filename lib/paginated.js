'use strict';
const Promise = require('wise-promise');
const River = require('wise-river');
const nextTick = Promise.promisify(process.nextTick);

/*
  These methods are ones whose results may be paginated by DynamoDB. To provide
  a simple interface for retrieving the pages, each of these methods returns a
  river containing each page of the entire result set. Iterating through the
  result set will stop if the river is cancelled or rejected.
 */

module.exports = dynaflow => Object.assign(dynaflow, {
  scan: wrap(dynaflow.db.scan, 'LastEvaluatedKey', 'ExclusiveStartKey'),
  query: wrap(dynaflow.db.query, 'LastEvaluatedKey', 'ExclusiveStartKey'),
  listTables: wrap(dynaflow.db.listTables, 'LastEvaluatedTableName', 'ExclusiveStartTableName'),
  listTagsOfResource: wrap(dynaflow.db.listTagsOfResource, 'NextToken', 'NextToken'),
});

const wrap = (method, lastPage, nextPage) => {
  const wrapped = paginated(Promise.promisify(method), lastPage, nextPage);
  Object.defineProperty(wrapped, 'name', { configurable: true, value: method.name });
  return wrapped;
};

const paginated = (method, lastPage, nextPage) => function paginatedMethod(params) {
  return new River((resolve, reject, write, free) => {
    let op = method;
    free(() => { op = undefined; });
    params = Object.assign({}, params);

    const readPage = () => nextTick()
      .then(() => op && op.call(this.db, params)
        .then((result) => {
          write(result);
          if (!result[lastPage]) return;
          params[nextPage] = result[lastPage];
          return readPage();
        })
      );

    readPage().then(resolve, reject);
  });
};
