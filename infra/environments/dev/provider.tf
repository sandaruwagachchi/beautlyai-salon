terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "beautlyai-terraform-state"
    key            = "environments/dev/terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "beautlyai-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = var.env
      Project     = "BeautlyAI"
      Terraform   = "true"
      ManagedBy   = "Terraform"
    }
  }
}

