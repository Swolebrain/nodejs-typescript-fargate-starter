import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApplicationLoadBalancedFargateService } from 'aws-cdk-lib/aws-ecs-patterns';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import { APP_NAME, HOSTED_ZONE_NAME } from "./configuration";
import { IHostedZone } from "aws-cdk-lib/aws-route53";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import * as iam from "aws-cdk-lib/aws-iam";
import { Cluster } from "aws-cdk-lib/aws-ecs";

export interface AppClusterProps {
    appEnv: string;
    desiredCount: number;
    deploymentEnv: string;
    hostedZone: IHostedZone;
    certificate: DnsValidatedCertificate;
    maxCapacity: number;
    subDomain: string;
    executionRolePolicy: iam.PolicyStatement;
    taskRolePolicies: iam.PolicyStatement[];
}


export class ConfiguredFargateLoadBalancedApplicationWithSSL extends Construct {
    private props: AppClusterProps;
    public fargateService: ApplicationLoadBalancedFargateService;
    public serviceUrl: string;
    public readonly cluster: Cluster;

    constructor(scope: Construct, id: string, props: AppClusterProps) {
        super(scope, id);
        this.props = props;

        this.cluster = new ecs.Cluster(this, `Cluster-${props.deploymentEnv}`, {
            clusterName: `${APP_NAME}-${props.deploymentEnv}`
        });
        this.fargateService = new ApplicationLoadBalancedFargateService(this, `Service-${props.deploymentEnv}`, {
            cluster: this.cluster,
            memoryLimitMiB: 1024,
            desiredCount: 1,
            cpu: 512,
            taskImageOptions: {
                image: ecs.ContainerImage.fromRegistry("swolebrain/node-web-app:latest"),
                environment: {
                    PORT: '80', // for express to know about it
                    ENV: `${props.deploymentEnv}`
                },
            },
            loadBalancerName: `${APP_NAME}-ALB-${props.deploymentEnv}`,
            healthCheckGracePeriod: Duration.seconds(180),
            publicLoadBalancer: true,
            redirectHTTP: true,
            domainZone: props.hostedZone,
            domainName: `${props.subDomain}.${HOSTED_ZONE_NAME}`,
            certificate: props.certificate,
            serviceName: `${APP_NAME}-${props.deploymentEnv}`
        });

        this.serviceUrl = 'https://' + this.fargateService.loadBalancer.loadBalancerDnsName;
        new cdk.CfnOutput(this, `ALBURL-${props.deploymentEnv}`, { value: this.serviceUrl });

        // Set connection draining timeout to 5s since this is a web service. Default is very obnoxious 300s
        this.fargateService.targetGroup.setAttribute('deregistration_delay.timeout_seconds', '5');

        // const scalableTarget = this.fargateService.service.autoScaleTaskCount({
        //     minCapacity: 1,
        //     maxCapacity: props.maxCapacity,
        // });
        //
        // scalableTarget.scaleOnCpuUtilization('CpuScaling', {
        //     targetUtilizationPercent: 50,
        // });
        //
        // scalableTarget.scaleOnMemoryUtilization('MemoryScaling', {
        //     targetUtilizationPercent: 50,
        // });

        this.fargateService.taskDefinition.addToExecutionRolePolicy(props.executionRolePolicy);
        props.taskRolePolicies.forEach(iamPolicy => {
            this.fargateService.taskDefinition.addToTaskRolePolicy(iamPolicy);
        });

    }
}

