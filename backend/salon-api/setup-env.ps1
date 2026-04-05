# Development Environment Configuration Script
# Run this in PowerShell to set up local development environment variables

# JWT Configuration
$env:JWT_SECRET = "dev-secret-key-change-in-production-do-not-use-this-key"

# Stripe Configuration (Test Mode)
# Get your test keys from: https://dashboard.stripe.com/test/apikeys
$env:STRIPE_SECRET_KEY = "sk_test_YOUR_TEST_KEY_HERE"
$env:STRIPE_WEBHOOK_SECRET = "whsec_YOUR_WEBHOOK_SECRET_HERE"

# AWS LocalStack Configuration
$env:AWS_REGION = "ap-southeast-1"
$env:AWS_ACCESS_KEY_ID = "test"
$env:AWS_SECRET_ACCESS_KEY = "test"

# Spring Profile
$env:SPRING_PROFILES_ACTIVE = "local"

# Database Configuration (optional override)
# $env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/beautylai_dev"
# $env:SPRING_DATASOURCE_USERNAME = "beautylai_admin"
# $env:SPRING_DATASOURCE_PASSWORD = "dev_password_123"

# Application Port
$env:SERVER_PORT = "8080"

# Logging Level
$env:LOGGING_LEVEL_COM_BEAUTLYAI_SALON = "DEBUG"

# Cache Configuration
$env:SPRING_CACHE_TYPE = "caffeine"

# Print configured environment variables
Write-Host "✅ Development environment variables configured:" -ForegroundColor Green
Write-Host "SPRING_PROFILES_ACTIVE: $($env:SPRING_PROFILES_ACTIVE)"
Write-Host "AWS_REGION: $($env:AWS_REGION)"
Write-Host "SERVER_PORT: $($env:SERVER_PORT)"
Write-Host "LOGGING_LEVEL_COM_BEAUTLYAI_SALON: $($env:LOGGING_LEVEL_COM_BEAUTLYAI_SALON)"
Write-Host ""
Write-Host "ℹ️  Note: Update STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET with real test keys from Stripe Dashboard"
Write-Host ""
Write-Host "Ready to start development! Run: mvnw.cmd spring-boot:run" -ForegroundColor Yellow

