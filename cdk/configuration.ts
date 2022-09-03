// Put your app name here. For example if you're building Acme Co's Centralized User Data Service codenamed Logos,
// which will at run on logos.acmecorp.com, you might put LogosService here. This string is used all over the place
// to identify your cfn resources. Must contain only alphanumeric characters.
import * as iam from "aws-cdk-lib/aws-iam";

export const APP_NAME = 'KratosService';
export const ACCOUNT_ID = 'xxxxxxxxx';

// In keeping with the example above, this is a hosted zone that owns acmecorp.com
export const HOSTED_ZONE_ID = 'xxxxxxx';
export const HOSTED_ZONE_NAME = 'xx.com';
export const STAGING_SUBDOMAIN = 'staging-api';
export const PROD_SUBDOMAIN = 'api';

// This region controls where your CDK resources are created and also separately controls where the ACM cert gets created.
export const RESOURCE_DEPLOYMENT_REGION = 'us-east-2'; // or chosen region from step 5

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