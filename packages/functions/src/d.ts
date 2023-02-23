import { SQSEvent, Context } from "aws-lambda";
import middy from "@middy/core";
import { EventBus } from "sst/node/event-bus";
import { tracer } from "@xray-test/core/tracer";
import { captureLambdaHandler } from "@aws-lambda-powertools/tracer";
import {
  EventBridgeClient,
  PutEventsCommand,
} from "@aws-sdk/client-eventbridge";

const eventBridgeClient = tracer.captureAWSv3Client(new EventBridgeClient({}));

export const lambdaHandler = async (
  _evt: SQSEvent,
  _context: Context
): Promise<void> => {
  const event = JSON.parse(_evt.Records[0].body);
  console.log("Lambda D: ", event.Message);

  await eventBridgeClient.send(
    new PutEventsCommand({
      Entries: [
        {
          EventBusName: EventBus.eventBus.eventBusName,
          Source: "xray-test",
          DetailType: "keso",
          Detail: JSON.stringify({
            type: event.Message,
          }),
        },
      ],
    })
  );
};

export const handler = middy(lambdaHandler).use(captureLambdaHandler(tracer));
