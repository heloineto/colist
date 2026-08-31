output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.this.id
}

output "public_subnet_id" {
  description = "ID of the single public subnet"
  value       = aws_subnet.public.id
}

output "public_subnet_ids" {
  description = "IDs of both public subnets (two AZs), for RDS subnet groups"
  value       = [aws_subnet.public.id, aws_subnet.public_secondary.id]
}

output "security_group_id" {
  description = "ID of the security group allowing inbound 80/443"
  value       = aws_security_group.this.id
}

output "eip_allocation_id" {
  description = "Allocation ID of the Elastic IP (for association with the instance)"
  value       = aws_eip.this.id
}

output "eip_public_ip" {
  description = "Public IP of the Elastic IP. The production stack points the Route 53 A record at this"
  value       = aws_eip.this.public_ip
}
