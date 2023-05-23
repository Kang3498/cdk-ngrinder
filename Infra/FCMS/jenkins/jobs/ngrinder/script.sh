#!/bin/sh -xe
set -e

ACCOUNT=$1
REGION=$2
CIDR=$3

npm ci
npx cdk bootstrap --app="npx ts-node bin/ngrinder.ts" -c account=$ACCOUNT -c region=$REGION -c cidr=$CIDR
npx cdk deploy  --app="npx ts-node bin/ngrinder.ts" --require-approval never -c account=$ACCOUNT -c region=$REGION -c cidr=$CIDR