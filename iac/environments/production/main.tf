locals {
  name_prefix = "${var.project}-${var.environment}"
  web_origin  = "https://${var.hostname}"
}

module "ecr" {
  source   = "../../modules/ecr"
  for_each = toset(["api", "web"])

  name = "${var.project}-${each.key}"
}

module "network" {
  source = "../../modules/network"

  name_prefix = local.name_prefix
}

module "ecs" {
  source = "../../modules/ecs"

  name_prefix        = local.name_prefix
  region             = var.region
  api_repository_url = module.ecr["api"].repository_url
  web_repository_url = module.ecr["web"].repository_url
  task_role_arn      = aws_iam_role.task.arn
  ssm_secret_names   = var.ssm_secret_names
  ssm_prefix         = "${var.project}/${var.environment}/api"
  api_environment = {
    BETTER_AUTH_URL = local.web_origin
    UPLOADS_BUCKET  = aws_s3_bucket.uploads.bucket
  }
}

module "compute" {
  source = "../../modules/compute"

  name_prefix       = local.name_prefix
  region            = var.region
  instance_type     = var.instance_type
  subnet_id         = module.network.public_subnet_id
  security_group_id = module.network.security_group_id
  eip_allocation_id = module.network.eip_allocation_id
  ecs_cluster_name  = module.ecs.cluster_name
}

module "rds" {
  source = "../../modules/rds"

  name_prefix           = local.name_prefix
  vpc_id                = module.network.vpc_id
  subnet_ids            = module.network.public_subnet_ids
  app_security_group_id = module.network.security_group_id
}

# Uploads: avatars (public read), error/feedback attachments (private). All
# writes go through presigned PUTs issued by the API (task role below).
resource "aws_s3_bucket" "uploads" {
  bucket = "${local.name_prefix}-uploads"

  tags = { Name = "${local.name_prefix}-uploads" }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = false
  restrict_public_buckets = false
}

data "aws_iam_policy_document" "uploads_public_avatars" {
  statement {
    sid       = "PublicReadAvatars"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.uploads.arn}/avatars/*"]

    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket_policy" "uploads" {
  bucket = aws_s3_bucket.uploads.id
  policy = data.aws_iam_policy_document.uploads_public_avatars.json

  depends_on = [aws_s3_bucket_public_access_block.uploads]
}

resource "aws_s3_bucket_cors_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  cors_rule {
    allowed_methods = ["PUT", "GET"]
    allowed_origins = [local.web_origin, var.local_web_origin]
    allowed_headers = ["*"]
    max_age_seconds = 3600
  }
}

resource "aws_iam_role" "task" {
  name = "${local.name_prefix}-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = { Name = "${local.name_prefix}-task" }
}

resource "aws_iam_role_policy" "task_uploads" {
  name = "${local.name_prefix}-uploads"
  role = aws_iam_role.task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
      Resource = "${aws_s3_bucket.uploads.arn}/*"
    }]
  })
}

# Hand-created before this stack existed (ticket 20); imported, never recreated:
#   terraform import aws_route53_zone.this <zone id>
resource "aws_route53_zone" "this" {
  name = var.hostname

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_route53_record" "apex" {
  zone_id = aws_route53_zone.this.zone_id
  name    = var.hostname
  type    = "A"
  ttl     = 300
  records = [module.network.eip_public_ip]
}
