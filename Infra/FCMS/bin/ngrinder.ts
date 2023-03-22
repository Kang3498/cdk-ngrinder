#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { NgrinderStack } from '../lib/ngrinder/stack'

const app = new cdk.App()
const account = app.node.tryGetContext('account')
const vpcid = app.node.tryGetContext('vpc_id')
const region = app.node.tryGetContext('region')
new NgrinderStack(app, 'NgrinderCdkStack', {
  env: {
    account: account,
    region: region,
  },
  vpcid: vpcid
})