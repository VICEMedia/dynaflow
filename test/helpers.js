'use strict';

module.exports.dynamoConfig = {
  endpoint: process.env.DYNAMO_DB_ENDPOINT || 'http://127.0.0.1:8000',
  apiVersion: '2012-08-10',
  sslEnabled: true,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'fake',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'fake',
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
};
