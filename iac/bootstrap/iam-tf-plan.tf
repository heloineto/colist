resource "aws_iam_role" "tf_plan" {
  name               = "${var.project}-tf-plan"
  assume_role_policy = data.aws_iam_policy_document.trust["tf-plan"].json
}

data "aws_iam_policy_document" "tf_plan" {
  statement {
    sid = "ReadOnly"
    actions = [
      "ec2:Describe*",
      "ec2:Get*",
      "ecs:Describe*",
      "ecs:List*",
      "ecr:Describe*",
      "ecr:Get*",
      "ecr:List*",
      "ecr:BatchGetImage",
      "iam:Get*",
      "iam:List*",
      "logs:Describe*",
      "logs:Get*",
      "logs:List*",
      "ssm:Describe*",
      "ssm:Get*",
      "ssm:List*",
      "rds:Describe*",
      "rds:List*",
      "route53:Get*",
      "route53:List*",
      "cloudwatch:Describe*",
      "cloudwatch:Get*",
      "cloudwatch:List*",
      "elasticloadbalancing:Describe*",
      "application-autoscaling:Describe*",
      "autoscaling:Describe*",
      "kms:Describe*",
      "kms:Get*",
      "kms:List*",
      "s3:Get*",
      "s3:List*",
    ]
    resources = ["*"]
  }
}

resource "aws_iam_role_policy" "tf_plan" {
  name   = "${var.project}-tf-plan"
  role   = aws_iam_role.tf_plan.id
  policy = data.aws_iam_policy_document.tf_plan.json
}
