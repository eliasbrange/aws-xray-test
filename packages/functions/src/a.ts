import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { ApiHandler } from "sst/node/api";
import { Queue } from "sst/node/queue";
import middy from "@middy/core";
import { tracer } from "@xray-test/core/tracer";
import { captureLambdaHandler } from "@aws-lambda-powertools/tracer";

const sqsClient = tracer.captureAWSv3Client(new SQSClient({}));

const lambdaHandler = ApiHandler(async (_evt) => {
  console.log("Lambda A");

  await sqsClient.send(
    new SendMessageCommand({
      MessageBody: "keso",
      QueueUrl: Queue.queueA.queueUrl,
    })
  );

  return {
    body: "Message queued",
  };
});

export const handler = middy(lambdaHandler).use(
  captureLambdaHandler(tracer, { captureResponse: true })
);
