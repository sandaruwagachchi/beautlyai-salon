#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Setup AWS development environment for BeautlyAI Salon API

.DESCRIPTION
    Configures AWS credentials and verifies access to development resources.
    Run this script after creating the beautlyai-dev-user IAM user.

.EXAMPLE
    .\setup-aws-dev.ps1
#>

param(
    [string]$AccessKeyId,
    [string]$SecretAccessKey,
    [string]$Region = "ap-southeast-1",
    [string]$ProfileName = "beautlyai-dev"
)

if ([string]::IsNullOrWhiteSpace($AccessKeyId) -or [string]::IsNullOrWhiteSpace($SecretAccessKey)) {
    throw "AccessKeyId and SecretAccessKey are required. Pass them as parameters or configure an AWS profile manually."
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "AWS Development Setup for BeautlyAI" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create AWS credentials directory
$credentialPath = Join-Path $env:USERPROFILE ".aws"
if (-not (Test-Path $credentialPath)) {
    New-Item -ItemType Directory -Path $credentialPath | Out-Null
    Write-Host "Created $credentialPath" -ForegroundColor Green
}

# Step 2: Create/update credentials file
$credentialsFile = Join-Path $credentialPath "credentials"
$configFile = Join-Path $credentialPath "config"

# Check if credentials file exists and has content
if ((Test-Path $credentialsFile) -and ((Get-Content $credentialsFile | Measure-Object -Line).Lines -gt 0)) {
    Write-Host ""
    Write-Host "⚠️  WARNING: Credentials file already exists at $credentialsFile" -ForegroundColor Yellow
    Write-Host "Backing up to credentials.bak..."
    Copy-Item $credentialsFile "$credentialsFile.bak" -Force
}

# Create credentials content
$credentialsContent = @"
[$ProfileName]
aws_access_key_id = $AccessKeyId
aws_secret_access_key = $SecretAccessKey
region = $Region
"@

$credentialsContent | Set-Content -Path $credentialsFile -Force
Write-Host "Configured credentials file: $credentialsFile" -ForegroundColor Green

# Step 3: Create config file if not exists
if (-not (Test-Path $configFile)) {
    $configContent = @"
[$ProfileName]
region = $Region
output = json
"@
    $configContent | Set-Content -Path $configFile -Force
    Write-Host "Created config file: $configFile" -ForegroundColor Green
}

# Step 4: Verify credentials
Write-Host ""
Write-Host "Verifying AWS credentials..." -ForegroundColor Cyan
try {
    $identity = aws sts get-caller-identity --profile $ProfileName | ConvertFrom-Json
    Write-Host "Credentials verified" -ForegroundColor Green
    Write-Host "  User ARN: $($identity.Arn)" -ForegroundColor Gray
    Write-Host "  Account: $($identity.Account)" -ForegroundColor Gray
}
catch {
    Write-Host "Failed to verify credentials" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    exit 1
}

# Step 5: Test S3 access
Write-Host ""
Write-Host "Testing S3 bucket access..." -ForegroundColor Cyan
try {
    $buckets = aws s3 ls --profile $ProfileName 2>&1
    if ($buckets -match "beautlyai-dev") {
        Write-Host "S3 access verified" -ForegroundColor Green
        $buckets | Where-Object { $_ -match "beautlyai-dev" } | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    }
    else {
        Write-Host "No beautlyai-dev-* buckets found (may not be created yet)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "Could not list S3 buckets" -ForegroundColor Yellow
    Write-Host "  Error: $_" -ForegroundColor Gray
}

# Step 6: Test SSM access
Write-Host ""
Write-Host "Testing SSM Parameter Store access..." -ForegroundColor Cyan
try {
    $params = aws ssm get-parameters-by-path `
        --path "/beautlyai/dev/" `
        --with-decryption `
        --profile $ProfileName `
        --query "Parameters[*].Name" `
        --output table 2>&1

    if ($params -and $params.Count -gt 0) {
        Write-Host "SSM access verified" -ForegroundColor Green
        $params | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    }
    else {
        Write-Host "No SSM parameters found (may not be created yet)" -ForegroundColor Yellow
        Write-Host "  Create secrets using: aws ssm put-parameter --name /beautlyai/dev/... --type SecureString --value ..." -ForegroundColor Gray
    }
}
catch {
    Write-Host "Could not access SSM Parameter Store" -ForegroundColor Yellow
    Write-Host "  Error: $_" -ForegroundColor Gray
}

# Step 7: Set environment variables
Write-Host ""
Write-Host "Setting environment variables for this session..." -ForegroundColor Cyan
$env:AWS_PROFILE = $ProfileName
$env:AWS_ACCESS_KEY_ID = $AccessKeyId
$env:AWS_SECRET_ACCESS_KEY = $SecretAccessKey
$env:AWS_REGION = $Region
Write-Host "Environment variables set" -ForegroundColor Green
Write-Host "  AWS_PROFILE=$ProfileName" -ForegroundColor Gray
Write-Host "  AWS_REGION=$Region" -ForegroundColor Gray

# Step 8: Summary
Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "AWS Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Create S3 buckets (if using Terraform):" -ForegroundColor Gray
Write-Host "   cd infra && terraform apply" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Store secrets in SSM Parameter Store:" -ForegroundColor Gray
Write-Host "   aws ssm put-parameter --name /beautlyai/dev/db/password --type SecureString --value <password>" -ForegroundColor Gray
Write-Host "   aws ssm put-parameter --name /beautlyai/dev/jwt/secret --type SecureString --value <secret>" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Update .env file with values from .env.example" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Start developing:" -ForegroundColor Gray
Write-Host "   .\mvnw.cmd spring-boot:run" -ForegroundColor Gray
Write-Host ""
Write-Host "For more info, see AWS_DEV_SETUP.md" -ForegroundColor Cyan

