#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ComputeStack } from '../cdk/ComputeStack';
import { APP_NAME, RESOURCE_DEPLOYMENT_REGION, ACCOUNT_ID, HOSTED_ZONE_NAME } from "../cdk/configuration";
import StaticObjectStorageStack from "../cdk/StaticObjectStorageStack";

const app = new cdk.App();
new ComputeStack(app, `${APP_NAME}-Infrastructure`, {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  env: { account: ACCOUNT_ID, region: RESOURCE_DEPLOYMENT_REGION },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

new StaticObjectStorageStack(app, `${APP_NAME}-StaticAssets`, {
  env: { account: ACCOUNT_ID, region: 'us-east-1' },
  hostedZoneName: HOSTED_ZONE_NAME,
  domainPrefix: 'assets',
  bucketName: `${APP_NAME.toLowerCase()}-static-assets-bucket-${ACCOUNT_ID}`
});
