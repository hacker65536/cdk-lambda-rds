import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_ec2 as ec2 } from "aws-cdk-lib";

export class CdkLambdaRdsVpc extends Stack {
  public vpc: ec2.IVpc;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 2,
    });

    this.vpc.addInterfaceEndpoint("VpcEndpointSecretsManager", {
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
    });
  }
}
