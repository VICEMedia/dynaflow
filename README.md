<h1 align="center">Dynaflow</h1>
<div align="center">
  🐊
</div>
<div align="center">
  <strong>For all your flow needs</strong>
</div>
<div align="center">
  A module for creating dynamoDB oriented node applications
</div>

<br />

[![Build Status](https://travis-ci.com/VICEMedia/dynaflow.svg?token=qd2FYJp3BGYQ6KLVSLyw&branch=master)](https://travis-ci.com/VICEMedia/dynaflow) [![Coverage Status](https://coveralls.io/repos/github/VICEMedia/dynaflow/badge.svg?branch=master&t=u7GnyW)](https://coveralls.io/github/VICEMedia/dynaflow?branch=master)

## Table of Contents
- [Features](#features)
- [Example](#example)
- [Architecture](#architecture)
- [API](#api)
	- [Schema](#schema)
	- [Data](#data)
	- [Metadata](#metadata)
	- [Requests](#requests)

## Features
- __table schema management__
- __CRUD data operations__
- __tag and TTL metadata operations__

## Example
```bash
npm install dynaflow
```

```js
const db = new Dynaflow({
	//fill me in an options object
    });
    
db.createTable({
	//fill me in a params object
    });
    
db.putItem({
	//fill me in an item
    });

db.getItem({
	//fill me in params
    });
```

## Architecture
Dynaflow uses promises heavily.  In some cases, leverages a higher level promise paradigm referred to as a [`river`](https://github.com/JoshuaWise/wise-river).  The high level intention is to intelligently manage the common data flow operations in the framework.

## API

## Schema
### new Dynaflow(*options*)

Creates and returns a new client for DynamoDB. The given `options` are used directly by the [`aws-sdk`](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property).

### .listTables(*params*) -> *river*

Similar to [`.query()`](#queryparams---river), but performs a [ListTables operation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#listTables-property) instead.

### .createTable(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#createTable-property).

### .updateTable(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#updateTable-property).

### .deleteTable(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#deleteTable-property).

### .describeTable(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#describeTable-property).

## Data

### .getItem(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#getItem-property).

### .putItem(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#putItem-property).

### .updateItem(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#updateItem-property).

### .deleteItem(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#deleteItem-property).

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

## Metadata

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

### .listTagsOfResource(*params*) -> *river*

Similar to [`.query()`](#queryparams---river), but performs a [ListTagsOfResource operation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#listTagsOfResource-property) instead.

## Requests

### .batchWriteItem(*requests*, [*params*]) -> *river*

Given a [`river`](https://github.com/JoshuaWise/wise-river) of *request objects*, this method will group those requests into batches before sending them to DynamoDB. The returned `river` contains the results of each batch request that is sent.

A *request object* can be either:
* a [`PutItem`](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#putItem-property) request: `{ TableName, Item }` or
* a [`DeleteItem`](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#deleteItem-property) request: `{ TableName, Key }`

Each result object has (in addition to the fields returned by DynamoDB) a `Count` field, indicating how many requests were successfully processed. If a request results in an error, the associated `Error` object will also have a `Count` field, indicating how many requests failed.

```js
const requests = [
  { TableName: 'MyTable', Item: someData },
  { TableName: 'MyTable', Item: otherData },
];

db.batchWriteItem(River.from(requests))
  .consume(({ Count }) => {
    console.log(`Processed a batch of ${Count} items!`);
  });
```

Each result object will always have an empty `UnprocessedItems` field, because this method automatically handles retries for you.

If the `Timeout` option is given, incomming requests will not be buffered for longer than the specified number of milliseconds.

If the `Manual` option is `true`, the returned river will output the batch objects *without* sending them to DynamoDB. Each batch object has a `.send()` method which you MUST use to send execute the batch request, which returns a promise for the request's result.
