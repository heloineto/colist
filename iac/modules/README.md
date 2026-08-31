# modules

Shared Terraform modules called by the per-environment stacks in
`../environments/`.

| Module    | Status | Owns                                             |
| --------- | ------ | ------------------------------------------------ |
| `network` | built  | VPC, public subnet, IGW, security group, EIP     |
| `ecr`     | built  | one image repository + lifecycle policy          |
| `compute` | built  | EC2 instance, instance profile, auto-recovery    |
| `ecs`     | built  | ECS cluster, task definition, service (api+web)  |
| `rds`     | built  | Postgres instance, subnet group, SG, param group |
