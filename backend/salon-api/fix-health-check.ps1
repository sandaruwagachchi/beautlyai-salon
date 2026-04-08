#!/usr/bin/env pwsh
# Fix Health Check Issues - Automated Script
# Usage: .\fix-health-check.ps1

Write-Host "🔧 BeautlyAI Salon API - Health Check Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Docker is running
Write-Host "📦 Step 1: Checking if Docker is running..." -ForegroundColor Yellow
try {
    $dockerStatus = docker ps 2>&1
    if ($dockerStatus -like "*error*" -or $dockerStatus -like "*not found*") {
        throw "Docker not running"
    }
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is NOT running!" -ForegroundColor Red
    Write-Host "   Attempting to start Docker Desktop..." -ForegroundColor Yellow

    if (Test-Path "C:\Program Files\Docker\Docker\Docker Desktop.exe") {
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        Write-Host "   ⏳ Waiting 60 seconds for Docker to start..." -ForegroundColor Yellow
        Start-Sleep -Seconds 60
        Write-Host "   ✅ Docker should be ready now" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Could not find Docker Desktop. Please start it manually!" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Stop existing containers
Write-Host ""
Write-Host "🛑 Step 2: Stopping existing containers..." -ForegroundColor Yellow
docker-compose down --quiet 2>$null
Write-Host "   ✅ Containers stopped" -ForegroundColor Green

# Step 3: Check if volumes need cleanup
Write-Host ""
Write-Host "🧹 Step 3: Checking database state..." -ForegroundColor Yellow
$volumeExists = docker volume ls --filter name=salon-api_postgres_data -q
if ($volumeExists) {
    Write-Host "   Found existing PostgreSQL volume (will reuse)" -ForegroundColor Cyan
} else {
    Write-Host "   No existing volumes (fresh start)" -ForegroundColor Cyan
}

# Step 4: Start services
Write-Host ""
Write-Host "🚀 Step 4: Starting all services (PostgreSQL, Redis, etc.)..." -ForegroundColor Yellow
docker-compose up -d

# Step 5: Wait for services to be healthy
Write-Host ""
Write-Host "⏳ Step 5: Waiting for services to become healthy..." -ForegroundColor Yellow
$maxWait = 120  # 2 minutes
$elapsed = 0
$interval = 5

while ($elapsed -lt $maxWait) {
    $status = docker-compose ps --format "table {{.Names}}\t{{.Status}}" 2>&1
    $postgres = $status | Select-String "beautlyai-postgres"

    if ($postgres -like "*healthy*") {
        Write-Host "   ✅ PostgreSQL is healthy" -ForegroundColor Green
        break
    } else {
        Write-Host "   Waiting... ($elapsed/$maxWait seconds)" -ForegroundColor Yellow
        Start-Sleep -Seconds $interval
        $elapsed += $interval
    }
}

if ($elapsed -ge $maxWait) {
    Write-Host "   WARNING: Services didn't become healthy in time. Checking status..." -ForegroundColor Yellow
    docker-compose ps
}

# Step 6: Verify database
Write-Host ""
Write-Host "🗄️  Step 6: Verifying database connection..." -ForegroundColor Yellow
try {
    $dbTest = docker-compose exec -T postgres psql -U beautlyai_admin -d beautlyai_dev -c "SELECT 1" 2>&1
    if ($dbTest -like "*1*") {
        Write-Host "   ✅ Database is accessible" -ForegroundColor Green
    } else {
        Write-Host "   WARNING: Database response unclear:" -ForegroundColor Yellow
        Write-Host "   $dbTest" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   WARNING: Database check failed (might be still initializing)" -ForegroundColor Yellow
}

# Step 7: Summary
Write-Host ""
Write-Host "[Step 7] Service Status Summary" -ForegroundColor Yellow
docker-compose ps

# Step 8: Next Steps
Write-Host ""
Write-Host "SETUP COMPLETE! Next Steps:" -ForegroundColor Green
Write-Host "   1. Run your Spring Boot app with local profile:" -ForegroundColor Cyan
Write-Host "      .\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments=""--spring.profiles.active=local""" -ForegroundColor White
Write-Host ""
Write-Host "   2. Check health endpoint:" -ForegroundColor Cyan
Write-Host "      curl http://localhost:8080/actuator/health" -ForegroundColor White
Write-Host ""
Write-Host "   3. Access database via Adminer:" -ForegroundColor Cyan
Write-Host "      http://localhost:8090" -ForegroundColor White
Write-Host "      (username: beautlyai_admin, password: dev_password_123)" -ForegroundColor White
Write-Host ""
Write-Host "For more info, see: HEALTH_CHECK_FIX.md" -ForegroundColor Cyan
Write-Host ""







