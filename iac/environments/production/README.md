# production

The only app stack. First apply by hand ([`scripts/setup-aws-prod.sh`](../../scripts/setup-aws-prod.sh));
afterwards CI applies it via OIDC (`colist-tf-apply-production`, `main` merges,
`apply` job in `main.yml`). State: `colist/production/terraform.tfstate` in `colist-tfstate`.

Provisions:

- **ecr**: `colist-api` + `colist-web` repositories, immutable tags, lifecycle policy
- **network**: VPC, two public subnets, IGW, security group (80/443), Elastic IP
- **ecs**: cluster, task definition (`api` + `web`), service (desired 1, stop-then-start)
- **compute**: `t4g.small` arm64 instance, ECS registration, SSM access, auto-recovery
- **rds**: `db.t4g.micro` Postgres 17, **private** (5432 from the API SG only), SSL forced,
  RDS-managed master password in Secrets Manager (`db_master_user_secret_arn`)
- **uploads**: `colist-production-uploads` S3 bucket, public read on `avatars/*` only,
  presigned PUT from the browser (CORS), ECS task role with object RW
- **dns**: Route 53 zone `colist.heloineto.com` (imported) + A record → EIP

The `web` container (Caddy + baked SPA) terminates TLS and proxies `/api/*` to
`api`, which boots with secrets from SSM (`/colist/production/api/*`).

Every `main` merge rebuilds both images and rolls the service via
[`.github/scripts/deploy-ecs.sh`](../../.github/scripts/deploy-ecs.sh). The task
definition's images are `ignore_changes`, so Terraform never reverts a deploy.

Local admin access to Postgres: `scripts/db-tunnel.sh` (SSM port-forward through
the instance), then `localhost:5432`.
