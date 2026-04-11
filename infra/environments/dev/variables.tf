# Variables for dev environment

variable "env" {
  type        = string
  description = "Environment name"
  default     = "dev"
}

variable "aws_region" {
  type        = string
  description = "AWS region"
  default     = "ap-southeast-1"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for VPC"
  default     = "10.0.0.0/16"
}

variable "db_instance_class" {
  type        = string
  description = "RDS instance class (free tier: db.t2.micro)"
  default     = "db.t2.micro"
}

variable "db_name" {
  type        = string
  description = "RDS database name"
  default     = "beautlyai_dev"
}

variable "db_username" {
  type        = string
  description = "RDS master username"
  default     = "beautlyai_admin"
}

variable "db_storage_gb" {
  type        = number
  description = "RDS storage in GB (free tier: 20GB)"
  default     = 20
}

variable "db_multi_az" {
  type        = bool
  description = "Multi-AZ deployment (free tier: false)"
  default     = false
}

variable "db_backup_retention" {
  type        = number
  description = "Backup retention days (free tier: 0)"
  default     = 0
}

variable "ec2_instance_type" {
  type        = string
  description = "EC2 instance type (free tier: t2.micro)"
  default     = "t2.micro"
}

