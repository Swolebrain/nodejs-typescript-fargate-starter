import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {ApplicationLoadBalancedFargateService} from 'aws-cdk-lib/aws-ecs-patterns';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { APP_NAME, HOSTED_ZONE_ID, HOSTED_ZONE_NAME, RESOURCE_DEPLOYMENT_REGION } from "./configuration";
import { Duration } from "aws-cdk-lib";
import { IHostedZone, HostedZone } from "aws-cdk-lib/aws-route53";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";

export interface AppClusterProps {
    appEnv: string;
    desiredCount: number;
    deploymentEnv: string;
}


export class ApplicationEcsCluster extends Construct {
    private props: AppClusterProps;
    public fargateService: ApplicationLoadBalancedFargateService;
    public hostedZone: IHostedZone;
    public serviceUrl: string;

    constructor(scope: Construct, id: string, props: AppClusterProps) {
        super(scope, id);
        this.props = props;
        this.hostedZone = HostedZone.fromHostedZoneAttributes(this, `cdkid-${HOSTED_ZONE_ID}`, {
            zoneName: HOSTED_ZONE_NAME,
            hostedZoneId: HOSTED_ZONE_ID
        });

        this.fargateService = new ApplicationLoadBalancedFargateService(this, 'Service', {
            cluster: new ecs.Cluster(this, `${APP_NAME}-FargateAppCluster-${props.deploymentEnv}`),
            memoryLimitMiB: 1024,
            desiredCount: 1,
            cpu: 512,
            taskImageOptions: {
                image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
            },
            taskSubnets: {
                subnets: [ec2.Subnet.fromSubnetId(this, 'subnet', 'VpcISOLATEDSubnet1Subnet80F07FA0')],
            },
            loadBalancerName: `${APP_NAME}-ALB`,
            healthCheckGracePeriod: Duration.seconds(60),
            publicLoadBalancer: true,
            redirectHTTP: true,
            domainZone: this.hostedZone,
            domainName: HOSTED_ZONE_NAME,
            certificate: new DnsValidatedCertificate(this, `${APP_NAME}-ACM-Certificate`, {
                domainName: `*.${HOSTED_ZONE_NAME}`,
                hostedZone: this.hostedZone,
                region: RESOURCE_DEPLOYMENT_REGION
            })
        });

        this.serviceUrl = 'https://' + this.fargateService.loadBalancer.loadBalancerDnsName;
        new cdk.CfnOutput(this, 'ALBURL', { value: this.serviceUrl });
    }
}

