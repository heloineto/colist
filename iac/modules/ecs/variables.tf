variable "name_prefix" {
  description = "Prefix for resource names and tags (e.g. colist-production)."
  type        = string
}

variable "region" {
  description = "AWS region for SSM ARNs and CloudWatch log configuration."
  type        = string
}

variable "api_repository_url" {
  description = "ECR repository URL for the API image."
  type        = string
}

variable "web_repository_url" {
  description = "ECR repository URL for the web image (Caddy + baked SPA)."
  type        = string
}

variable "image_tag" {
  description = "Initial tag for both containers. CI overrides via task definition revisions."
  type        = string
  default     = "init"
}

variable "task_role_arn" {
  description = "IAM role the containers assume at runtime (S3 access for the API)."
  type        = string
}

variable "api_environment" {
  description = "Extra plain environment variables for the API container (MODE and PORT are always set)."
  type        = map(string)
  default     = {}
}

variable "ssm_secret_names" {
  description = "Environment variable names to inject as secrets from SSM (under ssm_prefix)."
  type        = list(string)
}

variable "ssm_prefix" {
  description = "SSM parameter path prefix without leading slash (e.g. colist/production/api)."
  type        = string
}

variable "api_port" {
  description = "Port the API container listens on."
  type        = number
  default     = 5100
}

variable "log_retention_days" {
  description = "CloudWatch log group retention in days."
  type        = number
  default     = 30
}
