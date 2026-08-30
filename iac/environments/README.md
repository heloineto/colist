# environments

Per-environment app stacks. Colist has one — `production/` — calling the shared
`../modules/` with its own S3 state key (`colist/production/terraform.tfstate`).
Local dev is docker compose; there is no staging.

A PR touching `iac/**` runs `terraform plan` (`colist-tf-plan`, read-only) via
[`iac.yml`](../../.github/workflows/iac.yml). A `main` merge applies via the
`apply` job of [`main.yml`](../../.github/workflows/main.yml)
(`colist-tf-apply-production`) before the images are rolled out. Both need the
`AWS_ACCOUNT_ID` repository variable to build the role ARNs.
