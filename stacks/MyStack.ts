import { CfnTopic } from "aws-cdk-lib/aws-sns";
import { StateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import {
  StackContext,
  ApiGatewayV1Api,
  Queue,
  Topic,
  EventBus,
  Table,
  Function,
} from "sst/constructs";

export function API({ stack }: StackContext) {
  const funcA = new Function(stack, "funcA", {
    handler: "packages/functions/src/a.handler",
  });
  const funcB = new Function(stack, "funcB", {
    handler: "packages/functions/src/b.handler",
  });
  const funcC = new Function(stack, "funcC", {
    handler: "packages/functions/src/c.handler",
  });
  const funcD = new Function(stack, "funcD", {
    handler: "packages/functions/src/d.handler",
  });
  const funcE = new Function(stack, "funcE", {
    handler: "packages/functions/src/e.handler",
  });
  const funcF = new Function(stack, "funcF", {
    handler: "packages/functions/src/f.handler",
  });
  const funcG = new Function(stack, "funcG", {
    handler: "packages/functions/src/g.handler",
  });

  const queueA = new Queue(stack, "queueA");
  const queueB = new Queue(stack, "queueB");

  const topicA = new Topic(stack, "topicA");
  const cfnTopicA = topicA.cdk.topic.node.defaultChild as CfnTopic;
  cfnTopicA.addPropertyOverride("TracingConfig", "Active");
  const topicB = new Topic(stack, "topicB");
  const cfnTopicB = topicB.cdk.topic.node.defaultChild as CfnTopic;
  cfnTopicB.addPropertyOverride("TracingConfig", "Active");

  const eventBus = new EventBus(stack, "eventBus");

  const table = new Table(stack, "table", {
    fields: {
      id: "string",
    },
    primaryIndex: { partitionKey: "id" },
    stream: "new_and_old_images",
  });

  const stateMachine = new StateMachine(stack, "stateMachine", {
    definition: new LambdaInvoke(stack, "funcFTask", {
      lambdaFunction: funcF,
      outputPath: "$.Payload",
    }),
    tracingEnabled: true,
  });
  stateMachine.grantStartExecution(funcE);

  const api = new ApiGatewayV1Api(stack, "api");

  // API -> funcA -> queueA -> funcB -> topicA -> funcC -> topicB -> queueB -> funcD -> eventBus -> funcE -> stepFunction -> funcF -> dynamo -> funcG
  api.addRoutes(stack, {
    "GET /": funcA,
  });
  funcA.bind([queueA]);

  queueA.addConsumer(stack, funcB);
  funcB.bind([topicA]);

  topicA.addSubscribers(stack, {
    funcC,
  });
  funcC.bind([topicB]);

  topicB.addSubscribers(stack, {
    queueB,
  });
  queueB.addConsumer(stack, funcD);
  funcD.bind([eventBus]);

  eventBus.addRules(stack, {
    funcERule: {
      pattern: {
        source: ["xray-test"],
        detailType: ["keso"],
      },
      targets: {
        funcE: funcE,
      },
    },
  });

  funcE.addEnvironment("STATE_MACHINE_ARN", stateMachine.stateMachineArn);

  funcF.bind([table]);

  table.addConsumers(stack, {
    funcG: funcG,
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
