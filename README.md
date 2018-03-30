# dynaflow [![Build Status](https://travis-ci.com/VICEMedia/dynaflow.svg?token=qd2FYJp3BGYQ6KLVSLyw&branch=master)](https://travis-ci.com/VICEMedia/dynaflow) [![Coverage Status](https://coveralls.io/repos/github/VICEMedia/dynaflow/badge.svg?branch=master&t=u7GnyW)](https://coveralls.io/github/VICEMedia/dynaflow?branch=master)
For all your flow needs.

# API

## new Dynaflow(*options*)

Creates and returns a new client for DynamoDB. The given `options` are used directly by the [`aws-sdk`](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property).

### .query(*params*) -> *river*

Performs a [Query operation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#query-property) by passing the `params` to [ask-sdk](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#query-property), automatically paginating through each page in the result set. The returned [`river`](https://github.com/JoshuaWise/wise-river) contains each result object of each request made.

```js
const params = {
  TableName: 'MyTable',
  KeyConditionExpression: 'myPrimaryKey = :val',
  ExpressionAttributeValues: { ':val': { B: 'hZn6NqO18x8=' } },
  itemsOnly: true
};

db.query(params)
  .filter(validateItem)
  .map(transformItem)
  .forEach(logItem)
  .drain()
  .then(() => {
    console.log('all done!');
  });
```

If the `river` is rejected or cancelled, iterating will stop and no more requests will be made.

If the `itemsOnly` option is `true`, the `river` will contain each individual table item, rather than the entire result objects.

### .scan(*params*) -> *river*

Similar to [`.query()`](#queryparams---river), but performs a [Scan operation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#scan-property) instead.

### .listTables(*params*) -> *river*

Similar to [`.query()`](#queryparams---river), but performs a [ListTables operation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#listTables-property) instead.

### .listTagsOfResource(*params*) -> *river*

Similar to [`.query()`](#queryparams---river), but performs a [ListTagsOfResource operation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#listTagsOfResource-property) instead.

### .batchWriteItem(*requests*, [*params*]) -> *river*

Given a [`river`](https://github.com/JoshuaWise/wise-river) of [PutRequests](#new-putrequesttablename-item---putrequest) and [DeleteRequests](#new-deleterequesttablename-key---deleterequest), returns a `river` of *batch objects* for making batch requests to DynamoDB.

Each *batch object* has a `.send()` method for initiating a batch request, returning a promise for the request's result. Each result has (in addition to the fields returned by DynamoDB) a `count` field, indicating how many requests were successfully processed. If a request results in an error, the associated `Error` object will also have a `count` field, indicating how many requests failed.

```js
const requests = [new PutRequest(...), new DeleteRequest(...)];

db.batchWriteItem(River.from(requests))
  .map(batch => batch.send())
  .consume(({ count }) => {
    console.log(`Processed a batch of ${count} items!`);
  });
```

Each result object will always have an empty `UnprocessedItems` field, because this method automatically handles retries for you.

If the `timeout` option is given, incomming requests will not be buffered for longer than the specified number of milliseconds.

### .createTable(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#createTable-property).

### .updateTable(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#updateTable-property).

### .deleteTable(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#deleteTable-property).

### .getItem(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#getItem-property).

### .putItem(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#putItem-property).

### .updateItem(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#updateItem-property).

### .deleteItem(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#deleteItem-property).

### .describeTable(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#describeTable-property).

### .describeLimits(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#describeLimits-property).

### .describeTimeToLive(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#describeTimeToLive-property).

### .tagResource(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#tagResource-property).

### .untagResource(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#untagResource-property).

### .waitFor(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#waitFor-property).

### .updateTimeToLive(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#updateTimeToLive-property).

## new PutRequest(*tableName*, *item*) -> *PutRequest*

Creates and returns an object for making `Put` requests with [`.batchWriteItem()`](#batchwriteiteminput-params---river).

```js
const { PutRequest } = require('dynaflow');

const put = new PutRequest('MyTable', {
  myPrimaryKey: { B: 'hZn6NqO18x8=' },
  foo: { S: 'abc' },
  bar: { S: 'xyz' },
  baz: { N: '123' }
});
```

## new DeleteRequest(*tableName*, *key*) -> *DeleteRequest*

Creates and returns an object for making `Delete` requests with [`.batchWriteItem()`](#batchwriteiteminput-params---river).

```js
const { DeleteRequest } = require('dynaflow');

const del = new DeleteRequest('MyTable', {
  myPrimaryKey: { B: 'hZn6NqO18x8=' }
});
```
