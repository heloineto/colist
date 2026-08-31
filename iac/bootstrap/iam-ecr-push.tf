resource "aws_iam_role" "ecr_push" {
  name               = "${var.project}-ecr-push"
  assume_role_policy = data.aws_iam_policy_document.trust["ecr-push"].json
}

data "aws_iam_policy_document" "ecr_push" {
  statement {
    sid       = "EcrAuth"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    sid = "EcrPush"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:PutImage",
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer",
    ]
    resources = ["arn:aws:ecr:${var.region}:${local.account_id}:repository/${var.project}-*"]
  }
}

resource "aws_iam_role_policy" "ecr_push" {
  name   = "${var.project}-ecr-push"
  role   = aws_iam_role.ecr_push.id
  policy = data.aws_iam_policy_document.ecr_push.json
}
