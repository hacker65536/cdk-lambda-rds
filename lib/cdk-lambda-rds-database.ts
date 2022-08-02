import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_rds as rds } from "aws-cdk-lib";
import { aws_lambda as lambda } from "aws-cdk-lib";
import { aws_iam as iam } from "aws-cdk-lib";
import { aws_secretsmanager as secretsmanager } from "aws-cdk-lib";
import { custom_resources as cr } from "aws-cdk-lib";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";

export class CdkLambdaRdsDatabase extends Stack {
  public secrets: secretsmanager.ISecret;
  constructor(scope: Construct, id: string, vpc: ec2.IVpc, props?: StackProps) {
    super(scope, id, props);

    enum ServerlessInstanceType {
      SERVERLESS = "serverless",
    }

    type CustomInstanceType = ServerlessInstanceType | ec2.InstanceType;

    const CustomInstanceType = {
      ...ServerlessInstanceType,
      ...ec2.InstanceType,
    };

    const dbClusterInstanceCount: number = 1;

    const dbCluster = new rds.DatabaseCluster(this, "AuroraServerlessv2", {
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_3_02_0,
      }),
      instances: dbClusterInstanceCount,
      instanceProps: { vpc },
      monitoringInterval: cdk.Duration.seconds(10),
    });

    dbCluster.connections.allowInternally(ec2.Port.tcp(3306));
    dbCluster.connections.allowFrom(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(3306)
    );

    const serverlessV2ScalingConfiguration = {
      MinCapacity: 0.5,
      MaxCapacity: 16,
    };

    const dbScalingConfigure = new cr.AwsCustomResource(
      this,
      "DbScalingConfigure",
      {
        onCreate: {
          service: "RDS",
          action: "modifyDBCluster",
          parameters: {
            DBClusterIdentifier: dbCluster.clusterIdentifier,
            ServerlessV2ScalingConfiguration: serverlessV2ScalingConfiguration,
          },
          physicalResourceId: cr.PhysicalResourceId.of(
            dbCluster.clusterIdentifier
          ),
        },
        onUpdate: {
          service: "RDS",
          action: "modifyDBCluster",
          parameters: {
            DBClusterIdentifier: dbCluster.clusterIdentifier,
            ServerlessV2ScalingConfiguration: serverlessV2ScalingConfiguration,
          },
          physicalResourceId: cr.PhysicalResourceId.of(
            dbCluster.clusterIdentifier
          ),
        },
        policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
          resources: cr.AwsCustomResourcePolicy.ANY_RESOURCE,
        }),
      }
    );

    const cfnDbCluster = dbCluster.node.defaultChild as rds.CfnDBCluster;
    const dbScalingConfigureTarget = dbScalingConfigure.node.findChild(
      "Resource"
    ).node.defaultChild as cdk.CfnResource;

    cfnDbCluster.addPropertyOverride("EngineMode", "provisioned");
    dbScalingConfigure.node.addDependency(cfnDbCluster);

    dbScalingConfigureTarget.node.addDependency(dbScalingConfigure);

    for (let i = 1; i <= dbClusterInstanceCount; i++) {
      (
        dbCluster.node.findChild(`Instance${i}`) as rds.CfnDBInstance
      ).addDependsOn(dbScalingConfigureTarget);
    }

    this.secrets = dbCluster.secret!;

    new cdk.CfnOutput(this, "rdspass", {
      value: dbCluster.secret?.secretArn!,
    });
  }
}
