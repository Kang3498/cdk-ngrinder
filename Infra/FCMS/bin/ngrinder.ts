#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { NgrinderStack } from '../lib/ngrinder/stack'

const app = new cdk.App()
const account = app.node.tryGetContext('account')
const cidr = app.node.tryGetContext('cidr')
const region = app.node.tryGetContext('region')
new NgrinderStack(app, 'NgrinderCdkStack', {
  env: {
    account: account,
    region: region,
  },
  cidr: cidr
})