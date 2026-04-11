# S3 Module - main.tf

variable "env" {
  type = string
}

# S3 Bucket - Uploads (Client photos, before/after images, staff photos)
resource "aws_s3_bucket" "uploads" {
  bucket_prefix = "beautlyai-${var.env}-uploads-"

  tags = {
    Name = "beautlyai-${var.env}-uploads"
  }
}

resource "aws_s3_bucket_versioning" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "uploads" {
  bucket = aws_s3_bucket.uploads.id

  rule {
    id     = "move-to-ia"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }
  }
}

# S3 Bucket - Exports (CSV/PDF exports, reports)
resource "aws_s3_bucket" "exports" {
  bucket_prefix = "beautlyai-${var.env}-exports-"

  tags = {
    Name = "beautlyai-${var.env}-exports"
  }
}

resource "aws_s3_bucket_public_access_block" "exports" {
  bucket = aws_s3_bucket.exports.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "exports" {
  bucket = aws_s3_bucket.exports.id

  rule {
    id     = "auto-delete-after-7-days"
    status = "Enabled"

    expiration {
      days = 7
    }
  }
}

# S3 Bucket - Static (Public, booking site assets, service images)
resource "aws_s3_bucket" "static" {
  bucket_prefix = "beautlyai-${var.env}-static-"

  tags = {
    Name = "beautlyai-${var.env}-static"
  }
}

resource "aws_s3_bucket_public_access_block" "static" {
  bucket = aws_s3_bucket.static.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "static" {
  bucket = aws_s3_bucket.static.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = "*"
        Action = "s3:GetObject"
        Resource = "${aws_s3_bucket.static.arn}/*"
      }
    ]
  })
}

# Outputs
output "uploads_bucket_name" {
  value = aws_s3_bucket.uploads.id
}

output "uploads_bucket_arn" {
  value = aws_s3_bucket.uploads.arn
}

output "exports_bucket_name" {
  value = aws_s3_bucket.exports.id
}

output "exports_bucket_arn" {
  value = aws_s3_bucket.exports.arn
}

output "static_bucket_name" {
  value = aws_s3_bucket.static.id
}

output "static_bucket_arn" {
  value = aws_s3_bucket.static.arn
}

