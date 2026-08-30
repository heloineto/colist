locals {
  oidc_provider = "token.actions.githubusercontent.com"
  repo          = "${var.github_org}/${var.github_repo}"
  account_id    = data.aws_caller_identity.current.account_id

  subs = {
    pr   = "repo:${local.repo}:pull_request"
    main = "repo:${local.repo}:ref:refs/heads/${var.production_branch}"
  }

  role_subs = {
    "ecr-push"            = [local.subs.main]
    "tf-plan"             = [local.subs.pr]
    "tf-apply-production" = [local.subs.main]
  }

  apply_envs = {
    production = local.subs.main
  }

  ci_role_arns = [
    for role_name in keys(local.role_subs) :
    "arn:aws:iam::${local.account_id}:role/${var.project}-${role_name}"
  ]
}
