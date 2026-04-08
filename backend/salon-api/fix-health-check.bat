@echo off
REM Fix Health Check Issues - Automated Script
REM Usage: fix-health-check.bat

echo.
echo ======================================
echo BeautlyAI Salon API - Health Check Fix
echo ======================================
echo.

REM Step 1: Check if Docker is running
echo [Step 1] Checking if Docker is running...
docker ps >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is NOT running!
    echo Please start Docker Desktop manually:
    echo   C:\Program Files\Docker\Docker\Docker Desktop.exe
    echo Then wait 60 seconds and try again.
    exit /b 1
)
echo OK - Docker is running

REM Step 2: Stop existing containers
echo [Step 2] Stopping existing containers...
docker-compose down -q 2>nul
echo OK - Containers stopped

REM Step 3: Start services
echo [Step 3] Starting all services...
docker-compose up -d
if errorlevel 1 (
    echo ERROR: Failed to start containers
    exit /b 1
)
echo OK - Services started

REM Step 4: Wait for services
echo [Step 4] Waiting for PostgreSQL to be healthy (up to 2 minutes)...
timeout /t 60 /nobreak

REM Step 5: Verify database
echo [Step 5] Verifying database connection...
docker-compose exec -T postgres psql -U beautlyai_admin -d beautlyai_dev -c "SELECT 1" >nul 2>&1
if errorlevel 1 (
    echo WARNING: Database check failed (might still be initializing)
) else (
    echo OK - Database is accessible
)

REM Step 6: Show status
echo [Step 6] Service Status:
docker-compose ps

echo.
echo ======================================
echo SETUP COMPLETE! Next Steps:
echo ======================================
echo.
echo 1. Run your Spring Boot app with local profile:
echo    .\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"
echo.
echo 2. Check health endpoint:
echo    curl http://localhost:8080/actuator/health
echo.
echo 3. Access database via Adminer:
echo    http://localhost:8090
echo    (username: beautlyai_admin, password: dev_password_123)
echo.
echo For more info, see: HEALTH_CHECK_FIX.md
echo.

