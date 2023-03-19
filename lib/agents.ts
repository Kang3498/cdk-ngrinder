import { IVpc } from 'aws-cdk-lib/aws-ec2'
import {
  Cluster,
  ContainerImage,
  FargateService,
  FargateTaskDefinition,
  LogDriver,
  UlimitName,
} from 'aws-cdk-lib/aws-ecs'
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'

export class NgrinderAgents {
  constructor(scope: Construct, id: string, vpc: IVpc, controller: string) {
    const cluster = new Cluster(scope, id + '-cluster', { vpc })

    const role = new Role(scope, id + '-role', {
      assumedBy: new ServicePrincipal('ecs-tasks.amazonaws.com'),
    })

    const taskDefinition = new FargateTaskDefinition(
      scope,
      id + '-task-definition',
      {
        executionRole: role,
      }
    )

    const container = taskDefinition.addContainer('NgrinderAgentContainer', {
      image: ContainerImage.fromRegistry('ngrinder/agent'),
      logging: LogDriver.awsLogs({ streamPrefix: 'ngrinder-agent' }),
      command: [`${controller}:80`],
      environment: {
        'jsse.enableSNIExtension': 'false',
      },
    })

    container.addUlimits({
      hardLimit: 65535,
      softLimit: 65535,
      name: UlimitName.NOFILE,
    })

    new FargateService(scope, id + '-service', {
      cluster,
      taskDefinition,
      assignPublicIp: true,
    })
  }
}
