import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { NgrinderController } from './controller'
import { NgrinderAgents } from './agents'

export class NgrinderStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const vpc = ec2.Vpc.fromLookup(this, id + '-vpc', {
      isDefault: true,
    })

    const controller = new NgrinderController(this, id + '-controller', vpc)
    new NgrinderAgents(this, id + '-agent', vpc, controller.getIp())
  }
}
