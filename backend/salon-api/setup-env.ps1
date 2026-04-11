# Development Environment Configuration Script
# Run this in PowerShell to set up local development environment variables

function Set-EnvFromSsmParameter {
	param(
		[Parameter(Mandatory = $true)]
		[string]$ParameterName,

		[Parameter(Mandatory = $true)]
		[string]$EnvironmentVariableName
	)

	try {
		$value = aws ssm get-parameter --name $ParameterName --with-decryption --query "Parameter.Value" --output text 2>$null
		if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($value)) {
			Set-Item -Path "Env:$EnvironmentVariableName" -Value $value
			return $true
		}
	}
	catch {
		# Ignore and let caller decide how to proceed.
	}

	return $false
}

function Set-Java21Home {
	param(
		[string[]]$CandidateHomes = @(
			"C:\Program Files\Java\jdk-21",
			"C:\Program Files\Java\latest"
		)
	)

	foreach ($candidateHome in $CandidateHomes) {
		if (Test-Path $candidateHome) {
			$env:JAVA_HOME = $candidateHome
			$binPath = Join-Path $candidateHome "bin"
			if ($env:PATH -notlike "*$binPath*") {
				$env:PATH = "$binPath;$env:PATH"
			}
			return $candidateHome
		}
	}

	return $null
}

# AWS Region / Profile
$env:AWS_REGION = "ap-southeast-1"
$env:SPRING_PROFILES_ACTIVE = "local"

# Prefer Java 21 for Maven + Spring Boot runs on this project.
$javaHome = Set-Java21Home

# Load required secrets from SSM Parameter Store when available.
$secretsLoaded = @()

if (Set-EnvFromSsmParameter -ParameterName "/beautlyai/dev/db/password" -EnvironmentVariableName "SPRING_DATASOURCE_PASSWORD") {
	$secretsLoaded += "SPRING_DATASOURCE_PASSWORD"
}
else {
	# Fallback to hardcoded value for local development (no SSM available)
	if (-not $env:SPRING_DATASOURCE_PASSWORD) {
		$env:SPRING_DATASOURCE_PASSWORD = "dev_password_123"
		$secretsLoaded += "SPRING_DATASOURCE_PASSWORD (local fallback)"
	}
}

if (Set-EnvFromSsmParameter -ParameterName "/beautlyai/dev/jwt/secret" -EnvironmentVariableName "JWT_SECRET_BASE64") {
	$secretsLoaded += "JWT_SECRET_BASE64"
}
else {
	# Fallback to Base64-encoded JWT secret for local development
	if (-not $env:JWT_SECRET_BASE64) {
		# Generate a safe default JWT secret (Base64 encoded) if not provided
		$jwtSecret = "beautlyai-dev-secret-key-for-jwt-token-generation-should-be-at-least-256-bits"
		$env:JWT_SECRET_BASE64 = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($jwtSecret))
		$secretsLoaded += "JWT_SECRET_BASE64 (local fallback)"
	}
}

# LocalStack credentials for local emulation.
if (-not $env:AWS_ACCESS_KEY_ID) {
	$env:AWS_ACCESS_KEY_ID = "test"
}
if (-not $env:AWS_SECRET_ACCESS_KEY) {
	$env:AWS_SECRET_ACCESS_KEY = "test"
}

# Database Configuration
# Use the Docker-mapped port to avoid conflicts with any host Postgres service.
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5433/beautlyai_dev"
$env:SPRING_DATASOURCE_USERNAME = "beautlyai_admin"

# Application Port
$env:SERVER_PORT = "8080"

# Logging Level
$env:LOGGING_LEVEL_COM_BEAUTLYAI_SALON = "DEBUG"

# Cache Configuration
$env:SPRING_CACHE_TYPE = "caffeine"

# Print configured environment variables
Write-Host "Development environment variables configured:" -ForegroundColor Green
Write-Host "SPRING_PROFILES_ACTIVE: $($env:SPRING_PROFILES_ACTIVE)"
Write-Host "AWS_REGION: $($env:AWS_REGION)"
if ($javaHome) {
	Write-Host "JAVA_HOME: $javaHome"
}
Write-Host "SERVER_PORT: $($env:SERVER_PORT)"
Write-Host "LOGGING_LEVEL_COM_BEAUTLYAI_SALON: $($env:LOGGING_LEVEL_COM_BEAUTLYAI_SALON)"
Write-Host "Loaded from SSM: $($secretsLoaded -join ', ')" -ForegroundColor Gray
if ($secretsLoaded.Count -eq 0) {
	Write-Host "(using local development fallback values)" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "SSM parameters expected:" -ForegroundColor Yellow
Write-Host "   /beautlyai/dev/db/password" -ForegroundColor Gray
Write-Host "   /beautlyai/dev/jwt/secret" -ForegroundColor Gray
Write-Host ""
Write-Host "Ready to start development! Run: .\run-app.ps1" -ForegroundColor Yellow

