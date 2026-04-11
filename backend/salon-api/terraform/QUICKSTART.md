# Terraform Quick Start Guide

## 5-Minute Setup

### Step 1: Prerequisites Check

```powershell
# Verify Terraform installed
terraform --version

# Verify AWS CLI installed
aws --version

# Verify AWS credentials configured
aws sts get-caller-identity --profile beautlyai-dev
```

Expected output:
```json
{
    "UserId": "AIDA5G2BO7GNHE3Y5AMDB",
    "Account": "907986008474",
    "Arn": "arn:aws:iam::907986008474:user/beautlyai-dev-user"
}
```

### Step 2: Navigate to Terraform Directory

```powershell
cd D:\GitHub\beautlyai-salon\backend\salon-api\terraform
```

### Step 3: Initialize Terraform

```powershell
terraform init
```

This will:
- Download AWS provider plugins
- Initialize `.terraform/` directory
- Create `terraform.lock.hcl` (dependency lock file)

### Step 4: Validate Configuration

```powershell
terraform validate
```

Should output: `Success! The configuration is valid.`

### Step 5: Review Plan

```powershell
terraform plan
```

Review the output to see:
- New AWS IAM policy to be created
- Policy attachment to `beautlyai-dev-user`
- Expected resource names and ARNs

### Step 6: Apply Configuration

```powershell
terraform apply
```

When prompted, type: `yes`

This will:
1. Create `BeautlyAIDeveloperPolicy` in AWS
2. Attach policy to `beautlyai-dev-user`
3. Save state to `terraform.tfstate`

### Step 7: Verify

```powershell
# View outputs
terraform output

# Check policy in AWS CLI
aws iam get-policy `
  --policy-arn arn:aws:iam::907986008474:policy/BeautlyAIDeveloperPolicy

# Check policy attached to user
aws iam list-attached-user-policies `
  --user-name beautlyai-dev-user
```

## Modifying the Policy

### Add New S3 Bucket Permissions

Edit `variables.tf` and add to `s3_buckets`:

```hcl
variable "s3_buckets" {
  type    = list(string)
  default = [
    "beautlyai-dev-uploads",
    "beautlyai-dev-exports",
    "beautlyai-dev-static",
    "beautlyai-dev-new-bucket"  # <-- Add here
  ]
}
```

Then apply:

```powershell
terraform plan
terraform apply
```

### Change AWS Region

Create `terraform.tfvars`:

```hcl
aws_region = "us-west-2"
```

Then apply:

```powershell
terraform plan
terraform apply
```

## Common Commands

```powershell
# Show current resources
terraform show

# Show specific output
terraform output policy_arn

# Destroy everything
terraform destroy

# View resource graph (requires Graphviz)
terraform graph | findstr "beautlyai"

# Reformat code
terraform fmt

# Validate syntax only (without connecting to AWS)
terraform validate

# Check what will be destroyed
terraform plan -destroy
```

## Security Checklist

- [ ] Policy ARN noted and documented
- [ ] User policy attachment confirmed
- [ ] AWS credentials stored securely (~/.aws/credentials with 600 permissions)
- [ ] `terraform.tfvars` never committed to Git
- [ ] `terraform.tfstate` never committed to Git
- [ ] State file backed up safely
- [ ] Access keys rotated as per policy

## Troubleshooting

### Policy Already Exists

```powershell
terraform import aws_iam_policy.beautlyai_developer \
  arn:aws:iam::907986008474:policy/BeautlyAIDeveloperPolicy

terraform apply
```

### User Doesn't Exist

Create user first:

```powershell
aws iam create-user --user-name beautlyai-dev-user
terraform apply
```

### State File Locked

If another developer is applying changes:

```powershell
# Wait for them to finish, then:
terraform refresh
terraform plan
```

### Permission Denied on AWS

Verify you're using correct AWS profile:

```powershell
$env:AWS_PROFILE="beautlyai-dev"
terraform plan
```

## Next Steps

1. ✅ Deploy this IAM policy
2. 🔄 Create S3 buckets (manually or via Terraform)
3. 🔄 Create SQS queues (manually or via Terraform)
4. 🔄 Create SNS topics (manually or via Terraform)
5. 🔄 Create SSM parameters (manually or via Terraform)
6. 🔄 Create ECR repositories (manually or via Terraform)

For a complete infrastructure setup, see `../AWS_DEV_SETUP.md`

## Helpful Links

- **Terraform Docs**: https://www.terraform.io/docs
- **AWS Provider Docs**: https://registry.terraform.io/providers/hashicorp/aws/latest
- **IAM Policy Reference**: https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies.html
- **Terraform Best Practices**: https://www.terraform.io/cloud-docs/recommended-practices

