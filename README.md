# dynaflow

For all your flow needs.

# API

## new Dynaflow(*options*)

Creates and returns a new client for DynamoDB. The given `options` are used directly by the [`aws-sdk`](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property).

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

### .query(*params*) -> *river*

Performs a [`Query` operation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#query-property) by passing the `params` to [ask-sdk](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#query-property), automatically paginating through each page in the result set. The returned [river](https://github.com/JoshuaWise/wise-river) contains each result object of each request.

If the river is rejected or cancelled, iterating will stop and no more requests will be made.

If the `itemsOnly` option is `true`, the river will contain each individual table item, rather than the entire result objects.

### .scan(*params*) -> *river*

Similar to [`.query()`](#queryparams---river), but performs a [`Scan` operation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#scan-property) instead.

### .listTables(*params*) -> *river*

Similar to [`.query()`](#queryparams---river), but performs a [`ListTables` operation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#listTables-property) instead.

### .listTagsOfResource(*params*) -> *river*

Similar to [`.query()`](#queryparams---river), but performs a [`ListTagsOfResource` operation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#listTagsOfResource-property) instead.

### .batchWriteItem(*input*, [*params*]) -> *river*

Given an `input` [river](https://github.com/JoshuaWise/wise-river) of [PutRequests](#new-dynaflowputrequesttablename-item---putrequest) and [DeleteRequests](#new-dynaflowdeleterequesttablename-key---deleterequest), returns a river of *batch objects* for making batched write requests to DynamoDB.

## new PutRequest(*tableName*, *item*) -> *PutRequest*

An object for making PUT requests with [`.batchWriteItem()`](#batchwriteiteminput-params---river).

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

An object for making DELETE requests with [`.batchWriteItem()`](#batchwriteiteminput-params---river).

```js
const { DeleteRequest } = require('dynaflow');
const del = new DeleteRequest('MyTable', {
  myPrimaryKey: { B: 'hZn6NqO18x8=' }
});
```
