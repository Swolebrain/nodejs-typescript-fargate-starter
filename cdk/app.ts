import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApplicationEcsCluster } from "./ApplicationEcsCluster";


export class App extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const ecsCluster = new ApplicationEcsCluster(this, 'clusterId', {
      appEnv: '',
      desiredCount: 1,
      deploymentEnv: 'staging'
    });
  };
}
