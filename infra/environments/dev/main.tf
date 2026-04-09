# Main Terraform configuration for dev environment

terraform {
  required_version = ">= 1.0"
}

# VPC Module
module "vpc" {
  source = "../../modules/vpc"

  env        = var.env
  aws_region = var.aws_region
  vpc_cidr   = var.vpc_cidr
}

# RDS Module
module "rds" {
  source = "../../modules/rds"

  env                  = var.env
  db_instance_class    = var.db_instance_class
  db_name              = var.db_name
  db_username          = var.db_username
  db_storage_gb        = var.db_storage_gb
  db_multi_az          = var.db_multi_az
  db_backup_retention  = var.db_backup_retention
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name = aws_db_subnet_group.default.name
}

# ECS Module (EC2 based - free tier compatible)
module "ecs" {
  source = "../../modules/ecs"

  env               = var.env
  instance_type     = var.ec2_instance_type
  vpc_id            = module.vpc.vpc_id
  subnet_id         = module.vpc.public_subnet_id
  security_group_id = aws_security_group.ec2_sg.id
}

# S3 Module
module "s3" {
  source = "../../modules/s3"

  env = var.env
}

# SQS/SNS Module
module "sqs_sns" {
  source = "../../modules/sqs-sns"

  env = var.env
}

# Security Group for RDS
resource "aws_security_group" "rds_sg" {
  name_prefix = "beautlyai-rds-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # VPC CIDR
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "beautlyai-rds-sg"
  }
}

# Security Group for EC2
resource "aws_security_group" "ec2_sg" {
  name_prefix = "beautlyai-ec2-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Spring Boot API"
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Restrict this to your IP in production
    description = "SSH access"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "beautlyai-ec2-sg"
  }
}

# DB Subnet Group
resource "aws_db_subnet_group" "default" {
  name_prefix = "beautlyai-"
  subnet_ids  = [module.vpc.public_subnet_id, module.vpc.private_subnet_id]

  tags = {
    Name = "beautlyai-db-subnet-group"
  }
}

# Outputs
output "ec2_public_ip" {
  value       = module.ecs.instance_public_ip
  description = "EC2 instance public IP"
}

output "rds_endpoint" {
  value       = module.rds.db_endpoint
  description = "RDS database endpoint"
}

output "rds_port" {
  value       = module.rds.db_port
  description = "RDS database port"
}

output "s3_uploads_bucket" {
  value       = module.s3.uploads_bucket_name
  description = "S3 uploads bucket name"
}

output "s3_exports_bucket" {
  value       = module.s3.exports_bucket_name
  description = "S3 exports bucket name"
}

output "s3_static_bucket" {
  value       = module.s3.static_bucket_name
  description = "S3 static bucket name"
}

output "sqs_notification_queue_url" {
  value       = module.sqs_sns.notification_queue_url
  description = "SQS notification queue URL"
}

output "sns_topic_arn" {
  value       = module.sqs_sns.notification_topic_arn
  description = "SNS notification topic ARN"
}

