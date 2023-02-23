import { EventBridgeEvent, Context } from "aws-lambda";
import middy from "@middy/core";
import { tracer } from "@xray-test/core/tracer";
import { captureLambdaHandler } from "@aws-lambda-powertools/tracer";
import { SFNClient, StartExecutionCommand } from "@aws-sdk/client-sfn";

const sfnClient = tracer.captureAWSv3Client(new SFNClient({}));

interface Detail {
  type: string;
}

const STATE_MACHINE_ARN = process.env.STATE_MACHINE_ARN;

export const lambdaHandler = async (
  _evt: EventBridgeEvent<"Detail", Detail>,
  _context: Context
): Promise<void> => {
  console.log("Lambda E: ", _evt.detail.type);

  await sfnClient.send(
    new StartExecutionCommand({
      input: JSON.stringify(_evt.detail),
      stateMachineArn: STATE_MACHINE_ARN,
    })
  );
};

export const handler = middy(lambdaHandler).use(captureLambdaHandler(tracer));
