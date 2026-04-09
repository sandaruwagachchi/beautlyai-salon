# Development App Runner Script
# This script properly sets up environment variables and starts the Spring Boot application
# Includes automatic Docker container startup and verification

# Load development environment
Write-Host "Loading environment configuration..." -ForegroundColor Cyan
. .\setup-env.ps1

# Verify and start Docker containers
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Starting Docker containers..." -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

# Stop and remove existing containers to ensure clean state
Write-Host "Cleaning up existing containers..."
docker-compose down --remove-orphans 2>$null

# Start containers
Write-Host "Starting PostgreSQL and services..."
docker-compose up -d

# Wait for PostgreSQL to be ready
Write-Host "Waiting for PostgreSQL to be ready..."
$maxAttempts = 30
$attempt = 0
while ($attempt -lt $maxAttempts) {
    try {
        $result = docker-compose exec -T postgres pg_isready -U beautlyai_admin -d beautlyai_dev 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ PostgreSQL is ready!" -ForegroundColor Green
            break
        }
    }
    catch {}

    $attempt++
    Start-Sleep -Seconds 1
    Write-Host "  Attempt $attempt/$maxAttempts..."
}

if ($attempt -eq $maxAttempts) {
    Write-Host "✗ PostgreSQL failed to start. Check Docker logs:" -ForegroundColor Red
    docker-compose logs postgres
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Environment Configuration" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "SPRING_PROFILES_ACTIVE: $($env:SPRING_PROFILES_ACTIVE)"
Write-Host "SPRING_DATASOURCE_URL: $($env:SPRING_DATASOURCE_URL)"
Write-Host "SPRING_DATASOURCE_USERNAME: $($env:SPRING_DATASOURCE_USERNAME)"
Write-Host "SPRING_DATASOURCE_PASSWORD: $(if ($env:SPRING_DATASOURCE_PASSWORD) { '*****' } else { 'NOT SET' })"
Write-Host "JWT_SECRET_BASE64: $(if ($env:JWT_SECRET_BASE64) { '*****' } else { 'NOT SET' })"
Write-Host "SERVER_PORT: $($env:SERVER_PORT)"
Write-Host "AWS_REGION: $($env:AWS_REGION)"
if ($env:JAVA_HOME) {
    Write-Host "JAVA_HOME: $($env:JAVA_HOME)"
    Write-Host "Java Version: $(java -version 2>&1 | Select-Object -First 1)"
}
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host ""
Write-Host "Building and starting Spring Boot application..." -ForegroundColor Yellow
Write-Host ""

# Clean and build
Write-Host "Running Maven clean install..."
& .\mvnw.cmd clean install -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "Starting Spring Boot Application" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "API will be available at: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Health Check: http://localhost:8080/actuator/health" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Run Spring Boot with Maven
& .\mvnw.cmd spring-boot:run `
    -Dspring-boot.run.arguments="--spring.profiles.active=$($env:SPRING_PROFILES_ACTIVE) --spring.datasource.url=$($env:SPRING_DATASOURCE_URL) --spring.datasource.username=$($env:SPRING_DATASOURCE_USERNAME) --spring.datasource.password=$($env:SPRING_DATASOURCE_PASSWORD)"



