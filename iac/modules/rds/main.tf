resource "aws_db_subnet_group" "this" {
  name       = var.name_prefix
  subnet_ids = var.subnet_ids

  tags = { Name = var.name_prefix }
}

resource "aws_security_group" "this" {
  name        = "${var.name_prefix}-db"
  description = "Postgres from the API instance only."
  vpc_id      = var.vpc_id

  tags = { Name = "${var.name_prefix}-db" }
}

resource "aws_vpc_security_group_ingress_rule" "app" {
  security_group_id            = aws_security_group.this.id
  description                  = "Postgres from the API security group"
  referenced_security_group_id = var.app_security_group_id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
}

resource "aws_db_parameter_group" "this" {
  name   = var.name_prefix
  family = "postgres${var.engine_version}"

  parameter {
    name  = "rds.force_ssl"
    value = "1"
  }

  tags = { Name = var.name_prefix }
}

resource "aws_db_instance" "this" {
  identifier = var.name_prefix

  engine         = "postgres"
  engine_version = var.engine_version
  instance_class = var.instance_class

  allocated_storage = var.allocated_storage
  storage_type      = "gp3"
  storage_encrypted = true

  db_name                     = var.database_name
  username                    = var.master_username
  manage_master_user_password = true

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.this.id]
  parameter_group_name   = aws_db_parameter_group.this.name
  publicly_accessible    = false
  multi_az               = false

  backup_retention_period   = var.backup_retention_days
  deletion_protection       = true
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.name_prefix}-final"

  tags = { Name = var.name_prefix }
}

# The API reads a copy of the master password from SSM at task start, so the
# default 7-day automatic rotation breaks every DB connection until SSM is
# re-synced and the service redeployed. Keep the password static; rotate on
# purpose with `aws rds modify-db-instance --rotate-master-user-password`,
# then re-run the SSM stage of scripts/setup-aws-prod.sh and force a deploy.
resource "aws_secretsmanager_secret_rotation" "master" {
  secret_id        = aws_db_instance.this.master_user_secret[0].secret_arn
  rotation_enabled = false
}
