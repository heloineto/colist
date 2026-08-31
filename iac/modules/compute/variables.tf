variable "name_prefix" {
  description = "Prefix for resource names and tags (e.g. colist-production)."
  type        = string
}

variable "region" {
  description = "AWS region for automate ARNs."
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type. Must be arm64/Graviton."
  type        = string
  default     = "t4g.small"
}

variable "subnet_id" {
  description = "Public subnet to launch the instance in."
  type        = string
}

variable "security_group_id" {
  description = "Security group allowing inbound 80/443."
  type        = string
}

variable "eip_allocation_id" {
  description = "Elastic IP allocation to associate with the instance."
  type        = string
}

variable "ecs_cluster_name" {
  description = "ECS cluster name the instance registers to via user-data."
  type        = string
}
