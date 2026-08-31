data "aws_caller_identity" "current" {}

locals {
  account_id     = data.aws_caller_identity.current.account_id
  ssm_arn_prefix = "arn:aws:ssm:${var.region}:${local.account_id}:parameter/${var.ssm_prefix}"
}

resource "aws_ecs_cluster" "this" {
  name = var.name_prefix

  tags = { Name = var.name_prefix }
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/ecs/${var.name_prefix}"
  retention_in_days = var.log_retention_days

  tags = { Name = var.name_prefix }
}

resource "aws_iam_role" "task_execution" {
  name = "${var.name_prefix}-task-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })

  tags = { Name = "${var.name_prefix}-task-execution" }
}

resource "aws_iam_role_policy_attachment" "task_execution_base" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "task_execution_ssm" {
  name = "${var.name_prefix}-ssm-secrets"
  role = aws_iam_role.task_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["ssm:GetParameters"]
      Resource = [
        for name in var.ssm_secret_names :
        "${local.ssm_arn_prefix}/${name}"
      ]
    }]
  })
}

resource "aws_ecs_task_definition" "this" {
  family             = var.name_prefix
  network_mode       = "host"
  execution_role_arn = aws_iam_role.task_execution.arn
  task_role_arn      = var.task_role_arn

  container_definitions = jsonencode([
    {
      name              = "api"
      image             = "${var.api_repository_url}:${var.image_tag}"
      essential         = true
      memoryReservation = 768
      cpu               = 512
      environment = [
        for name, value in merge(
          { MODE = "production", PORT = tostring(var.api_port) },
          var.api_environment,
        ) : { name = name, value = value }
      ]
      secrets = [
        for name in var.ssm_secret_names : {
          name      = name
          valueFrom = "${local.ssm_arn_prefix}/${name}"
        }
      ]
      healthCheck = {
        command     = ["CMD-SHELL", "bun -e \"const r = await fetch('http://localhost:${var.api_port}/api/health'); process.exit(r.ok ? 0 : 1)\""]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.this.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "api"
        }
      }
    },
    {
      name              = "web"
      image             = "${var.web_repository_url}:${var.image_tag}"
      essential         = true
      memoryReservation = 128
      cpu               = 128
      mountPoints = [
        {
          sourceVolume  = "caddy-data"
          containerPath = "/data"
        },
      ]
      healthCheck = {
        command     = ["CMD-SHELL", "wget -qO- http://localhost:2019/config/ >/dev/null 2>&1 || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 30
      }
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.this.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "web"
        }
      }
    },
  ])

  volume {
    name      = "caddy-data"
    host_path = "/opt/caddy/data"
  }
}

resource "aws_ecs_service" "this" {
  name            = var.name_prefix
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.this.arn
  desired_count   = 1
  launch_type     = "EC2"

  deployment_minimum_healthy_percent = 0
  deployment_maximum_percent         = 100

  # A task that never becomes healthy rolls the service back to the previous revision.
  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  lifecycle {
    ignore_changes = [task_definition]
  }
}
