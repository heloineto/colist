variable "project" {
  description = "Project prefix driving resource names and tags. Makes this stack a reusable template."
  type        = string
  default     = "colist"
}

variable "environment" {
  description = "Environment name; namespaces resources and state."
  type        = string
  default     = "production"
}

variable "region" {
  description = "AWS region for all resources."
  type        = string
  default     = "us-east-2"
}

variable "instance_type" {
  description = "EC2 instance type. Must be arm64/Graviton."
  type        = string
  default     = "t4g.small"
}

variable "hostname" {
  description = "Public host: Route 53 zone name, A record, Caddy TLS host and web origin."
  type        = string
  default     = "colist.heloineto.com"
}

variable "ssm_secret_names" {
  description = "SSM parameter names injected as secrets into the API container."
  type        = list(string)
  default = [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
  ]
}

variable "local_web_origin" {
  description = "Local dev web origin allowed by the uploads bucket CORS (presigned PUT from the browser)."
  type        = string
  default     = "http://localhost:5000"
}
