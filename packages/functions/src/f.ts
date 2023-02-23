import { Context } from "aws-lambda";
import middy from "@middy/core";
import { tracer } from "@xray-test/core/tracer";
import { Table } from "sst/node/table";
import { captureLambdaHandler } from "@aws-lambda-powertools/tracer";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const dynamoClient = tracer.captureAWSv3Client(
  DynamoDBDocument.from(new DynamoDBClient({}))
);

interface Detail {
  type: string;
}

export const lambdaHandler = async (
  _evt: Detail,
  _context: Context
): Promise<void> => {
  console.log("Lambda F: ", _evt.type);

  await dynamoClient.put({
    TableName: Table.table.tableName,
    Item: {
      id: uuidv4(),
      type: _evt.type,
    },
  });
};

export const handler = middy(lambdaHandler).use(captureLambdaHandler(tracer));
