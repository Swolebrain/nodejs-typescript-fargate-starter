import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ConfiguredFargateLoadBalancedApplicationWithSSL } from "./ConfiguredFargateLoadBalancedApplicationWithSSL";
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
import setupCodeBuild from "./setupCodeBuild";
import setupPipeline from "./setupPipeline";


export class ComputeStack extends cdk.Stack {
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

    const fargateAppStaging = new ConfiguredFargateLoadBalancedApplicationWithSSL(this, `${APP_NAME}-staging`, {
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

    const fargateAppProd = new ConfiguredFargateLoadBalancedApplicationWithSSL(this, `${APP_NAME}-prod`, {
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

    const {codebuildProject} = setupCodeBuild(this, fargateAppStaging.cluster, fargateAppProd.cluster);

    setupPipeline(this, codebuildProject, fargateAppStaging.fargateService.service, fargateAppProd.fargateService.service);
  };
}
