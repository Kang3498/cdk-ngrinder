import {
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  MachineImage,
  Peer,
  Port,
  SecurityGroup, Vpc,
} from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs'
import { KeyPair } from 'cdk-ec2-key-pair'
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { readFileSync } from 'fs'
import {aws_elasticloadbalancingv2 as elbv2, aws_elasticloadbalancingv2_targets as elbv2_targets, CfnOutput} from 'aws-cdk-lib'

export class NgrinderController {
  private privateIp: string
  constructor(scope: Construct, id: string, vpc: Vpc) {
    const keyPair = new KeyPair(scope, id + '-keypair', {
      name: id + '-key',
      description: '',
      storePublicKey: true,
    })

    const role = new Role(scope, id + '-role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
    })

    role.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
    )

    const lbSg = new SecurityGroup(scope, id + '-lb-sg', {
      vpc,
      allowAllOutbound: true,
    })

    const lb = new elbv2.ApplicationLoadBalancer(scope, 'LB', {
      vpc,
      internetFacing: true,
      securityGroup: lbSg
    });

    const listener = lb.addListener('Listener', {
      port: 80,
      open: true,
    });

    const controllerSg = new SecurityGroup(scope, id + '-sg', {
      vpc,
      allowAllOutbound: true,
    })
    controllerSg.addIngressRule(lbSg, Port.tcp(80))
    controllerSg.addIngressRule(Peer.ipv4(vpc.privateSubnets[0].ipv4CidrBlock), Port.tcp(80))
    controllerSg.addIngressRule(Peer.ipv4(vpc.privateSubnets[0].ipv4CidrBlock), Port.tcp(16001))
    controllerSg.addIngressRule(Peer.ipv4(vpc.privateSubnets[0].ipv4CidrBlock), Port.tcpRange(12000, 12100))

    const userDataScript = readFileSync('./lib/ngrinder/user-data.sh', 'utf8').replace(
      /\r\n/g,
      '\n'
    )

    const controllerInstance = new Instance(scope, id + '-controller', {
      vpc,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.LARGE),
      machineImage: MachineImage.latestAmazonLinux2(),
      keyName: keyPair.keyPairName,
      securityGroup: controllerSg,
      role: role,
      vpcSubnets: {
        subnets: [vpc.privateSubnets[0]]
      }
    })
    controllerInstance.addUserData(userDataScript)

    this.privateIp = controllerInstance.instancePrivateIp

    listener.addTargets('ApplicationFleet', {
      port: 80,
      targets: [
        new elbv2_targets.InstanceIdTarget(controllerInstance.instanceId),
      ],
      healthCheck: {
        enabled: true,
        path: '/login'
      }
    });
  }
  getPrivateIp(): string {
    return this.privateIp
  }
}
