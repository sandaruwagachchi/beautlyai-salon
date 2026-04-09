# Infrastructure as Code Guide
## BeautlyAI AWS Terraform Deployment

> AWS Free Tier optimized | Single monorepo approach | Enterprise-ready

---

## 📋 Quick Start

```bash
# Initialize and deploy
cd infra/environments/dev
terraform init
terraform plan -var-file="dev.tfvars"
terraform apply -var-file="dev.tfvars"

# View outputs
terraform output
```

---

## 🏗️ Architecture Overview

### AWS Services Used (Free Tier)

| Service | Configuration | Free Tier Allowance | Usage |
|---------|---|---|---|
| **EC2** | t2.micro, 1 instance | 750 hrs/month | Spring Boot API |
| **RDS** | db.t2.micro PostgreSQL 15 | 750 hrs + 20GB | Database |
| **S3** | 3 buckets (uploads, exports, static) | 5GB storage, 20K GET, 2K PUT | File storage |
| **SQS** | 1 queue | 1M requests/month | Message queue |
| **SNS** | 1 topic | 1M publishes/month | Notifications |
| **Elastic IP** | 1 static IP for EC2 | Free if attached | API endpoint |
| **ECR** | Docker image storage | 500MB/month | Container images |
| **Data Transfer OUT** | Internet to client | 1GB/month | API responses |

**Total Estimated Cost:** $0 for 12 months

---

## 📁 Module Structure

### vpc/main.tf
Creates networking infrastructure:
- 1 VPC (CIDR: 10.0.0.0/16)
- 1 Public Subnet (10.0.1.0/24) for EC2
- 1 Private Subnet (10.0.2.0/24) for RDS
- Internet Gateway for public connectivity
- Route tables & associations

### rds/main.tf
PostgreSQL database configuration:
- Engine: PostgreSQL 15
- Instance: db.t2.micro (free tier)
- Storage: 20 GB gp2
- Publicly Accessible: false (secure)
- Multi-AZ: disabled (free tier)
- Automated Backups: 0 days retention
- DB Password: pulled from SSM Parameter Store

### ecs/main.tf
EC2 instance for Spring Boot:
- Instance Type: t2.micro (free tier)
- AMI: Amazon Linux 2
- Elastic IP: Static public IP
- IAM Role: S3, SQS, SNS, SSM, ECR access
- User Data Script: Installs Docker, Docker Compose
- Security Group: Port 8080 (API), Port 22 (SSH)

### s3/main.tf
Three S3 buckets:

**1. uploads bucket** (Private)
- Purpose: Client/staff photos
- Versioning: Enabled
- Lifecycle: Move to IA after 90 days
- CORS: Configured for mobile upload

**2. exports bucket** (Private)
- Purpose: CSV/PDF reports, payroll
- Auto-delete: 7 days
- No versioning

**3. static bucket** (Public)
- Purpose: Booking site assets, service images
- Public read access via bucket policy
- CloudFront compatible

### sqs-sns/main.tf
Message infrastructure:
- **SQS Queue:** Notifications queue
- **SNS Topic:** Notification topic
- **Subscription:** Topic → Queue
- **Permissions:** SNS → SQS publishing

---

## 🔐 Security Best Practices

### Secrets Management
All sensitive values are stored in **AWS SSM Parameter Store** as SecureString:

```bash
# Never commit secrets to Git!
aws ssm put-parameter \
  --name "/beautlyai/dev/db/password" \
  --type "SecureString" \
  --value "your_password"

# Terraform retrieves at deploy time
data "aws_ssm_parameter" "db_password" {
  name = "/beautlyai/dev/db/password"
  with_decryption = true
}
```

### IAM Least Privilege
EC2 role has minimal permissions:
- ✅ S3: Read/write to dev-* buckets only
- ✅ SQS: Send/receive on dev-* queues only
- ✅ SNS: Publish to dev-* topics only
- ✅ SSM: Read parameters under /beautlyai/dev/
- ✅ ECR: Pull images only
- ❌ No IAM admin permissions
- ❌ No production resource access

### Network Isolation
- RDS in private subnet (no internet)
- EC2 in public subnet for API access
- Security Groups restrict traffic
- SSH access limited (customize in provider.tf)

---

## 📊 Terraform State Management

### Remote State (S3 + DynamoDB)
```hcl
# infra/environments/dev/provider.tf
terraform {
  backend "s3" {
    bucket         = "beautlyai-terraform-state"
    key            = "environments/dev/terraform.tfstate"
    region         = "ap-southeast-1"
    dynamodb_table = "beautlyai-terraform-locks"
    encrypt        = true
  }
}
```

**Why remote state?**
- ✅ Team collaboration
- ✅ State locking (DynamoDB)
- ✅ Encryption at rest
- ✅ Versioning (S3)
- ✅ Avoid local file conflicts

---

## 🛠️ Common Operations

### View Current Infrastructure
```bash
terraform state list
terraform state show aws_instance.api
```

### Modify Infrastructure
```bash
# Change variable and reapply
terraform plan -var-file="dev.tfvars"
terraform apply -var-file="dev.tfvars"

# Example: Upgrade to production
# Edit dev.tfvars:
#   db_instance_class  = "db.t3.micro"
#   ec2_instance_type  = "t3.micro"
```

### Destroy (⚠️ Careful!)
```bash
# Shows what will be deleted
terraform plan -destroy

# Delete all resources (loses data!)
terraform destroy -var-file="dev.tfvars"
```

### Rotate Secrets
```bash
# Update SSM parameter
aws ssm put-parameter \
  --name "/beautlyai/dev/db/password" \
  --type "SecureString" \
  --value "new_password" \
  --overwrite

# Reapply Terraform
terraform apply -var-file="dev.tfvars"
```

---

## 🚀 Upgrading After Free Tier Expires

After 12 months, migrate to paid services (minimal cost):

### Simple Variable Changes
```hcl
# dev.tfvars (after 12 months)
db_instance_class = "db.t3.micro"    # Still cheap
ec2_instance_type = "t3.micro"       # Still cheap
db_multi_az = true                   # Optional high availability
```

### Add Production Features
Create `prod/prod.tfvars`:
```hcl
env = "prod"
db_instance_class = "db.t3.micro"
ec2_instance_type = "t3.small"        # Slightly larger
db_multi_az = true                    # High availability
add_alb = true                        # Load balancer
add_redis_cache = true                # Elasticache
```

### Estimated Monthly Costs (after free tier):
- EC2 t3.micro: ~$5-10
- RDS db.t3.micro: ~$10-15
- S3 (5GB): ~$0.50
- NAT Gateway: ~$30 (optional)
- **Total: $15-55/month** (without NAT)

---

## 🐛 Troubleshooting

### Common Issues

**"Error: UnauthorizedOperation"**
→ AWS credentials not configured. Run: `aws configure`

**"Error: Resource already exists"**
→ Terraform state out of sync. Check AWS Console & update state.

**"RDS still creating after terraform apply"**
→ Normal. RDS takes 5-10 minutes. Wait and run `terraform refresh`

**"EC2 instance won't start Docker"**
→ Check security group allows port 8080. Verify user_data script ran.

**"Can't connect to database from EC2"**
→ Verify security group rules and RDS endpoint. Test with psql client.

### Debug Commands
```bash
# Check Terraform state
terraform state list

# View specific resource
terraform state show aws_instance.api

# Validate syntax
terraform validate

# Check for drift
terraform plan

# View logs
terraform console (interactive debugging)
```

---

## 📚 Additional Resources

- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Free Tier](https://aws.amazon.com/free/)
- [Terraform Best Practices](https://www.terraform.io/cloud-docs/recommended-practices)

---

**Last Updated:** April 2026 | Terraform v1.0+ | AWS ap-southeast-1

