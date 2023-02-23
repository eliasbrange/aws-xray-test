import { DynamoDBStreamEvent, Context } from "aws-lambda";
import middy from "@middy/core";
import { tracer } from "@xray-test/core/tracer";
import { captureLambdaHandler } from "@aws-lambda-powertools/tracer";

export const lambdaHandler = async (
  _evt: DynamoDBStreamEvent,
  _context: Context
): Promise<void> => {
  console.log("Lambda G: ", _evt.Records[0].dynamodb?.NewImage?.type.S);
};

export const handler = middy(lambdaHandler).use(captureLambdaHandler(tracer));
