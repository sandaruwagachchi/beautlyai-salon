# Terraform Provider Configuration for AWS
# This file configures the AWS provider and sets up backend state storage

terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend configuration for state file (optional, comment out for local state)
  # Uncomment after creating S3 bucket for Terraform state
  # backend "s3" {
  #   bucket         = "beautlyai-terraform-state"
  #   key            = "dev/iam/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-locks"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.environment
      Project     = "BeautlyAI"
      ManagedBy   = "Terraform"
      CreatedDate = timestamp()
    }
  }
}

