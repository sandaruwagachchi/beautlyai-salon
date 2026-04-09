# Terraform Outputs for BeautlyAI IAM Resources

output "policy_arn" {
  description = "ARN of the BeautlyAIDeveloperPolicy"
  value       = aws_iam_policy.beautlyai_developer.arn
}

output "policy_id" {
  description = "ID of the BeautlyAIDeveloperPolicy"
  value       = aws_iam_policy.beautlyai_developer.id
}

output "policy_name" {
  description = "Name of the BeautlyAIDeveloperPolicy"
  value       = aws_iam_policy.beautlyai_developer.name
}

output "user_name" {
  description = "IAM user name with policy attached"
  value       = "beautlyai-dev-user"
}

output "policy_attachment_id" {
  description = "ID of the policy attachment"
  value       = aws_iam_user_policy_attachment.beautlyai_dev_user_policy.id
}

output "aws_region" {
  description = "AWS region configured for deployment"
  value       = var.aws_region
}

output "terraform_info" {
  description = "Information about this Terraform configuration"
  value = {
    project    = "BeautlyAI Salon API"
    managed_by = "Terraform"
    environment = var.environment
    policy_grants = [
      "S3: Read/Write to beautlyai-dev-* buckets",
      "SQS: Send/Receive from beautlyai-dev-* queues",
      "SNS: Publish to beautlyai-dev-* topics",
      "SSM: Read /beautlyai/dev/* parameters",
      "ECR: Pull images from beautlyai-dev-* repositories",
      "CloudWatch: Write to /beautlyai/dev/* logs"
    ]
    deny_actions = [
      "All production resources (beautlyai-prod-*)",
      "IAM admin actions",
      "Account/billing operations",
      "Database admin operations"
    ]
  }
}

