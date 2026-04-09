# SQS/SNS Module - main.tf

variable "env" {
  type = string
}

# SQS Queue for Notifications
resource "aws_sqs_queue" "notifications" {
  name_prefix              = "beautlyai-${var.env}-notifications-"
  delay_seconds            = 0
  max_message_size         = 262144
  message_retention_seconds = 1209600 # 14 days
  receive_wait_time_seconds = 20

  tags = {
    Name = "beautlyai-${var.env}-notifications"
  }
}

# SNS Topic for Notifications
resource "aws_sns_topic" "notifications" {
  name_prefix = "beautlyai-${var.env}-notifications-"

  tags = {
    Name = "beautlyai-${var.env}-notifications"
  }
}

# SNS Topic Subscription to SQS Queue
resource "aws_sns_topic_subscription" "notifications_to_sqs" {
  topic_arn            = aws_sns_topic.notifications.arn
  protocol             = "sqs"
  endpoint             = aws_sqs_queue.notifications.arn
  raw_message_delivery = true
}

# SQS Queue Policy to allow SNS to publish
resource "aws_sqs_queue_policy" "notifications" {
  queue_url = aws_sqs_queue.notifications.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "sns.amazonaws.com"
        }
        Action   = "sqs:SendMessage"
        Resource = aws_sqs_queue.notifications.arn
        Condition = {
          ArnEquals = {
            "aws:SourceArn" = aws_sns_topic.notifications.arn
          }
        }
      }
    ]
  })
}

# Outputs
output "notification_queue_url" {
  value = aws_sqs_queue.notifications.url
}

output "notification_queue_arn" {
  value = aws_sqs_queue.notifications.arn
}

output "notification_topic_arn" {
  value = aws_sns_topic.notifications.arn
}

