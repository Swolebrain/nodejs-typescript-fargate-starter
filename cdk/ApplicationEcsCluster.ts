import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {ApplicationLoadBalancedFargateService} from 'aws-cdk-lib/aws-ecs-patterns';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { APP_NAME, HOSTED_ZONE_NAME } from "./configuration";
import { Duration } from "aws-cdk-lib";
import { IHostedZone } from "aws-cdk-lib/aws-route53";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";

export interface AppClusterProps {
    appEnv: string;
    desiredCount: number;
    deploymentEnv: string;
    hostedZone: IHostedZone;
    certificate: DnsValidatedCertificate;
    maxCapacity: number;
    subDomain: string;
}


export class ApplicationEcsCluster extends Construct {
    private props: AppClusterProps;
    public fargateService: ApplicationLoadBalancedFargateService;
    public serviceUrl: string;

    constructor(scope: Construct, id: string, props: AppClusterProps) {
        super(scope, id);
        this.props = props;

        this.fargateService = new ApplicationLoadBalancedFargateService(this, `Service-${props.deploymentEnv}`, {
            cluster: new ecs.Cluster(this, `${APP_NAME}-FargateAppCluster-${props.deploymentEnv}`),
            memoryLimitMiB: 1024,
            desiredCount: 1,
            cpu: 512,
            taskImageOptions: {
                image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
            },
            // taskSubnets: {
            //     subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            //     subnetGroupName: `taskSubnet-${APP_NAME}`
            // },
            loadBalancerName: `${APP_NAME}-ALB-${props.deploymentEnv}`,
            healthCheckGracePeriod: Duration.seconds(60),
            publicLoadBalancer: true,
            redirectHTTP: true,
            domainZone: props.hostedZone,
            domainName: `${props.subDomain}.${HOSTED_ZONE_NAME}`,
            certificate: props.certificate
        });

        this.serviceUrl = 'https://' + this.fargateService.loadBalancer.loadBalancerDnsName;
        new cdk.CfnOutput(this, `ALBURL-${props.deploymentEnv}`, { value: this.serviceUrl });

        const scalableTarget = this.fargateService.service.autoScaleTaskCount({
            minCapacity: 1,
            maxCapacity: props.maxCapacity,
        });

        scalableTarget.scaleOnCpuUtilization('CpuScaling', {
            targetUtilizationPercent: 50,
        });

        scalableTarget.scaleOnMemoryUtilization('MemoryScaling', {
            targetUtilizationPercent: 50,
        });
    }
}

