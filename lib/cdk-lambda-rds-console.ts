import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_rds as rds } from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { aws_secretsmanager as secretsmanager } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkLambdaRdsConsole extends Stack {
  constructor(scope: Construct, id: string, vpc: ec2.IVpc, props?: StackProps) {
    super(scope, id, props);

    const console = new ec2.Instance(this, "Console", {
      vpc,
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        storage: ec2.AmazonLinuxStorage.GENERAL_PURPOSE,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.C6A,
        ec2.InstanceSize.LARGE
      ),
    });

    const policies: string[] = [
      "AmazonSSMManagedInstanceCore",
      //"service-role/AmazonEC2RoleforSSM"
    ];

    for (let v of policies) {
      console.role.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName(v)
      );
    }
  }
}
