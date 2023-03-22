#!/bin/sh
set -e

ACCOUNT=$1
REGION=$2
VPC_ID=$3

echo "test"

npm ci
npx cdk bootstrap --app="npx ts-node bin/ngrinder.ts" -c account=$ACCOUNT -c region=$REGION -c vpc_id=$VPC_ID
npx cdk deploy  --app="npx ts-node bin/ngrinder.ts" -c account=$ACCOUNT -c region=$REGION -c vpc_id=$VPC_ID