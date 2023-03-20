import {
  CfnEIP,
  CfnEIPAssociation,
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  IVpc,
  MachineImage,
  Peer,
  Port,
  SecurityGroup,
} from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs'
import { KeyPair } from 'cdk-ec2-key-pair'
import { ManagedPolicy, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { readFileSync } from 'fs'

export class NgrinderController {
  private eip: CfnEIP
  constructor(scope: Construct, id: string, vpc: IVpc) {
    const keyPair = new KeyPair(scope, id + '-keypair', {
      name: id + '-key',
      description: '',
      storePublicKey: true,
    })
    keyPair.grantReadOnPublicKey

    const securityGroup = new SecurityGroup(scope, id + '-sg', {
      vpc,
      allowAllOutbound: true,
    })

    const role = new Role(scope, id + '-role', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
    })

    role.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
    )

    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(22))
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80))
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(16001))
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcpRange(12000, 12100))

    const userDataScript = readFileSync('./lib/user-data.sh', 'utf8').replace(
      /\r\n/g,
      '\n'
    )

    const controllerInstance = new Instance(scope, id + '-controller', {
      vpc,
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.LARGE),
      machineImage: MachineImage.latestAmazonLinux(),
      keyName: keyPair.keyPairName,
      securityGroup: securityGroup,
      role: role,
    })
    controllerInstance.addUserData(userDataScript)

    this.eip = new CfnEIP(scope, id + '-eip')
    const eipAssociation = new CfnEIPAssociation(
      scope,
      id + '-eip-association',
      {
        eip: this.eip.attrPublicIp,
        instanceId: controllerInstance.instanceId,
      }
    )
  }
  getIp(): string {
    return this.eip.attrPublicIp
  }
}
