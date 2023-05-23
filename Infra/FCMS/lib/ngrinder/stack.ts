import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { NgrinderController } from './controller'
import { NgrinderAgents } from './agents'
import {NgrinderVpc} from './vpc'

interface NgrinderStackProps extends cdk.StackProps {
  cidr: string
}

export class NgrinderStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: NgrinderStackProps) {
    super(scope, id, props)

    const vpc = new NgrinderVpc(this, id + '-vpc', props.cidr)

    const controller = new NgrinderController(this, id + '-controller', vpc.getVpc())
    new NgrinderAgents(this, id + '-agent', vpc.getVpc(), controller.getPrivateIp())
  }
}
