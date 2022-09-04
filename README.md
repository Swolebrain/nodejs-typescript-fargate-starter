# nodejs-typescript-fargate-starter

This repo deploys a dockerized nodejs app using cdk.

It uses ECS fargate and deploys 2 environments - one prod and one staging.

It also sets up a pipeline with a codedeploy job to deploy code to ECR and then trigger a new ECS deployment.

Promotion to prod is manual but you can change that in the pipeline.ts file.

### If you change the underlying image and want to trigger manual deployment

aws ecs update-service --cluster MyApp-Infrastructure-MyAppclusterstagingClusterstagingDDA3CFDA-7wINQdbGlXCQ --service MyApp-Infrastructure-MyAppclusterstagingServicestagingService12E2202D-o7iUxNS5nN0D --force-new-deployment --region us-east-2

This will deploy the original image of your nodejs app, whatever you created the ecs cluster with, if you didn't do it with swolebrain/node-web-app:latest

If you left that unchanged, then the above command will wipe out your application and replace it with my hello world app

### Setup

1. Follow the steps to get started with cdk (installing pre-requisites and boostrapping). You should probably read [this whole thing](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html).
2. Fork this repo into your github account
3. Create a connection from AWS CodeStar to Github or BitBucket (I haven't tested this) following (these instructions)[https://docs.aws.amazon.com/dtconsole/latest/userguide/connections-create.html].
4. Decide on a name for your app. Let's say you decide to call it KratosService. Put that name in `cdk/configuration.ts`
5. Choose a region for your service. If you don't live near the Eastern united states, then choose whatever's closest to you or your customers. If you do live near the Eastern USA, then I recommend you keep us-east-2.
6. Create a secret in secrets manager to store your github token (this is for code deploy to be able to receive events from github). You can do this by `aws secretsmanager create-secret --name YOUR_APP_NAME_FROM_STEP_4/gh-token --secret-string <GITHUB-TOKEN> --region CHOSEN_REGION_FROM_STEP_5`
7. Upload this secret to codebuild: `aws codebuild import-source-credentials --server-type GITHUB --auth-type PERSONAL_ACCESS_TOKEN --token <GITHUB-TOKEN> --region CHOSEN_REGION_FROM_STEP_5` 
8. Create a hosted zone in route 53 for your domain name.
9. Take the nameservers from your hosted zone in route53 and go to your domain registrar and override your registrar's nameservers with the ones from route 53. This makes AWS the start of authority over your domain.
10. Go to cdk/configuration.ts and update whatever you need to update in there. You have to at least update `ACCOUNT_ID`, `HOSTED_ZONE_ID` and `HOSTED_ZONE_NAME`. You should consider updating `APP_NAME` too, and if you didn't end up using `us-east-2` then you need to update `RESOURCE_DEPLOYMENT_REGION`.
11. Run `cdk deploy`
12. ????????
13. Profit
