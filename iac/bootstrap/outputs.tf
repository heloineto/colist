output "github_oidc_provider_arn" {
  description = "ARN of the GitHub Actions OIDC provider."
  value       = data.aws_iam_openid_connect_provider.github.arn
}

output "ecr_push_role_arn" {
  description = "Role the build job assumes to push images to ECR."
  value       = aws_iam_role.ecr_push.arn
}

output "tf_plan_role_arn" {
  description = "Read-only role the PR plan job assumes."
  value       = aws_iam_role.tf_plan.arn
}

output "tf_apply_role_arns" {
  description = "Per-environment apply roles, keyed by environment."
  value       = { for env, role in aws_iam_role.tf_apply : env => role.arn }
}
