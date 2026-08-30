variable "name_prefix" {
  description = "Prefix for resource names and the Name tag (e.g. colist-production)."
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.0.0.0/16"
}

variable "subnet_cidr" {
  description = "CIDR block for the single public subnet."
  type        = string
  default     = "10.0.1.0/24"
}

variable "secondary_subnet_cidr" {
  description = "CIDR block for the second public subnet (another AZ; RDS subnet groups need two)."
  type        = string
  default     = "10.0.2.0/24"
}
