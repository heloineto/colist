# compute

Single fixed EC2 instance (arm64/Graviton) registered to an ECS cluster via
user-data. The instance role carries `AmazonSSMManagedInstanceCore` for admin
access via SSM Session Manager (port 22 stays closed) and
`AmazonEC2ContainerServiceforEC2Role` for the ECS agent.

The Elastic IP (allocated by the network module) is associated here so it
survives instance replacement. An EC2 auto-recovery alarm triggers on system
status check failure, recovering the instance on the same host hardware with
the same EIP and EBS volume.

User-data also creates `/opt/caddy/data` for the web container's (Caddy) persistent
certificate storage.
