# ⚠️ Health Check DOWN - Quick Fix Guide

## Problem
```
❌ DB: FATAL password authentication failed for user "beautlyai_admin"
❌ Redis: Unable to connect to Redis on localhost:6379
```

## Root Cause
**Docker Desktop is NOT running** - You're trying to connect to PostgreSQL and Redis, but they're not running locally.

---

## Solution: Start Docker & Services (3 Steps)

### Step 1: Start Docker Desktop
**Windows:**
- Click the **Docker Desktop** icon in your taskbar/programs menu
- OR run: `"C:\Program Files\Docker\Docker\Docker Desktop.exe"`
- Wait 30-60 seconds for Docker to be ready

**Verify Docker is running:**
```powershell
docker ps
```
You should see output like:
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS   PORTS   NAMES
```

---

### Step 2: Start All Services (PostgreSQL, Redis, etc.)
```powershell
cd D:\GitHub\beautlyai-salon\backend\salon-api
docker-compose up -d
```

**Expected output:**
```
[+] Running 5/5
 ✔ Network salon-api_salon-network Created
 ✔ Volume salon-api_postgres_data Created
 ✔ Container beautlyai-postgres Started
 ✔ Container beautlyai-redis Started
 ✔ Container beautlyai-adminer Started
```

**Verify containers are running:**
```powershell
docker-compose ps
```

Expected:
```
NAME                  IMAGE              STATUS
beautlyai-postgres    postgres:15-alpine Healthy
beautlyai-redis       redis:7-alpine     Healthy
beautlyai-adminer     adminer:latest     Up
beautlyai-localstack  localstack...      Up
```

---

### Step 3: Run Application with Local Profile
Restart your Spring Boot application with:
```powershell
.\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"
```

OR in IntelliJ: Set **Active profiles** to `local` in Run Configuration

---

## Verify It's Working

**Check Health Endpoint:**
```powershell
curl http://localhost:8080/actuator/health
```

**Expected response (should see UP):**
```json
{
  "status": "UP",
  "components": {
    "db": {"status": "UP"},
    "redis": {"status": "UP"},  // or DOWN if not configured (ok)
    "diskSpace": {"status": "UP"},
    "ping": {"status": "UP"}
  }
}
```

---

## Common Issues & Fixes

### Issue: "Docker Desktop is not running"
**Fix:**
```powershell
# Start Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
# Wait 60 seconds for Docker daemon to start
Start-Sleep -Seconds 60
docker ps  # Should work now
```

### Issue: "Port 5432 already in use"
**Fix:**
```powershell
# Stop all containers
docker-compose down

# Remove conflicting container
docker rm beautlyai-postgres

# Start fresh
docker-compose up -d
```

### Issue: "Container stuck in restarting state"
**Fix:**
```powershell
# Clean restart (removes volumes too!)
docker-compose down -v
docker-compose up -d
```

### Issue: "PostgreSQL container not becoming healthy"
**Check logs:**
```powershell
docker-compose logs postgres
```

Look for auth errors - if you see "password authentication failed", the init script didn't run. Try:
```powershell
docker-compose down -v  # Delete volume to force re-init
docker-compose up -d    # Start fresh
```

---

## Database Access

**Adminer Web UI (Database Explorer):**
- URL: `http://localhost:8090`
- Server: `postgres` (or `beautlyai-postgres`)
- Username: `beautlyai_admin`
- Password: `dev_password_123`
- Database: `beautlyai_dev`

**Command Line Access:**
```powershell
docker-compose exec postgres psql -U beautlyai_admin -d beautlyai_dev
```

Then try:
```sql
SELECT 1;  -- Should return: 1
\dt        -- List tables
\q         -- Quit
```

---

## Full Startup Checklist

- [ ] Docker Desktop is running (`docker ps` works)
- [ ] All containers are healthy:
  ```powershell
  docker-compose ps  # All show "Healthy" or "Up"
  ```
- [ ] PostgreSQL responds:
  ```powershell
  docker-compose exec postgres psql -U beautlyai_admin -d beautlyai_dev -c "SELECT 1"
  ```
- [ ] Redis responds:
  ```powershell
  docker-compose exec redis redis-cli ping
  ```
- [ ] App running with local profile:
  ```
  Spring Boot is running (check logs for "Tomcat started on port 8080")
  ```
- [ ] Health check shows UP:
  ```powershell
  curl http://localhost:8080/actuator/health
  # Should return {"status":"UP",...}
  ```

---

## Quick Reference: Configuration

| Component | Host | Port | Username | Password | Database |
|-----------|------|------|----------|----------|----------|
| PostgreSQL | localhost | 5432 | beautlyai_admin | dev_password_123 | beautlyai_dev |
| Redis | localhost | 6379 | (none) | (none) | (default) |
| Adminer | localhost | 8090 | beautlyai_admin | dev_password_123 | beautlyai_dev |
| LocalStack | localhost | 4566 | test | test | S3/SQS/SNS |

---

## After Fix: What Should Happen

```
✅ Application starts without errors
✅ Logs show: "Tomcat started on port 8080"
✅ Health check endpoint returns UP
✅ All components healthy (db: UP, redis: UP or DOWN if not needed)
✅ Database is accessible
✅ Can add features and run tests
```

---

## If Still Having Issues

Check logs:
```powershell
# Application logs
docker-compose logs backend

# PostgreSQL logs
docker-compose logs postgres

# All services
docker-compose logs
```

Or clean restart everything:
```powershell
docker-compose down -v        # Stop & remove
docker system prune -a        # Clean up unused images
docker-compose up -d --build  # Fresh start with rebuild
```

---

**You should now have a UP health check! 🚀**

