import {Construct} from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'

export class NgrinderVpc {
    private vpc: ec2.Vpc
    constructor(scope: Construct, id: string, cidr: string) {
        this.vpc = new ec2.Vpc(scope, id + '-vpc', {
            ipAddresses: ec2.IpAddresses.cidr(cidr),
            subnetConfiguration: [
                {
                    name: "public-subnet",
                    subnetType: ec2.SubnetType.PUBLIC,
                    cidrMask: 24,
                },
                {
                    name: "private-subnet",
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                    cidrMask: 24,
                },
            ],
            natGateways: 1,
            maxAzs: 2
        })
    }

    getVpc(): ec2.Vpc {
        return this.vpc
    }
}
