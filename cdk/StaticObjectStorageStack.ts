import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { Distribution, OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { ARecord, HostedZone, RecordTarget } from "aws-cdk-lib/aws-route53";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";

interface StaticObjectStorageStackProps extends cdk.StackProps {
    hostedZoneName: string;
    domainPrefix: string;
    bucketName: string;
}

export default class StaticObjectStorageStack extends cdk.Stack {
    public readonly assetsBucket: Bucket;
    public readonly oai: OriginAccessIdentity;
    public readonly cloudfrontDistro: Distribution;

    constructor(scope: Construct, id: string, props: StaticObjectStorageStackProps) {
        super(scope, id, props);
        this.assetsBucket = new Bucket(this, `${props.domainPrefix}-storageBucket`, {
            blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
            bucketName: props.bucketName
        });
        this.oai = new OriginAccessIdentity(this, 'WebsiteOAI');
        this.assetsBucket.grantReadWrite(this.oai);

        const hostedZone = HostedZone.fromLookup(this, 'HostedZone',{domainName: props.hostedZoneName });

        const publicDnsName = `${props.domainPrefix}.${props.hostedZoneName}`;
        const certificate = new DnsValidatedCertificate(this, 'AssetsCDNCert', {
            domainName: publicDnsName,
            hostedZone,
            // cloudfront requires ACM in us-east-1
            region: 'us-east-1',
        });

        this.cloudfrontDistro = new Distribution(this, 'Distro', {
            certificate,
            domainNames: [publicDnsName],
            defaultBehavior: {
                origin: new S3Origin(this.assetsBucket, {originAccessIdentity: this.oai}),
            },
        });

        const subdomainRecord = new ARecord(this, 'Alias', {
            zone: hostedZone,
            target: RecordTarget.fromAlias(new CloudFrontTarget(this.cloudfrontDistro)),
            recordName: publicDnsName
        });
    }
}