variable "project" {
  description = "Project prefix driving resource names and tags. Makes this stack a reusable template."
  type        = string
  default     = "colist"
}

variable "region" {
  description = "AWS region for all resources."
  type        = string
  default     = "us-east-2"
}

variable "github_org" {
  description = "GitHub organization that owns the repository CI authenticates from."
  type        = string
  default     = "heloineto"
}

variable "github_repo" {
  description = "GitHub repository name CI authenticates from."
  type        = string
  default     = "colist"
}

variable "production_branch" {
  description = "Branch whose merges build, deploy and apply the production environment."
  type        = string
  default     = "main"
}
