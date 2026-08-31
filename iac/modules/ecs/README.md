# ecs

ECS cluster, task definition, and service. The task runs two containers in host
network mode:

- **api**: the NestJS app from ECR, secrets injected from SSM via `valueFrom`,
  runtime `task_role_arn` for S3. A container health check probes `/api/health`, so
  a wedged-but-running process is caught and the task replaced
- **web**: Caddy with the SPA baked in (`apps/web/Dockerfile`), from ECR.
  Terminates TLS via Let's Encrypt (cert storage on the persistent host volume
  `/opt/caddy/data`), serves `/`, proxies `/api/*` to `api`

Deploy config is stop-then-start (`minimumHealthyPercent = 0`, `maximumPercent =
100`) - a brief blip per deploy, acceptable at low traffic. The service uses
`ignore_changes` on `task_definition` so CI-driven deploys (new task definition
revisions swapping both images) are not reverted by Terraform.

The task execution role gets `AmazonECSTaskExecutionRolePolicy` (ECR pull +
CloudWatch Logs) plus an inline policy granting `ssm:GetParameters` scoped to the
environment's parameter path. `MODE`, `PORT` and `api_environment` are injected
as plain environment variables.

Both containers' logs ship to a CloudWatch log group with 30-day retention.
