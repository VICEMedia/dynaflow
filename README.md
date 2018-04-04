<h1 align="center">Dynaflow</h1>
<div align="center">
  🐊
</div>
<div align="center">
  <strong>For all your flow needs</strong>
</div>
<div align="center">
  A high-level driver for using DynamoDB in NodeJS
</div>

<br />

[![Build Status](https://travis-ci.com/VICEMedia/dynaflow.svg?token=qd2FYJp3BGYQ6KLVSLyw&branch=master)](https://travis-ci.com/VICEMedia/dynaflow) [![Coverage Status](https://coveralls.io/repos/github/VICEMedia/dynaflow/badge.svg?branch=master&t=u7GnyW)](https://coveralls.io/github/VICEMedia/dynaflow?branch=master)

## Table of Contents
- [Features](#features)
- [Example](#example)
- [Architecture](#architecture)
- [API](#api)
  - [Reading](#reading)
  - [Writing](#writing)
  - [Schema](#reading)
	- [Metadata](#metadata)

## Features
- Perform all standard DynamoDB operations
- Automatic pagination
- Batch write streams

## Example
```bash
npm install dynaflow
```

```js
const db = new Dynaflow({ region: 'us-east-1' });
    
await db.createTable({
  TableName: 'MyTable',
  AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'N' }],
  KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
});
    
await db.putItem({
  TableName: 'MyTable',
  Item: {
    id: { N: 1 },
    someValue: { S: 'hello world' },
  },
});

const response = await db.getItem({
  TableName: 'MyTable',
  Key: {
    id: { N: 1 },
  },
});

assert(response.Item.someValue.S === 'hello world');
```

## Architecture
Dynaflow uses promises heavily. In some cases, it leverages a higher level promise paradigm referred to as a [`river`](https://github.com/JoshuaWise/wise-river).

### Rivers
In JavaScript, you might be familiar with the use of promises to deal with asynchronous events. A promise represents a single event — but what if we want to represent many events happening over time? This is what Rivers are for. Rivers are composable object streams (similar to ReactiveX Observables) that fit very nicely into the JavaScript ecosystem. Check out the [`wise-river`](https://github.com/JoshuaWise/wise-river) page to learn more about why they’re more powerful than traditional streams.

Normally, when you query DynamoDB it responds with data broken up into pages. They do this for good reason, but typically in our applications we’d rather deal with the query results as if it were an iterable, or a stream of objects. Using Rivers, you can `.map()`, `.filter()`, and `.reduce()` over the results without dealing with pagination logic. It will automatically fetch new pages until you’re done using the river chain, at which point it will stop automatically.

The most powerful use of Rivers in `dynaflow` is to provide an abstraction for DynamoDB’s [batch write](#requests) functionality. DynamoDB supports batch requests, allowing you to put and delete items in different tables at the same time, which is useful for saving bandwidth. Normally, this is a complicated process involving “partial errors,” “retries,” and more. But with `dynaflow`, you can easily create a bandwidth-efficient firehose by just writing objects to a river — the complicated logic is handled for you, so you can easily operate on the results as they occur.

## API

### new Dynaflow(*options*)

Creates and returns a new client for DynamoDB. The given `options` are used directly by the [`aws-sdk`](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property).

## Reading

### .query(*params*) -> *river*

Performs a [Query operation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#query-property) by passing the `params` to [ask-sdk](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#query-property), automatically paginating through each page in the result set. The returned [`river`](https://github.com/JoshuaWise/wise-river) contains each result object of each request made.

```js
const params = {
  TableName: 'MyTable',
  KeyConditionExpression: 'myPrimaryKey = :val',
  ExpressionAttributeValues: { ':val': { B: 'hZn6NqO18x8=' } },
  ItemsOnly: true,
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

If the `ItemsOnly` option is `true`, the `river` will contain each individual table item, rather than the entire result objects.

<details><summary>Other methods of reading data</summary>

### .scan(*params*) -> *river*

Similar to [`.query()`](#queryparams---river), but performs a [Scan operation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#scan-property) instead.

### .getItem(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#getItem-property).

</details>

## Writing

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

<details><summary>Other methods of writing data</summary>

### .putItem(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#putItem-property).

### .updateItem(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#updateItem-property).

### .deleteItem(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#deleteItem-property).

</details>

## Schema

<details><summary>Schema related methods</summary>

### .createTable(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#createTable-property).

### .updateTable(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#updateTable-property).

### .deleteTable(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#deleteTable-property).

### .describeTable(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#describeTable-property).

### .listTables(*params*) -> *river*

Similar to [`.query()`](#queryparams---river), but performs a [ListTables operation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#listTables-property) instead.

</details>

## Metadata

<details><summary>Metadata related methods</summary>

### .describeLimits(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#describeLimits-property).

### .describeTimeToLive(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#describeTimeToLive-property).

### .listTagsOfResource(*params*) -> *river*

Similar to [`.query()`](#queryparams---river), but performs a [ListTagsOfResource operation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#listTagsOfResource-property) instead.

### .tagResource(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#tagResource-property).

### .untagResource(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#untagResource-property).

### .waitFor(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#waitFor-property).

### .updateTimeToLive(*params*) -> *promise*

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#updateTimeToLive-property).

</details>
