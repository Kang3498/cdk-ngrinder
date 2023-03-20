import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { NgrinderController } from './controller'
import { NgrinderAgents } from './agents'
import { CfnOutput } from 'aws-cdk-lib'

interface NgrinderStackProps extends cdk.StackProps {
  vpcid: string
}

export class NgrinderStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: NgrinderStackProps) {
    super(scope, id, props)

    const vpc = ec2.Vpc.fromLookup(this, id + '-vpc', {
      //isDefault: true,
      vpcId: props.vpcid,
    })

    const controller = new NgrinderController(this, id + '-controller', vpc)
    new NgrinderAgents(this, id + '-agent', vpc, controller.getIp())

    new CfnOutput(this, 'ngrinder address', { value: controller.getIp() })
  }
}
