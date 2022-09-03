// Put your app name here. For example if you're building Acme Co's Centralized User Data Service codenamed Logos,
// which will at run on logos.acmecorp.com, you might put LogosService here. This string is used all over the place
// to identify your cfn resources. Must contain only alphanumeric characters.
import * as iam from "aws-cdk-lib/aws-iam";

// These settings MUST change
export const ACCOUNT_ID = '891672395302';
export const HOSTED_ZONE_ID = 'Z31BB1JUPLX7L0';
export const HOSTED_ZONE_NAME = 'swolebrain.com';
export const GH_USERNAME = 'swolebrain';
export const GH_REPO_NAME = 'nodejs-typescript-fargate-starter'; // repo name under YOUR account

/**
 * Settings below here don't have to change, but you might want to
 */
export const APP_NAME = 'KratosService';
export const GH_BRANCH = 'main';
export const STAGING_SUBDOMAIN = 'staging-api';
export const PROD_SUBDOMAIN = 'api';
// This region controls where your CDK resources are created and also separately controls where the ACM cert gets created.
export const RESOURCE_DEPLOYMENT_REGION = 'us-east-2'; // or chosen region from step 5

// permissions your fargate task will have
export const taskExecutionIamPoliciesJSON = [
    {
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
    }
];