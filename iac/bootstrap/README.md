# bootstrap

The privileged foundation, applied **manually with local admin credentials** and
**never by CI**. Owns the three CI roles every later CI run federates against; the GitHub
Actions OIDC provider is account-wide and owned by voto-a-voto's bootstrap,
so it is referenced (data source), not declared.

## Roles

| Role                         | Assumable from | Scope                                                    |
| ---------------------------- | -------------- | -------------------------------------------------------- |
| `colist-ecr-push`            | `main` only    | push images to `colist-*` ECR repos                      |
| `colist-tf-plan`             | pull requests  | read-only (`Describe*`/`Get*`/`List*`)                   |
| `colist-tf-apply-production` | `main` only    | manage the production app stack (+ Route 53, uploads S3) |

**Security spine.** No CI role can mutate the OIDC provider, the CI roles, or
itself: the apply role scopes IAM writes to its own `colist-production-*`
resources and carries an explicit `Deny` over the OIDC provider and all three CI
role ARNs. `iam:PassRole` is limited to the `colist-production-*` task/instance
roles. This removes the lockout risk (a bad apply bricking CI) and the
self-escalation risk (CI granting itself admin).

## Apply

One-time, with admin credentials, driven by [`scripts/setup-aws-prod.sh`](../../scripts/setup-aws-prod.sh)
(it also creates the `colist-tfstate` bucket first). By hand:

```sh
bun run iac:bootstrap:init
bun run iac:bootstrap:apply
```

Re-run by hand whenever the OIDC provider or a CI role changes. CI has no
permission to apply this stack.
