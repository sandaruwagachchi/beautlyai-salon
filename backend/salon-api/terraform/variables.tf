# Terraform Variables for BeautlyAI Development Environment

variable "aws_region" {
  type        = string
  description = "AWS region for resource deployment"
  default     = "us-east-1"
}

variable "environment" {
  type        = string
  description = "Environment name (dev, staging, prod)"
  default     = "dev"
}

variable "dev_user_name" {
  type        = string
  description = "IAM username for development access"
  default     = "beautlyai-dev-user"
}

variable "policy_name" {
  type        = string
  description = "Name of the IAM policy"
  default     = "BeautlyAIDeveloperPolicy"
}

variable "s3_buckets" {
  type        = list(string)
  description = "List of S3 bucket names for development"
  default = [
    "beautlyai-dev-uploads",
    "beautlyai-dev-exports",
    "beautlyai-dev-static"
  ]
}

variable "sqs_queues" {
  type        = list(string)
  description = "List of SQS queue names for development"
  default = [
    "beautlyai-dev-notifications",
    "beautlyai-dev-email",
    "beautlyai-dev-export-jobs"
  ]
}

variable "sns_topics" {
  type        = list(string)
  description = "List of SNS topic names for development"
  default = [
    "beautlyai-dev-alerts",
    "beautlyai-dev-notifications",
    "beautlyai-dev-booking-events"
  ]
}

variable "ecr_repositories" {
  type        = list(string)
  description = "List of ECR repository names for development"
  default = [
    "beautlyai-dev-backend",
    "beautlyai-dev-frontend",
    "beautlyai-dev-worker"
  ]
}

variable "tags" {
  type        = map(string)
  description = "Common tags for all resources"
  default = {
    Project     = "BeautlyAI"
    Environment = "dev"
    ManagedBy   = "Terraform"
  }
}

