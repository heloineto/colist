output "eip_public_ip" {
  description = "Elastic IP the A record points at"
  value       = module.network.eip_public_ip
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = module.ecs.service_name
}

output "instance_id" {
  description = "EC2 instance ID (SSM target for scripts/db-tunnel.sh)"
  value       = module.compute.instance_id
}

output "db_address" {
  description = "RDS Postgres hostname (private; reach it through scripts/db-tunnel.sh)"
  value       = module.rds.address
}

output "db_master_user_secret_arn" {
  description = "Secrets Manager secret holding the RDS master password"
  value       = module.rds.master_user_secret_arn
}

output "uploads_bucket" {
  description = "S3 bucket for avatars and attachments"
  value       = aws_s3_bucket.uploads.bucket
}

output "zone_id" {
  description = "Route 53 hosted zone ID"
  value       = aws_route53_zone.this.zone_id
}
