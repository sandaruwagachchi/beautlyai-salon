# AWS IAM Policy for BeautlyAI Development — Terraform Resource Definition
# This policy grants least-privilege access to development resources while denying
# production and IAM admin actions. Attach this to the beautlyai-dev-user.

resource "aws_iam_policy" "beautlyai_developer" {
  name        = "BeautlyAIDeveloperPolicy"
  description = "Development policy for BeautlyAI salon API — grants S3/SQS/SNS/SSM/ECR access to dev resources only"

  policy = jsonencode({
    Version = "2012-10-17"

    Statement = [
      # ========== S3: Read/Write Access to Dev Buckets ==========
      {
        Sid    = "S3ReadWriteDevBuckets"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:GetObjectVersion",
          "s3:ListBucket",
          "s3:ListBucketVersions",
          "s3:GetBucketVersioning",
          "s3:GetObjectTagging",
          "s3:PutObjectTagging",
          "s3:DeleteObjectTagging"
        ]
        Resource = [
          "arn:aws:s3:::beautlyai-dev-*",
          "arn:aws:s3:::beautlyai-dev-*/*"
        ]
      },

      # ========== SQS: Send/Receive Messages to Dev Queues ==========
      {
        Sid    = "SQSSendReceiveDevQueues"
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sqs:GetQueueUrl",
          "sqs:ChangeMessageVisibility",
          "sqs:PurgeQueue"
        ]
        Resource = "arn:aws:sqs:*:*:beautlyai-dev-*"
      },

      # ========== SNS: Publish to Dev Topics ==========
      {
        Sid    = "SNSPublishDevTopics"
        Effect = "Allow"
        Action = [
          "sns:Publish",
          "sns:GetTopicAttributes",
          "sns:ListSubscriptionsByTopic"
        ]
        Resource = "arn:aws:sns:*:*:beautlyai-dev-*"
      },

      # ========== SSM Parameter Store: Read Dev Parameters ==========
      {
        Sid    = "SSMReadDevParameters"
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath",
          "ssm:DescribeParameters"
        ]
        Resource = "arn:aws:ssm:*:*:parameter/beautlyai/dev/*"
      },

      # ========== ECR: Pull Images for Dev ==========
      {
        Sid    = "ECRPullDevImages"
        Effect = "Allow"
        Action = [
          "ecr:GetDownloadUrlForLayer",
          "ecr:BatchGetImage",
          "ecr:BatchCheckLayerAvailability",
          "ecr:DescribeImages",
          "ecr:DescribeRepositories",
          "ecr:ListImages"
        ]
        Resource = "arn:aws:ecr:*:*:repository/beautlyai-dev-*"
      },

      # ========== ECR: Auth Token for Registry ==========
      {
        Sid    = "ECRAuthToken"
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken"
        ]
        Resource = "*"
      },

      # ========== CloudWatch Logs: Write Dev Logs ==========
      {
        Sid    = "CloudWatchLogsDevStreams"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = "arn:aws:logs:*:*:log-group:/beautlyai/dev/*"
      },

      # ========== DENY: Production Resources ==========
      {
        Sid    = "DenyProductionResources"
        Effect = "Deny"
        Action = "*"
        Resource = [
          "arn:aws:s3:::beautlyai-prod-*",
          "arn:aws:s3:::beautlyai-prod-*/*",
          "arn:aws:sqs:*:*:beautlyai-prod-*",
          "arn:aws:sns:*:*:beautlyai-prod-*",
          "arn:aws:ssm:*:*:parameter/beautlyai/prod/*",
          "arn:aws:ecr:*:*:repository/beautlyai-prod-*",
          "arn:aws:logs:*:*:log-group:/beautlyai/prod/*"
        ]
      },

      # ========== DENY: IAM Admin Actions ==========
      {
        Sid    = "DenyIAMAdminActions"
        Effect = "Deny"
        Action = [
          "iam:*",
          "organizations:*",
          "account:*",
          "sts:AssumeRole"
        ]
        Resource = "*"
      },

      # ========== DENY: Account & Billing ==========
      {
        Sid    = "DenyAccountAndBilling"
        Effect = "Deny"
        Action = [
          "awsbilling:*",
          "budgets:*",
          "ce:*",
          "cur:*"
        ]
        Resource = "*"
      },

      # ========== DENY: Database Admin ==========
      {
        Sid    = "DenyDatabaseAdmin"
        Effect = "Deny"
        Action = [
          "rds:*",
          "dynamodb:*",
          "elasticache:*"
        ]
        Resource = "*"
      }
    ]
  })
}

# Attach policy to the development user
resource "aws_iam_user_policy_attachment" "beautlyai_dev_user_policy" {
  user       = "beautlyai-dev-user"
  policy_arn = aws_iam_policy.beautlyai_developer.arn
}

