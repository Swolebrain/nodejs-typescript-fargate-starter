import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApplicationEcsCluster } from "./ApplicationEcsCluster";
import {
  APP_NAME,
  HOSTED_ZONE_ID,
  HOSTED_ZONE_NAME, PROD_SUBDOMAIN,
  RESOURCE_DEPLOYMENT_REGION,
  STAGING_SUBDOMAIN
} from "./configuration";
import { HostedZone } from "aws-cdk-lib/aws-route53";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";


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

    const ecsClusterStaging = new ApplicationEcsCluster(this, `${APP_NAME}-cluster-staging`, {
      appEnv: '',
      desiredCount: 1,
      deploymentEnv: 'staging',
      hostedZone,
      certificate,
      maxCapacity: 1,
      subDomain: STAGING_SUBDOMAIN
    });

    const ecsClusterProd = new ApplicationEcsCluster(this, `${APP_NAME}-cluster-prod`, {
      appEnv: '',
      desiredCount: 1,
      deploymentEnv: 'prod',
      hostedZone,
      certificate,
      maxCapacity: 2,
      subDomain: PROD_SUBDOMAIN
    });
  };
}
