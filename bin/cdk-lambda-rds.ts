#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
//import { CdkLambdaRdsStack } from "../lib/cdk-lambda-rds-stack";

import { CdkLambdaRdsVpc } from "../lib/cdk-lambda-rds-vpc";
import { CdkLambdaRdsDatabase } from "../lib/cdk-lambda-rds-database";
import { CdkLambdaRdsLambda } from "../lib/cdk-lambda-rds-lambda";
import { CdkLambdaRdsConsole } from "../lib/cdk-lambda-rds-console";

const app = new cdk.App();
const Vpc = new CdkLambdaRdsVpc(app, "CdkLambdaRdsVpc", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const DB = new CdkLambdaRdsDatabase(app, "CdkLambdaRdsDatabase", Vpc.vpc, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const Console = new CdkLambdaRdsConsole(app, "CdkLambdaRdsConsole", Vpc.vpc, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

const Fn = new CdkLambdaRdsLambda(
  app,
  "CdkLambdaRdsLambda",
  Vpc.vpc,
  DB.secrets,
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: process.env.CDK_DEFAULT_REGION,
    },
  }
);
