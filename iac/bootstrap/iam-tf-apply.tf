resource "aws_iam_role" "tf_apply" {
  for_each = local.apply_envs

  name               = "${var.project}-tf-apply-${each.key}"
  assume_role_policy = data.aws_iam_policy_document.trust["tf-apply-${each.key}"].json
}

data "aws_iam_policy_document" "tf_apply" {
  for_each = local.apply_envs

  statement {
    sid = "AppStackManage"
    actions = [
      "ec2:*",
      "ecs:*",
      "ecr:*",
      "logs:*",
      "ssm:*",
      "rds:*",
      "secretsmanager:*",
      "kms:DescribeKey",
      "kms:ListAliases",
      "kms:CreateGrant",
      "kms:GenerateDataKey*",
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "cloudwatch:*",
      "route53:*",
      "elasticloadbalancing:*",
      "application-autoscaling:*",
      "autoscaling:*",
      "iam:Get*",
      "iam:List*",
      "iam:CreateServiceLinkedRole",
    ]
    resources = ["*"]
  }

  statement {
    sid = "StateBackend"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
    ]
    resources = [
      "arn:aws:s3:::colist-tfstate",
      "arn:aws:s3:::colist-tfstate/colist/${each.key}/*",
    ]
  }

  statement {
    sid     = "UploadsBucket"
    actions = ["s3:*"]
    resources = [
      "arn:aws:s3:::${var.project}-${each.key}-uploads",
      "arn:aws:s3:::${var.project}-${each.key}-uploads/*",
    ]
  }

  statement {
    sid = "ManageAppStackIam"
    actions = [
      "iam:CreateRole",
      "iam:DeleteRole",
      "iam:TagRole",
      "iam:UntagRole",
      "iam:AttachRolePolicy",
      "iam:DetachRolePolicy",
      "iam:PutRolePolicy",
      "iam:DeleteRolePolicy",
      "iam:UpdateAssumeRolePolicy",
      "iam:CreatePolicy",
      "iam:DeletePolicy",
      "iam:CreatePolicyVersion",
      "iam:DeletePolicyVersion",
      "iam:CreateInstanceProfile",
      "iam:DeleteInstanceProfile",
      "iam:GetInstanceProfile",
      "iam:TagInstanceProfile",
      "iam:UntagInstanceProfile",
      "iam:AddRoleToInstanceProfile",
      "iam:RemoveRoleFromInstanceProfile",
    ]
    resources = [
      "arn:aws:iam::${local.account_id}:role/${var.project}-${each.key}-*",
      "arn:aws:iam::${local.account_id}:policy/${var.project}-${each.key}-*",
      "arn:aws:iam::${local.account_id}:instance-profile/${var.project}-${each.key}-*",
    ]
  }

  statement {
    sid       = "PassAppStackRoles"
    actions   = ["iam:PassRole"]
    resources = ["arn:aws:iam::${local.account_id}:role/${var.project}-${each.key}-*"]
  }

  statement {
    sid       = "DenyOidcProviderMutation"
    effect    = "Deny"
    actions   = ["iam:*OpenIDConnectProvider*"]
    resources = [data.aws_iam_openid_connect_provider.github.arn]
  }

  statement {
    sid    = "DenyCiRoleMutation"
    effect = "Deny"
    actions = [
      "iam:CreateRole",
      "iam:DeleteRole",
      "iam:UpdateRole",
      "iam:UpdateAssumeRolePolicy",
      "iam:AttachRolePolicy",
      "iam:DetachRolePolicy",
      "iam:PutRolePolicy",
      "iam:DeleteRolePolicy",
      "iam:TagRole",
      "iam:UntagRole",
      "iam:PassRole",
    ]
    resources = local.ci_role_arns
  }
}

resource "aws_iam_role_policy" "tf_apply" {
  for_each = local.apply_envs

  name   = "${var.project}-tf-apply-${each.key}"
  role   = aws_iam_role.tf_apply[each.key].id
  policy = data.aws_iam_policy_document.tf_apply[each.key].json
}
