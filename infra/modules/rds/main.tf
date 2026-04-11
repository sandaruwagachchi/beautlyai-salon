# RDS Module - main.tf

variable "env" {
  type = string
}

variable "db_instance_class" {
  type = string
}

variable "db_name" {
  type = string
}

variable "db_username" {
  type = string
}

variable "db_storage_gb" {
  type = number
}

variable "db_multi_az" {
  type = bool
}

variable "db_backup_retention" {
  type = number
}

variable "vpc_security_group_ids" {
  type = list(string)
}

variable "db_subnet_group_name" {
  type = string
}

# Retrieve DB password from SSM Parameter Store
data "aws_ssm_parameter" "db_password" {
  name            = "/beautlyai/${var.env}/db/password"
  with_decryption = true
}

# RDS Instance
resource "aws_db_instance" "postgres" {
  identifier            = "beautlyai-${var.env}-db"
  engine                = "postgres"
  engine_version        = "15"
  instance_class        = var.db_instance_class
  allocated_storage     = var.db_storage_gb
  storage_type          = "gp2"
  db_name               = var.db_name
  username              = var.db_username
  password              = data.aws_ssm_parameter.db_password.value
  db_subnet_group_name  = var.db_subnet_group_name
  vpc_security_group_ids = var.vpc_security_group_ids

  multi_az                    = var.db_multi_az
  publicly_accessible         = false
  backup_retention_period     = var.db_backup_retention
  backup_window               = "03:00-04:00"
  maintenance_window          = "sun:04:00-sun:05:00"
  copy_tags_to_snapshot       = true
  deletion_protection         = false
  skip_final_snapshot         = true

  enabled_cloudwatch_logs_exports = ["postgresql"]

  tags = {
    Name = "beautlyai-rds-${var.env}"
  }
}

# Outputs
output "db_endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "db_port" {
  value = aws_db_instance.postgres.port
}

output "db_name" {
  value = aws_db_instance.postgres.db_name
}

