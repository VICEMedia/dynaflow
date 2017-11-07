# dynaflow

For all your flow needs.

# API

## new Dynaflow(*options*)

Creates and returns a new client for DynamoDB. The given `options` are used directly by the [`aws-sdk`](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#constructor-property).

### .createTable(*params*) -> promise

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#createTable-property).

### .updateTable(*params*) -> promise

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#updateTable-property).

### .deleteTable(*params*) -> promise

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#deleteTable-property).

### .getItem(*params*) -> promise

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#getItem-property).

### .putItem(*params*) -> promise

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#putItem-property).

### .updateItem(*params*) -> promise

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#updateItem-property).

### .deleteItem(*params*) -> promise

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#deleteItem-property).

### .describeTable(*params*) -> promise

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#describeTable-property).

### .describeLimits(*params*) -> promise

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#describeLimits-property).

### .describeTimeToLive(*params*) -> promise

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#describeTimeToLive-property).

### .tagResource(*params*) -> promise

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#tagResource-property).

### .untagResource(*params*) -> promise

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#untagResource-property).

### .waitFor(*params*) -> promise

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#waitFor-property).

### .updateTimeToLive(*params*) -> promise

A promisified version of the corresponding [`aws-sdk` method](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#updateTimeToLive-property).

### .scan(*params*) -> river

Performs a [`scan` operation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#scan-property) by passing the `params` to [ask-sdk](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#scan-property), automatically paginating through each page in the result set. The returned [river](https://github.com/JoshuaWise/wise-river) contains each result object of each request.

If the river is rejected or cancelled, iterating will stop and no more requests will be made.

If the `itemsOnly` option is `true`, the river will contain each individual table item, rather than the entire result objects.

### .query(*params*) -> river

Similar to [`.scan()`](#scanparams---river), but performs a [`query` operation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#query-property) instead.

### .listTables(*params*) -> river

Similar to [`.scan()`](#scanparams---river), but performs a [`listTables` operation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#listTables-property) instead.

### .listTagsOfResource(*params*) -> river

Similar to [`.scan()`](#scanparams---river), but performs a [`listTagsOfResource` operation](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#listTagsOfResource-property) instead.
