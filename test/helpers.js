'use strict';

const Dynaflow = require('../');

const dynamoConfig = module.exports.dynamoConfig = {
  endpoint: process.env.DYNAMO_DB_ENDPOINT || 'http://127.0.0.1:8000',
  apiVersion: '2012-08-10',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'fake',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'fake',
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
};

const defaultDynaflow = module.exports.dynaflow = new Dynaflow(dynamoConfig);

// Returns a promise that resolves when the database has been cleared
module.exports.clearDatabase = (dynaflow = defaultDynaflow) => {
  return dynaflow.listTables({ itemsOnly: true }).consume(TableName => dynaflow.deleteTable({ TableName }));
};

// Returns a promise that resolves when the table has been created
module.exports.createTestingTable = ({
  dynaflow = defaultDynaflow,
  TableName = 'testing',
  primaryId = 'id',
  orderField = 'timestamp',
} = {}) => {
  return dynaflow.createTable({
    TableName,
    AttributeDefinitions: [
      {
        AttributeName: primaryId,
        AttributeType: 'S',
      },
      {
        AttributeName: orderField,
        AttributeType: 'N',
      },
    ],
    KeySchema: [
      {
        AttributeName: primaryId,
        KeyType: 'HASH',
      },
      {
        AttributeName: orderField,
        KeyType: 'RANGE',
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 1,
      WriteCapacityUnits: 1,
    },
  });
};

module.exports.range = i => Array.from(Array(i).keys());
