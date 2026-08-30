variable "name_prefix" {
  description = "Prefix for resource names and tags (e.g. colist-production)."
  type        = string
}

variable "vpc_id" {
  description = "VPC the instance and its security group live in."
  type        = string
}

variable "subnet_ids" {
  description = "Subnets for the DB subnet group. RDS requires at least two, in different AZs."
  type        = list(string)
}

variable "app_security_group_id" {
  description = "Security group of the API instance; granted inbound 5432."
  type        = string
}

variable "engine_version" {
  description = "Postgres major version. Must be >= the source (Supabase) major for a clean dump/restore."
  type        = string
  default     = "17"
}

variable "instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.micro"
}

variable "allocated_storage" {
  description = "Storage in GB (gp3)."
  type        = number
  default     = 20
}

variable "database_name" {
  description = "Initial database name."
  type        = string
  default     = "postgres"
}

variable "master_username" {
  description = "Master username. Password is generated and stored by RDS in Secrets Manager."
  type        = string
  default     = "postgres"
}

variable "backup_retention_days" {
  description = "Automated backup retention in days."
  type        = number
  default     = 7
}
