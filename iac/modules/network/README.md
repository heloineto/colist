# network

Minimal public network for a single internet-facing instance: one VPC, two
public subnets (the instance lives in the first; the second exists only because
RDS subnet groups require two AZs), an internet gateway with a default route, a
security group allowing inbound 80/443 only, and a static Elastic IP.

No NAT, no private subnets - the instance sits directly on the public subnet and
reaches ECR, Let's Encrypt, and the database over the IGW.

The Elastic IP is allocated here and exposed via `eip_public_ip`; the instance
(compute module, later) associates it via `eip_allocation_id`. The
production stack points the Route 53 A record at `eip_public_ip`.
