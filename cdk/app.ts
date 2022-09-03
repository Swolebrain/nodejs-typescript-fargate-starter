import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FargateService } from "./FargateService";
import {
  APP_NAME,
  HOSTED_ZONE_ID,
  HOSTED_ZONE_NAME, PROD_SUBDOMAIN,
  RESOURCE_DEPLOYMENT_REGION,
  STAGING_SUBDOMAIN, taskExecutionIamPoliciesJSON
} from "./configuration";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import * as iam from "aws-cdk-lib/aws-iam";


export class App extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hostedZone = HostedZone.fromHostedZoneAttributes(this, `cdkid-${HOSTED_ZONE_ID}`, {
      zoneName: HOSTED_ZONE_NAME,
      hostedZoneId: HOSTED_ZONE_ID
    });

    const certificate = new DnsValidatedCertificate(this, `${APP_NAME}-ACM-Certificate`, {
      domainName: `*.${HOSTED_ZONE_NAME}`,
      hostedZone: hostedZone,
      region: RESOURCE_DEPLOYMENT_REGION
    });

    const executionRolePolicy =  new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ]
    });

    const taskRolePolicies = taskExecutionIamPoliciesJSON.map((policyJson) =>
        new iam.PolicyStatement(policyJson)
    );

    const ecsClusterStaging = new FargateService(this, `${APP_NAME}-cluster-staging`, {
      appEnv: '',
      desiredCount: 1,
      deploymentEnv: 'staging',
      hostedZone,
      certificate,
      maxCapacity: 1,
      subDomain: STAGING_SUBDOMAIN,
      executionRolePolicy,
      taskRolePolicies
    });

    const ecsClusterProd = new FargateService(this, `${APP_NAME}-cluster-prod`, {
      appEnv: '',
      desiredCount: 1,
      deploymentEnv: 'prod',
      hostedZone,
      certificate,
      maxCapacity: 2,
      subDomain: PROD_SUBDOMAIN,
      executionRolePolicy,
      taskRolePolicies
    });
  };
}
