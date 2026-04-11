# Terraform Configuration for BeautlyAI AWS IAM

This directory contains Terraform Infrastructure-as-Code (IaC) for managing AWS IAM policies and resources for the BeautlyAI Salon API development environment.

## Overview

The Terraform configuration in this directory manages:

- **IAM Policy**: `BeautlyAIDeveloperPolicy` with scoped permissions for development
- **User Policy Attachment**: Attaches the policy to `beautlyai-dev-user`
- **Resource Naming Convention**: All resources must follow `beautlyai-dev-*` pattern
- **Deny Statements**: Explicit denials for production, IAM admin, and billing operations

## File Structure

```
terraform/
├── provider.tf              # AWS provider configuration
├── iam_policy.tf           # Main IAM policy resource definition
├── variables.tf            # Input variables for customization
├── outputs.tf              # Output values for reference
├── terraform.tfvars        # Variable overrides (create from template)
├── terraform.lock.hcl      # Dependency lock file (auto-generated)
└── README.md               # This file
```

## Prerequisites

1. **Terraform CLI** (>= 1.5)
   ```powershell
   # Windows (using Chocolatey)
   choco install terraform
   
   # Or download from https://www.terraform.io/downloads.html
   ```

2. **AWS Credentials** configured locally
   ```powershell
   # Use AWS CLI to configure
   aws configure --profile beautlyai-dev
   
   # Or set environment variables
   $env:AWS_ACCESS_KEY_ID = "AKIA..."
   $env:AWS_SECRET_ACCESS_KEY = "..."
   $env:AWS_REGION = "us-east-1"
   ```

3. **IAM User** must already exist in AWS
   - User ARN: `arn:aws:iam::907986008474:user/beautlyai-dev-user`
   - Requires programmatic access keys (Access Key ID + Secret Access Key)

## Quick Start

### 1. Initialize Terraform

```powershell
cd terraform
terraform init
```

This initializes the Terraform working directory, downloads providers, and sets up backend (if configured).

### 2. Validate Configuration

```powershell
terraform validate
```

Checks that the Terraform configuration is syntactically correct.

### 3. Plan Changes

```powershell
terraform plan
```

Shows what resources will be created/modified/deleted. Review carefully before applying.

### 4. Apply Configuration

```powershell
terraform apply
```

Creates the IAM policy and attaches it to the development user. Type `yes` when prompted.

### 5. Verify

```powershell
terraform output
```

Displays output values including the policy ARN and user name.

## Configuration Details

### BeautlyAIDeveloperPolicy

#### Grants Access To:

**S3 Buckets** (prefixed `beautlyai-dev-*`)
- `s3:GetObject`, `s3:PutObject`, `s3:DeleteObject` — Object operations
- `s3:ListBucket` — List bucket contents
- `s3:GetObjectTagging`, `s3:PutObjectTagging` — Tag management
- `s3:GetBucketVersioning` — Version tracking

**SQS Queues** (prefixed `beautlyai-dev-*`)
- `sqs:SendMessage` — Enqueue jobs
- `sqs:ReceiveMessage` — Dequeue jobs
- `sqs:DeleteMessage` — Remove processed messages
- `sqs:GetQueueAttributes` — Queue metadata
- `sqs:ChangeMessageVisibility` — Extend visibility timeout

**SNS Topics** (prefixed `beautlyai-dev-*`)
- `sns:Publish` — Send messages to topics
- `sns:GetTopicAttributes` — Retrieve topic metadata
- `sns:ListSubscriptionsByTopic` — View subscribers

**SSM Parameter Store** (path `/beautlyai/dev/*`)
- `ssm:GetParameter` — Retrieve single parameters
- `ssm:GetParameters` — Retrieve multiple parameters
- `ssm:GetParametersByPath` — Retrieve parameters by path
- `ssm:DescribeParameters` — List parameters

**ECR Repositories** (prefixed `beautlyai-dev-*`)
- `ecr:BatchGetImage` — Pull Docker images
- `ecr:GetDownloadUrlForLayer` — Download image layers
- `ecr:GetAuthorizationToken` — Authenticate with registry

**CloudWatch Logs** (path `/beautlyai/dev/*`)
- `logs:CreateLogGroup`, `logs:CreateLogStream` — Create log infrastructure
- `logs:PutLogEvents` — Write log entries
- `logs:DescribeLogGroups`, `logs:DescribeLogStreams` — Read log metadata

#### Denies Access To:

1. **Production Resources** — All `beautlyai-prod-*` resources
2. **IAM Operations** — User/group/role management, assume role
3. **Account Operations** — Account settings, organizations
4. **Billing Operations** — Cost management, budgets
5. **Database Admin** — RDS, DynamoDB, ElastiCache operations

## Usage Examples

### Deploy IAM Policy

```powershell
cd terraform
terraform apply
```

### Update Variable Values

Create `terraform.tfvars`:

```hcl
aws_region  = "us-west-2"
environment = "dev"

s3_buckets = [
  "beautlyai-dev-uploads",
  "beautlyai-dev-exports",
  "beautlyai-dev-static",
  "beautlyai-dev-reports"
]

sqs_queues = [
  "beautlyai-dev-notifications",
  "beautlyai-dev-email",
  "beautlyai-dev-export-jobs",
  "beautlyai-dev-payment-processing"
]
```

Then apply:

```powershell
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

### View Current State

```powershell
terraform show
```

### Destroy Resources (if needed)

```powershell
terraform destroy
```

**WARNING**: This will delete the IAM policy and detach it from the user.

## Security Considerations

### ✅ Best Practices Implemented

- **Least Privilege**: Only grants necessary permissions
- **Resource Scoping**: Uses resource ARNs with wildcards, not `*`
- **Explicit Denies**: Uses deny statements for production and admin operations
- **Separation of Concerns**: Development policy separate from production
- **Immutable IaC**: Policy defined in code, version controlled

### ⚠️ Additional Security Measures

1. **Rotate Access Keys** annually
   ```powershell
   aws iam create-access-key --user-name beautlyai-dev-user
   aws iam delete-access-key --user-name beautlyai-dev-user --access-key-id AKIA...
   ```

2. **Enable MFA** for AWS Console access
   ```powershell
   aws iam enable-mfa-device --user-name beautlyai-dev-user --serial-number arn:aws:iam::907986008474:mfa/beautlyai-dev-user --authentication-code1 123456 --authentication-code2 654321
   ```

3. **Monitor Usage** with CloudTrail
   ```powershell
   aws cloudtrail get-trail-status --name beautlyai-cloudtrail
   ```

4. **Store Secrets** securely
   - Never commit AWS keys to Git
   - Use AWS Secrets Manager for sensitive data
   - Use `~/.aws/credentials` with `600` file permissions
   - Prefer IAM roles over access keys when possible

## Troubleshooting

### Error: "Error updating IAM policy: EntityAlreadyExists"

**Cause**: Policy already exists in AWS (created previously)

**Solution**:
```powershell
# Import existing policy into Terraform state
terraform import aws_iam_policy.beautlyai_developer arn:aws:iam::907986008474:policy/BeautlyAIDeveloperPolicy
```

### Error: "Error attaching policy: NoSuchEntity"

**Cause**: User `beautlyai-dev-user` doesn't exist in AWS

**Solution**:
```powershell
# Create user manually via AWS Console or:
aws iam create-user --user-name beautlyai-dev-user

# Then apply Terraform
terraform apply
```

### Error: "InvalidParameterValue: Invalid length for parameter"

**Cause**: Policy name too long (max 128 characters)

**Solution**: Shorten `policy_name` variable in `variables.tf`

### State File Conflicts

If multiple developers apply simultaneously:

1. Use **remote state** with S3 + DynamoDB locking
2. See commented backend config in `provider.tf`
3. Create state infrastructure:
   ```powershell
   # Create S3 bucket
   aws s3api create-bucket --bucket beautlyai-terraform-state --region us-east-1
   
   # Enable versioning
   aws s3api put-bucket-versioning --bucket beautlyai-terraform-state --versioning-configuration Status=Enabled
   
   # Block public access
   aws s3api put-public-access-block --bucket beautlyai-terraform-state --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
   
   # Create DynamoDB table for locking
   aws dynamodb create-table \
     --table-name terraform-locks \
     --attribute-definitions AttributeName=LockID,AttributeType=S \
     --key-schema AttributeName=LockID,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST
   ```

## Maintenance

### Update Terraform Version

```powershell
terraform -v

# Check for provider updates
terraform init -upgrade
```

### View Resource Graph

```powershell
terraform graph | findstr "BeautlyAI"
```

### Backup State File

```powershell
Copy-Item terraform.tfstate terraform.tfstate.backup
```

## Related Documentation

- [AWS IAM Policy Structure](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [BeautlyAI AWS Setup Guide](../AWS_DEV_SETUP.md)
- [BeautlyAI AGENTS.md](../AGENTS.md)

## Support

For issues or questions:

1. Check `terraform plan` output for specific errors
2. Review AWS IAM console for policy details
3. Check AWS CloudTrail for API errors
4. See [Terraform Troubleshooting Docs](https://www.terraform.io/docs/language/functions/index.html)

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-04-08 | v1.0 | Initial policy creation with S3/SQS/SNS/SSM/ECR/Logs grants |

## License

Part of BeautlyAI Salon API project. Managed by Terraform.

---

**Last Updated**: April 8, 2026  
**Maintained By**: DevOps Team  
**Status**: ✅ Production Ready

