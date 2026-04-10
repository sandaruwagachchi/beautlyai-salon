# Terraform Configuration Index & Reference

## Quick Navigation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| **QUICKSTART.md** | 5-minute setup guide | 5 min |
| **README.md** | Comprehensive documentation | 15 min |
| **IMPLEMENTATION_SUMMARY.md** | Overview & checklist | 10 min |
| **iam_policy.tf** | Main policy resource | - |
| **provider.tf** | AWS configuration | - |
| **variables.tf** | Customizable inputs | - |
| **outputs.tf** | Output values | - |
| **terraform.tfvars.example** | Config template | - |
| **resources.tf.optional** | S3/SQS/SNS/ECR resources | 10 min |

---

## 🚀 Start Here

### First Time Setup (10 minutes)

1. **Read**: `QUICKSTART.md`
2. **Run**: `terraform init`
3. **Review**: `terraform plan`
4. **Deploy**: `terraform apply`
5. **Verify**: `terraform output`

### Detailed Learning (30 minutes)

1. **Overview**: This file (INDEX.md)
2. **Concepts**: `README.md` — Comprehensive guide
3. **Implementation**: `IMPLEMENTATION_SUMMARY.md`

---

## 📁 File Descriptions

### Core Terraform Files

#### `iam_policy.tf`
**Purpose**: Define IAM policy and attachment  
**Contains**:
- `aws_iam_policy` — BeautlyAIDeveloperPolicy resource
- `aws_iam_user_policy_attachment` — Attach to beautlyai-dev-user
- Policy statements: S3, SQS, SNS, SSM, ECR, CloudWatch Logs
- Deny statements: Production, IAM admin, Billing, Database

**Key Lines**:
```terraform
resource "aws_iam_policy" "beautlyai_developer" {
  name = "BeautlyAIDeveloperPolicy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [ ... ]
  })
}
```

**When to Edit**: When adding new AWS services or permissions

---

#### `provider.tf`
**Purpose**: Configure AWS provider and backend  
**Contains**:
- Terraform version requirement (>= 1.5)
- AWS provider version (~> 5.0)
- AWS provider configuration
- Default tags for all resources
- Backend configuration (S3, optional)

**Key Lines**:
```terraform
terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags { tags = { ... } }
}
```

**When to Edit**: 
- When changing AWS region
- When setting up remote state
- When modifying default tags

---

#### `variables.tf`
**Purpose**: Define input variables  
**Contains**:
- AWS region (default: us-east-1)
- Environment name (default: dev)
- IAM user name
- Policy name
- Lists of S3 buckets, SQS queues, SNS topics, ECR repos
- Common tags

**Example Variable**:
```terraform
variable "s3_buckets" {
  type        = list(string)
  description = "List of S3 bucket names"
  default     = [ "beautlyai-dev-uploads", ... ]
}
```

**When to Edit**: 
- When changing resource names
- When adding new resources to lists
- When modifying default values

---

#### `outputs.tf`
**Purpose**: Display important values after deployment  
**Contains**:
- Policy ARN
- Policy ID
- Policy name
- User name
- Terraform metadata

**Example Output**:
```terraform
output "policy_arn" {
  description = "ARN of BeautlyAIDeveloperPolicy"
  value       = aws_iam_policy.beautlyai_developer.arn
}
```

**View Results**: `terraform output` or `terraform output policy_arn`

---

### Configuration Files

#### `terraform.tfvars.example`
**Purpose**: Template for variable overrides  
**Contains**: Example values for all variables in `variables.tf`  
**Usage**: 
```powershell
Copy-Item terraform.tfvars.example terraform.tfvars
notepad terraform.tfvars  # Edit with your values
terraform apply -var-file=terraform.tfvars
```

**When to Use**: When customizing region, resource names, or tags

---

### Optional Resources

#### `resources.tf.optional`
**Purpose**: Complete infrastructure setup (S3, SQS, SNS, ECR, SSM)  
**Contains**:
- 3 S3 buckets (uploads, exports, static)
- 3 SQS queues (notifications, email, export-jobs)
- 3 SNS topics (alerts, notifications, booking-events)
- 3 ECR repositories (backend, frontend, worker)
- 2 SSM parameters (db-password, jwt-secret)

**Usage**: Copy to `resources.tf` if you want complete infrastructure:
```powershell
Copy-Item resources.tf.optional resources.tf
terraform plan
terraform apply
```

**Requires**: Additional variables for secrets (db_password, jwt_secret)

---

### Documentation Files

#### `README.md` (1500+ lines)
**Sections**:
1. Overview
2. File structure & prerequisites
3. Quick start (5 steps)
4. Configuration details (all permissions)
5. Security considerations
6. Usage examples
7. Troubleshooting
8. Maintenance
9. Support

**Read**: When you need comprehensive understanding

---

#### `QUICKSTART.md`
**Sections**:
1. Prerequisites check (5 lines)
2. 7-step deployment
3. Modifying the policy
4. Common commands
5. Security checklist
6. Troubleshooting (5 scenarios)
7. Next steps

**Read**: For 5-minute setup

---

#### `IMPLEMENTATION_SUMMARY.md`
**Sections**:
1. Overview
2. Files created (with examples)
3. Policy grants (detailed breakdown)
4. How to use
5. Security features
6. File structure
7. Integration with BeautlyAI
8. Troubleshooting
9. Validation checklist

**Read**: For complete overview

---

#### `terraform-gitignore`
**Purpose**: Git ignore rules for Terraform  
**Excludes**:
- `.terraform/` — Downloaded plugins
- `*.tfstate` — State files with secrets
- `terraform.tfvars` — Variable overrides
- `aws_credentials` — AWS credential files
- `.env` files — Environment variables

**Usage**: Copy to project root `.gitignore` or use separately

---

#### `beautlyai-developer-policy.json`
**Purpose**: Standalone IAM policy JSON  
**Contents**: Complete policy statements without Terraform

**Usage**: 
- Reference for what policy does
- Manual upload to AWS Console
- Integration with other IaC tools

---

### Generated Files (After `terraform init`)

After running `terraform init`, these files are auto-generated:

| File | Purpose |
|------|---------|
| `.terraform/` | Downloaded provider plugins |
| `.terraform.lock.hcl` | Dependency lock file (commit to Git!) |
| `terraform.tfstate` | Current state (don't commit) |
| `terraform.tfstate.backup` | Previous state backup (don't commit) |

---

## 🔄 Workflow

### Initial Deployment

```
1. terraform init           # Initialize .terraform/
   ↓
2. terraform validate       # Check syntax
   ↓
3. terraform plan          # Review changes (DRY RUN)
   ↓
4. terraform apply         # Deploy to AWS
   ↓
5. terraform output        # View results
```

### Updates

```
1. Edit iam_policy.tf      # Modify policy
   ↓
2. terraform plan          # Review changes
   ↓
3. terraform apply         # Deploy updates
```

### Adding Resources

```
1. Copy resources.tf.optional → resources.tf
   ↓
2. Add variables to variables.tf
   ↓
3. Add values to terraform.tfvars
   ↓
4. terraform plan
   ↓
5. terraform apply
```

---

## 🔐 Security by Design

### ✅ Implemented

- **Least Privilege**: Only necessary permissions granted
- **Resource Scoping**: ARNs with patterns, not wildcards
- **Explicit Denies**: Production/admin/billing denied
- **Version Control**: Policy tracked in Git
- **Infrastructure as Code**: Reproducible, auditable

### ⚠️ Additional Measures

```powershell
# Enable MFA
aws iam enable-mfa-device --user-name beautlyai-dev-user ...

# Rotate keys (annually)
aws iam create-access-key --user-name beautlyai-dev-user
aws iam delete-access-key --user-name beautlyai-dev-user --access-key-id AKIA...

# Use remote state with locking
# (Uncomment backend in provider.tf)

# Monitor access
aws cloudtrail describe-trails
```

---

## 📊 Permissions Matrix

### Allowed

| Service | Permission | Resources |
|---------|-----------|-----------|
| **S3** | Read/Write/Delete | `beautlyai-dev-*` buckets |
| **SQS** | Send/Receive/Delete | `beautlyai-dev-*` queues |
| **SNS** | Publish | `beautlyai-dev-*` topics |
| **SSM** | GetParameter | `/beautlyai/dev/*` paths |
| **ECR** | BatchGetImage/Pull | `beautlyai-dev-*` repos |
| **Logs** | Write/Create | `/beautlyai/dev/*` groups |

### Denied

| Service | Action |
|---------|--------|
| **All** | Production resources (`beautlyai-prod-*`) |
| **IAM** | All actions (create/delete/modify users/roles) |
| **Account** | Account settings, organizations |
| **Billing** | Cost management, budgets |
| **Database** | RDS, DynamoDB, ElastiCache admin |

---

## 🛠️ Common Commands

### Initialization
```powershell
terraform init              # Initialize
terraform init -upgrade     # Update provider versions
```

### Validation
```powershell
terraform validate          # Check syntax
terraform fmt               # Format code
terraform plan              # Review changes (dry-run)
```

### Deployment
```powershell
terraform apply             # Deploy
terraform apply -auto-approve  # Skip confirmation
terraform destroy            # Destroy resources
```

### Inspection
```powershell
terraform show              # Show current state
terraform output            # Show outputs
terraform state list        # List resources
terraform state show <name> # Show resource details
terraform graph             # Show resource graph
```

---

## 🐛 Troubleshooting Matrix

| Problem | Cause | Solution |
|---------|-------|----------|
| Policy already exists | Deployed previously | `terraform import` |
| User doesn't exist | User not created yet | Create via AWS CLI/Console |
| State locked | Another developer applying | Wait ~10 minutes |
| Credentials fail | AWS profile not set | `$env:AWS_PROFILE="beautlyai-dev"` |
| Permission denied | IAM policy insufficient | Check policy attachment |

See `README.md` Troubleshooting section for detailed solutions.

---

## 📚 Documentation Hierarchy

```
INDEX.md (You are here)
├── QUICKSTART.md         (5 min: Deploy immediately)
├── IMPLEMENTATION_SUMMARY.md  (10 min: Overview & validation)
├── README.md             (15 min: Comprehensive guide)
└── Resources
    ├── iam_policy.tf     (Core policy)
    ├── provider.tf       (AWS config)
    ├── variables.tf      (Inputs)
    ├── outputs.tf        (Outputs)
    └── resources.tf.optional  (S3/SQS/SNS/ECR)
```

**Recommended Reading Order**:
1. **First time**: QUICKSTART.md → run `terraform apply`
2. **Learning**: INDEX.md → README.md
3. **Understanding**: IMPLEMENTATION_SUMMARY.md → review outputs
4. **Advanced**: Reference resources.tf.optional for complete setup

---

## 🎯 Next Steps

### Immediate (Now)
1. Read `QUICKSTART.md`
2. Run `terraform init`
3. Run `terraform plan`
4. Run `terraform apply`

### Short-term (Today)
1. Verify policy in AWS Console
2. Test with AWS CLI: `aws s3 ls --profile beautlyai-dev`
3. Document ARN for team

### Medium-term (This Week)
1. Create S3 buckets (use resources.tf.optional)
2. Create SQS queues
3. Create SNS topics
4. Create SSM parameters
5. Configure Spring Boot to use AWS resources

### Long-term (Before Production)
1. Set up remote state with S3 + DynamoDB
2. Enable MFA for IAM user
3. Plan key rotation schedule
4. Set up CloudTrail logging
5. Implement proper CI/CD secrets management

---

## 📞 Support Resources

| Resource | Link |
|----------|------|
| **Terraform Docs** | https://www.terraform.io/docs |
| **AWS Provider** | https://registry.terraform.io/providers/hashicorp/aws/latest |
| **IAM Policies** | https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html |
| **BeautlyAI AGENTS** | `../AGENTS.md` |
| **AWS Setup Guide** | `../AWS_DEV_SETUP.md` |
| **AWS Setup Checklist** | `../AWS_SETUP_CHECKLIST.md` |

---

## ✅ Validation Checklist

- [ ] Read QUICKSTART.md
- [ ] Terraform CLI installed (>= 1.5)
- [ ] AWS CLI configured with beautlyai-dev profile
- [ ] Ran `terraform init`
- [ ] Reviewed `terraform plan` output
- [ ] Ran `terraform apply`
- [ ] Verified policy in AWS Console
- [ ] Noted policy ARN
- [ ] Shared policy ARN with team
- [ ] Reviewed this INDEX.md

---

## 📋 Version History

| Date | Version | Changes |
|------|---------|---------|
| 2026-04-08 | v1.0 | Initial Terraform configuration |

---

## Summary

This Terraform configuration provides **Infrastructure as Code** for BeautlyAI's development IAM policy:

✅ **S3**: Read/write to `beautlyai-dev-*` buckets  
✅ **SQS**: Send/receive from `beautlyai-dev-*` queues  
✅ **SNS**: Publish to `beautlyai-dev-*` topics  
✅ **SSM**: Read `/beautlyai/dev/*` parameters  
✅ **ECR**: Pull from `beautlyai-dev-*` repositories  
✅ **CloudWatch**: Write to `/beautlyai/dev/*` logs  

❌ **DENY**: All production, IAM admin, and billing actions

**Status**: ✅ Ready to Deploy

---

**Created**: April 8, 2026  
**For**: BeautlyAI Development Team  
**Maintained By**: DevOps / Infrastructure Team

