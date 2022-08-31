// Put your app name here. For example if you're building Acme Co's Centralized User Data Service codenamed Logos,
// which will at run on logos.acmecorp.com, you might put LogosService here. This string is used all over the place
// to identify your cfn resources. Must contain only alphanumeric characters.
export const APP_NAME = 'MyApp';

// In keeping with the example above, this is a hosted zone that owns acmecorp.com
export const HOSTED_ZONE_ID = 'Z31Bxxxxxxx7L0';
export const HOSTED_ZONE_NAME = 'swolebrain.com';
export const STAGING_SUBDOMAIN = 'staging-api';
export const PROD_SUBDOMAIN = 'api';

// Some resources (eg ACM certs) are deployed to a specific region even if the CDK deployment is running in its own
// region. That's what this string is for
export const RESOURCE_DEPLOYMENT_REGION = 'us-east-2';