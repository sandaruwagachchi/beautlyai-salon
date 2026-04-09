# ECS Module - main.tf (EC2-based, free tier compatible)

variable "env" {
  type = string
}

variable "instance_type" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_id" {
  type = string
}

variable "security_group_id" {
  type = string
}

# Elastic IP
resource "aws_eip" "api" {
  domain = "vpc"

  tags = {
    Name = "beautlyai-api-eip-${var.env}"
  }

  depends_on = [aws_instance.api]
}

# EC2 Instance for Spring Boot API
resource "aws_instance" "api" {
  ami                    = data.aws_ami.amazon_linux_2.id
  instance_type          = var.instance_type
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [var.security_group_id]

  associate_public_ip_address = true

  iam_instance_profile = aws_iam_instance_profile.api.name

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    env = var.env
  }))

  tags = {
    Name = "beautlyai-api-${var.env}"
  }

  root_block_device {
    volume_size = 20
    volume_type = "gp2"
  }
}

# Associate Elastic IP
resource "aws_eip_association" "api" {
  instance_id      = aws_instance.api.id
  allocation_id    = aws_eip.api.id
}

# IAM Role for EC2
resource "aws_iam_role" "api" {
  name_prefix = "beautlyai-api-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Principal"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# IAM Policy for S3, SQS, SNS, SSM access
resource "aws_iam_role_policy" "api" {
  name_prefix = "beautlyai-api-"
  role        = aws_iam_role.api.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "arn:aws:s3:::beautlyai-${var.env}-*/*"
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage"
        ]
        Resource = "arn:aws:sqs:*:*:beautlyai-${var.env}-*"
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = "arn:aws:sns:*:*:beautlyai-${var.env}-*"
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath"
        ]
        Resource = "arn:aws:ssm:*:*:parameter/beautlyai/${var.env}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchGetImage",
          "ecr:GetDownloadUrlForLayer"
        ]
        Resource = "*"
      }
    ]
  })
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "api" {
  name_prefix = "beautlyai-api-"
  role        = aws_iam_role.api.name
}

# Data source for latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Outputs
output "instance_id" {
  value = aws_instance.api.id
}

output "instance_public_ip" {
  value = aws_instance.api.public_ip
}

output "instance_private_ip" {
  value = aws_instance.api.private_ip
}

output "elastic_ip" {
  value = aws_eip.api.public_ip
}

