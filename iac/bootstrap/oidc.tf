# Account-wide, one per URL: created (and owned) by voto-a-voto's bootstrap in
# the same account. Referenced here, never declared, so neither stack can
# destroy it from under the other.
data "aws_iam_openid_connect_provider" "github" {
  url = "https://${local.oidc_provider}"
}

data "aws_iam_policy_document" "trust" {
  for_each = local.role_subs

  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${local.oidc_provider}:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "${local.oidc_provider}:sub"
      values   = each.value
    }
  }
}
