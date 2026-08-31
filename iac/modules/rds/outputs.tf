output "endpoint" {
  description = "Host:port of the instance"
  value       = aws_db_instance.this.endpoint
}

output "address" {
  description = "Hostname of the instance"
  value       = aws_db_instance.this.address
}

output "port" {
  description = "Port of the instance"
  value       = aws_db_instance.this.port
}

output "master_user_secret_arn" {
  description = "Secrets Manager secret holding the RDS-managed master password"
  value       = aws_db_instance.this.master_user_secret[0].secret_arn
}

output "security_group_id" {
  description = "Security group of the instance (inbound 5432)"
  value       = aws_security_group.this.id
}
