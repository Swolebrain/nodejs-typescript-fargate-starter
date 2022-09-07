import * as cdk from "aws-cdk-lib";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as iam from "aws-cdk-lib/aws-iam";
import { APP_NAME } from "./configuration";

export default function setupEcrAndCodeBuild(stack: cdk.Stack, stagingCluster: ecs.Cluster, prodCluster: ecs.Cluster) {
    const ecrRepo = new ecr.Repository(stack, 'EcrRepo');

    const codebuildProject = new codebuild.Project(stack, `${APP_NAME}`, {
        projectName: `${stack.stackName}`,
        environment: {
            buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_2,
            privileged: true
        },
        environmentVariables: {
            'ECR_REPO_URI': {
                value: `${ecrRepo.repositoryUri}`
            }
        },
        buildSpec: codebuild.BuildSpec.fromObject({
            version: "0.2",
            phases: {
                pre_build: {
                    commands: [
                        'env',
                        'export TAG=${CODEBUILD_RESOLVED_SOURCE_VERSION}'
                    ]
                },
                build: {
                    commands: [
                        'cd appserver',
                        `docker build -t $ECR_REPO_URI:$TAG .`,
                        '$(aws ecr get-login --no-include-email)',
                        'docker push $ECR_REPO_URI:$TAG'
                    ]
                },
                post_build: {
                    commands: [
                        'echo "In Post-Build Stage"',
                        'cd ..',
                        // default container name is "web"
                        `printf '[{\"name\":\"web\",\"imageUri\":\"%s\"}]' $ECR_REPO_URI:$TAG > imagedefinitions.json`,
                        "pwd; ls -al; cat imagedefinitions.json"
                    ]
                }
            },
            artifacts: {
                files: [
                    'imagedefinitions.json',
                ]
            }
        })
    });

    ecrRepo.grantPullPush(codebuildProject.role!)
    codebuildProject.addToRolePolicy(new iam.PolicyStatement({
        actions: [
            "ecs:DescribeCluster",
            "ecr:GetAuthorizationToken",
            "ecr:BatchCheckLayerAvailability",
            "ecr:BatchGetImage",
            "ecr:GetDownloadUrlForLayer"
        ],
        resources: [
            `${stagingCluster.clusterArn}`,
            `${prodCluster.clusterArn}`
        ],
    }));

    return {
        ecrRepo,
        codebuildProject
    }
}