import { SQSEvent, Context } from "aws-lambda";
import { Topic } from "sst/node/topic";
import middy from "@middy/core";
import { tracer } from "@xray-test/core/tracer";
import { captureLambdaHandler } from "@aws-lambda-powertools/tracer";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = tracer.captureAWSv3Client(new SNSClient({}));

export const lambdaHandler = async (
  _evt: SQSEvent,
  _context: Context
): Promise<void> => {
  console.log("Lambda B: ", _evt.Records[0].body);

  await snsClient.send(
    new PublishCommand({
      Message: _evt.Records[0].body,
      Subject: "xray-test",
      TopicArn: Topic.topicA.topicArn,
    })
  );
};

export const handler = middy(lambdaHandler).use(captureLambdaHandler(tracer));
