# AWS Development Environment Setup — BeautlyAI Salon API

**Date Created**: April 8, 2026  
**Account ID**: 907986008474  
**Region**: us-east-1 (default)

---

## Overview

This document outlines the AWS IAM setup for local development of the BeautlyAI Salon API. A scoped IAM user (`beautlyai-dev-user`) has been created with minimal permissions to reduce blast radius if credentials are accidentally exposed.

## IAM User Created

**User Name**: `beautlyai-dev-user`  
**User ARN**: `arn:aws:iam::907986008474:user/beautlyai-dev-user`  
**User ID**: `AIDA5G2BO7GNHE3Y5AMDB`  
**Created**: 2026-04-08T08:53:32+00:00

### Access Keys

| Key | Value |
|-----|-------|
| **Access Key ID** | `<AWS_ACCESS_KEY_ID>` |
| **Secret Access Key** | `<AWS_SECRET_ACCESS_KEY>` |
| **Status** | Active |
| **Created** | 2026-04-08T09:38:39+00:00 |

⚠️ **SECURITY WARNING**: The secret access key is displayed above **only once**. Store it securely in:
- AWS Credentials file: `~/.aws/credentials` (Linux/Mac) or `%USERPROFILE%\.aws\credentials` (Windows)
- AWS SSM Parameter Store (for production)
- Your organization's secure credential management system

**Never commit these credentials to Git.**

---

## IAM Policy: BeautlyAIDeveloperPolicy

**Policy Name**: `BeautlyAIDeveloperPolicy`  
**Policy ARN**: `arn:aws:iam::907986008474:policy/BeautlyAIDeveloperPolicy`  
**Policy ID**: `ANPA5G2BO7GNAZVCN6CM5`

### Permissions Granted

#### 1. **S3 Buckets** (beautlyai-dev-*)
- `s3:GetObject` — Read files from dev buckets
- `s3:PutObject` — Upload files to dev buckets
- `s3:DeleteObject` — Delete files from dev buckets
- `s3:ListBucket` — List contents of dev buckets

**Resources**:
- `arn:aws:s3:::beautlyai-dev-*`
- `arn:aws:s3:::beautlyai-dev-*/*`

#### 2. **SQS Queues** (beautlyai-dev-*)
- `sqs:SendMessage` — Send messages to dev queues
- `sqs:ReceiveMessage` — Receive messages from dev queues
- `sqs:DeleteMessage` — Delete messages from dev queues
- `sqs:GetQueueAttributes` — Read queue metadata

**Resources**:
- `arn:aws:sqs:*:*:beautlyai-dev-*`

#### 3. **SNS Topics** (beautlyai-dev-*)
- `sns:Publish` — Publish to dev topics

**Resources**:
- `arn:aws:sns:*:*:beautlyai-dev-*`

#### 4. **SSM Parameter Store** (/beautlyai/dev/*)
- `ssm:GetParameter` — Read a single parameter
- `ssm:GetParameters` — Read multiple parameters
- `ssm:GetParametersByPath` — Read parameters by path

**Resources**:
- `arn:aws:ssm:*:*:parameter/beautlyai/dev/*`

**Use Case**: Reading environment secrets (DB password, Stripe keys, JWT secret) from Parameter Store.

#### 5. **ECR (Elastic Container Registry)**
- `ecr:GetDownloadUrlForLayer` — Download image layers
- `ecr:BatchGetImage` — Pull Docker images
- `ecr:BatchCheckLayerAvailability` — Check layer existence

**Resources**:
- `arn:aws:ecr:*:*:repository/beautlyai-*`

**Use Case**: Pulling dev/test Docker images for local development.

### Permissions Denied (Explicit)

#### 1. **IAM Actions** (All)
- `iam:*` — Cannot modify IAM users, roles, or policies
- `organizations:*` — Cannot access AWS Organizations

**Security Rationale**: Prevents privilege escalation if credentials are compromised.

---

## Local Development Setup

### Step 1: Configure AWS Credentials

#### Option A: AWS Credentials File (Recommended)

Create or update `~/.aws/credentials` (Linux/Mac) or `%USERPROFILE%\.aws\credentials` (Windows):

```ini
[beautlyai-dev]
aws_access_key_id = <AWS_ACCESS_KEY_ID>
aws_secret_access_key = <AWS_SECRET_ACCESS_KEY>
region = us-east-1
```

#### Option B: Environment Variables (Temporary Session)

PowerShell:
```powershell
$env:AWS_ACCESS_KEY_ID = "<AWS_ACCESS_KEY_ID>"
$env:AWS_SECRET_ACCESS_KEY = "<AWS_SECRET_ACCESS_KEY>"
$env:AWS_REGION = "us-east-1"
```

Bash:
```bash
export AWS_ACCESS_KEY_ID="<AWS_ACCESS_KEY_ID>"
export AWS_SECRET_ACCESS_KEY="<AWS_SECRET_ACCESS_KEY>"
export AWS_REGION="us-east-1"
```

#### Option C: Application Properties (Spring Boot)

Add to `src/main/resources/application.properties`:
```properties
aws.accessKeyId=${AWS_ACCESS_KEY_ID}
aws.secretAccessKey=${AWS_SECRET_ACCESS_KEY}
aws.region=${AWS_REGION:us-east-1}
```

**Then pass via environment or Maven**:
```powershell
.\mvnw.cmd -DAWS_ACCESS_KEY_ID=... -DAWS_SECRET_ACCESS_KEY=... spring-boot:run
```

### Step 2: Verify Credentials

Test the credentials:
```bash
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

### Step 3: Set Default Profile (Optional)

To avoid typing `--profile beautlyai-dev` repeatedly:
```bash
export AWS_PROFILE=beautlyai-dev
```

Or in `.env`:
```dotenv
AWS_PROFILE=beautlyai-dev
```

---

## AWS S3 Buckets for Development

### Bucket: `beautlyai-dev-uploads`
**Purpose**: Client photos, before/after images, staff photo uploads  
**Access**: Private + signed URLs  
**Versioning**: Enabled  
**Lifecycle**: Move to Intelligent-Tiering after 90 days

**Example S3 Operations**:
```bash
# List objects
aws s3 ls s3://beautlyai-dev-uploads/

# Upload file
aws s3 cp photo.jpg s3://beautlyai-dev-uploads/clients/client-123/

# Download file
aws s3 cp s3://beautlyai-dev-uploads/clients/client-123/photo.jpg ./

# Generate signed URL (valid for 1 hour)
aws s3 presign s3://beautlyai-dev-uploads/clients/client-123/photo.jpg --expires-in 3600
```

### Bucket: `beautlyai-dev-exports`
**Purpose**: CSV/PDF exports (reports, payroll)  
**Access**: Private  
**Lifecycle**: Auto-delete after 7 days

**Example**:
```bash
aws s3 cp report.pdf s3://beautlyai-dev-exports/monthly/
```

### Bucket: `beautlyai-dev-static`
**Purpose**: Booking site assets, service images, marketing content  
**Access**: Public read via CloudFront  
**CloudFront Distribution**: `d<xxx>.cloudfront.net`

---

## AWS SSM Parameter Store — Storing Secrets

All environment secrets are stored in SSM Parameter Store as `SecureString` values.

### Step 1: Store Secrets in Parameter Store

Store database password:
```bash
aws ssm put-parameter \
  --name "/beautlyai/dev/db/password" \
  --type "SecureString" \
  --value "your_db_password_here" \
  --overwrite
```

Store Stripe secret key:
```bash
aws ssm put-parameter \
  --name "/beautlyai/dev/stripe/secret_key" \
  --type "SecureString" \
  --value "sk_test_..." \
  --overwrite
```

Store JWT secret (generate with openssl):
```bash
# Linux/Mac
aws ssm put-parameter \
  --name "/beautlyai/dev/jwt/secret" \
  --type "SecureString" \
  --value "$(openssl rand -base64 64)" \
  --overwrite

# Windows PowerShell
$jwtSecret = ([System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((New-Guid).ToString() * 10))).Substring(0, 64)
aws ssm put-parameter `
  --name "/beautlyai/dev/jwt/secret" `
  --type "SecureString" `
  --value $jwtSecret `
  --overwrite
```

### Step 2: Retrieve Secrets

Retrieve all parameters under `/beautlyai/dev/`:
```bash
aws ssm get-parameters-by-path \
  --path "/beautlyai/dev/" \
  --with-decryption \
  --query "Parameters[*].[Name,Value]" \
  --output table
```

Retrieve a single parameter:
```bash
aws ssm get-parameter \
  --name "/beautlyai/dev/db/password" \
  --with-decryption \
  --query "Parameter.Value" \
  --output text
```

### Step 3: Load into Spring Boot Application

Create a configuration class to load SSM parameters at startup:

```java
@Configuration
@Slf4j
public class SSMParameterConfig {
    private final AmazonSimpleSystemsManagement ssmClient;
    
    @Bean
    public PropertySourcesPlaceholderConfigurer propertySourcesPlaceholderConfigurer() {
        // Load parameters and set as system properties
        // This allows @Value("${db.password}") to resolve from SSM
        return new PropertySourcesPlaceholderConfigurer();
    }
}
```

Or use Spring Cloud AWS (if available):
```properties
spring.cloud.aws.ssm.enabled=true
spring.config.import=aws-parameterstore://
```

---

## Troubleshooting

### Issue: `AccessDenied` Error
**Cause**: Credentials not configured or policy doesn't grant permission  
**Fix**:
1. Verify credentials: `aws sts get-caller-identity --profile beautlyai-dev`
2. Check policy: `aws iam list-attached-user-policies --user-name beautlyai-dev-user`
3. Ensure resource matches policy ARN pattern (e.g., S3 bucket name starts with `beautlyai-dev-`)

### Issue: `NoSuchKey` in S3
**Cause**: File doesn't exist or was deleted  
**Fix**: Verify bucket and key path — `aws s3 ls s3://beautlyai-dev-uploads/ --recursive`

### Issue: `MissingAuthenticationToken`
**Cause**: Credentials not found or invalid  
**Fix**:
1. Verify `~/.aws/credentials` exists and is properly formatted
2. Check environment variables: `echo $AWS_ACCESS_KEY_ID`
3. Rotate credentials if they've been exposed

### Issue: Cannot Decrypt SSM Parameter
**Cause**: Missing `kms:Decrypt` permission or using wrong KMS key  
**Fix**: Use AWS default managed key or grant explicit KMS decrypt permission

---

## Security Best Practices

✅ **DO**:
- Store credentials in `~/.aws/credentials` (never in code)
- Use IAM roles in AWS Lambda/ECS (never store keys)
- Rotate access keys annually
- Use temporary credentials (AWS STS) when possible
- Monitor CloudTrail for unusual activity
- Enable MFA on your main AWS account

❌ **DON'T**:
- Commit credentials to Git (use `.gitignore` for `.aws/credentials`)
- Share credentials via Slack, email, or chat
- Use root account credentials for development
- Store plaintext secrets in environment variables (use Parameter Store)
- Use `env:AWS_SECRET_ACCESS_KEY` in Docker images

---

## Next Steps

1. **Configure AWS credentials** (see Step 1 above)
2. **Verify credentials** with `aws sts get-caller-identity`
3. **Store secrets in SSM Parameter Store** (see SSM section)
4. **Set up S3 buckets** (contact DevOps or run Terraform)
5. **Test S3 access**: `aws s3 ls s3://beautlyai-dev-uploads/`
6. **Configure Spring Boot** to load credentials
7. **Start developing locally**

---

## Reference: AWS CLI Cheat Sheet

```bash
# Verify identity
aws sts get-caller-identity

# List S3 buckets
aws s3 ls

# Upload to S3
aws s3 cp local-file.txt s3://bucket-name/remote-path/

# Download from S3
aws s3 cp s3://bucket-name/remote-path/file.txt ./

# List SSM parameters
aws ssm get-parameters-by-path --path "/beautlyai/dev/" --with-decryption

# Read parameter
aws ssm get-parameter --name "/beautlyai/dev/db/password" --with-decryption

# Check CloudFront distribution
aws cloudfront get-distribution --id D123ABC

# Rotate access keys
aws iam create-access-key --user-name beautlyai-dev-user
aws iam delete-access-key --user-name beautlyai-dev-user --access-key-id AKIA...
```

---

**Questions?** Contact DevOps or review the [AWS Documentation](https://docs.aws.amazon.com/).

