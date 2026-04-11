# SQS/SNS Module - main.tf

variable "env" {
  type = string
}

variable "ecs_task_role_name" {
  type        = string
  default     = null
  description = "Optional ECS task role name to attach the notification publisher policy to."
}

locals {
  notification_queue_name     = "beautlyai-notifications.fifo"
  notification_dlq_name       = "beautlyai-notifications-dlq.fifo"
  sms_topic_name              = "beautlyai-sms-alerts"
  push_topic_name             = "beautlyai-push-notifications"
  notification_policy_name    = "beautlyai-notification-publisher"
}

resource "aws_sqs_queue" "notifications_dlq" {
  name                       = local.notification_dlq_name
  fifo_queue                 = true
  content_based_deduplication = true
  message_retention_seconds   = 1209600

  tags = {
    Name        = local.notification_dlq_name
    Environment = var.env
    ManagedBy   = "terraform"
  }
}

resource "aws_sqs_queue" "notifications" {
  name                        = local.notification_queue_name
  fifo_queue                  = true
  content_based_deduplication = true
  visibility_timeout_seconds  = 30
  receive_wait_time_seconds   = 20
  message_retention_seconds   = 1209600

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.notifications_dlq.arn
    maxReceiveCount     = 3
  })

  tags = {
    Name        = local.notification_queue_name
    Environment = var.env
    ManagedBy   = "terraform"
  }
}

resource "aws_sns_topic" "sms_alerts" {
  name = local.sms_topic_name

  tags = {
    Name        = local.sms_topic_name
    Environment = var.env
    ManagedBy   = "terraform"
  }
}

resource "aws_sns_topic" "push_notifications" {
  name = local.push_topic_name

  tags = {
    Name        = local.push_topic_name
    Environment = var.env
    ManagedBy   = "terraform"
  }
}

resource "aws_iam_policy" "notification_publisher" {
  name        = local.notification_policy_name
  description = "Allow publishing notification events to the SQS queue and SNS topics."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage"
        ]
        Resource = aws_sqs_queue.notifications.arn
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = [
          aws_sns_topic.sms_alerts.arn,
          aws_sns_topic.push_notifications.arn
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "notification_publisher" {
  for_each = var.ecs_task_role_name == null ? toset([]) : toset([var.ecs_task_role_name])

  role       = each.value
  policy_arn = aws_iam_policy.notification_publisher.arn
}

output "notification_queue_url" {
  value = aws_sqs_queue.notifications.url
}

output "notification_queue_arn" {
  value = aws_sqs_queue.notifications.arn
}

output "notification_dlq_url" {
  value = aws_sqs_queue.notifications_dlq.url
}

output "notification_dlq_arn" {
  value = aws_sqs_queue.notifications_dlq.arn
}

output "sms_topic_arn" {
  value = aws_sns_topic.sms_alerts.arn
}

output "push_topic_arn" {
  value = aws_sns_topic.push_notifications.arn
}

output "notification_topic_arn" {
  value = aws_sns_topic.sms_alerts.arn
}

output "notification_publisher_policy_arn" {
  value = aws_iam_policy.notification_publisher.arn
}

