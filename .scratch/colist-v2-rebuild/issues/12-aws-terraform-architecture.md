# AWS and Terraform architecture

Type: grilling
Status: open
Blocked by: 05, 06, 07

## Question

Port vav's iac pattern to colist and settle the colist-specific deltas.

vav's pattern (the base): `iac/bootstrap` (human-applied: GitHub OIDC provider + 4 scoped CI roles with anti-lockout Denies) / `iac/environments/{staging,production}` (CI-applied, directories not workspaces) / `iac/modules`; S3 state bucket with native locking; ECS on a single `t4g.small` EC2, api + caddy containers in host network mode, EIP, no ALB; ECR immutable tags owned by staging; SSM SecureString secrets seeded by hand; CloudWatch logs + system-status auto-recover; Cloudflare grey-cloud DNS by hand; us-east-2.

Colist deltas to decide:
- One env or staging+production? (Alpha app, one user-developer — staging may be ceremony.)
- Instance sizing (t4g.micro/small), same region?
- DB resources per the hosting decision; where avatar S3 bucket lives.
- Domain: colist.com.br DNS is where today (registro.br? Cloudflare?) — TLS via Caddy same as vav?
- Naming prefix (`colist-` vs vav's `vav-`), state bucket name.
- Write the runbook vav lost (SSM seeding, DNS record, bootstrap apply).
