import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_rds as rds } from "aws-cdk-lib";
import { aws_lambda_nodejs as lambdajs } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { aws_secretsmanager as secretsmanager } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";

export class CdkLambdaRdsLambda extends Stack {
  constructor(
    scope: Construct,
    id: string,
    vpc: ec2.IVpc,
    sm: secretsmanager.ISecret,
    props?: StackProps
  ) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkLambdaRdsQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
    const fn = new lambdajs.NodejsFunction(this, "NodeLambda", {
      entry: "src/lambda/mysqlclient/index.ts",
      handler: "handler",
      bundling: {
        sourcesContent: false,
        nodeModules: ["mysql2"],
        // externalModules: ["mysql2", "@types/mysql"],
      },
      timeout: cdk.Duration.minutes(3),
      vpc,
    });

    fn.addEnvironment("SECRETID", sm.secretArn);
    sm.grantRead(fn);

    new CfnOutput(this, "LambdaArn", {
      value: fn.functionArn,
    });
  }
}
