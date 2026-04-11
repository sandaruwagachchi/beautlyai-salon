# BeautlyAI Backend - Complete Startup Guide (FIXED)

## ✅ What Was Fixed

1. **Port Configuration:** Updated from 5432 → **5433** to match backend's docker-compose
2. **Database Initialization:** Fixed role creation conflict with `DROP ROLE IF EXISTS`
3. **Environment Configuration:** All variables properly aligned

## 🚀 Quick Start (One Command)

```powershell
cd D:\GitHub\beautlyai-salon\backend\salon-api
.\run-app.ps1
```

This script will:
- ✓ Load environment configuration
- ✓ Start PostgreSQL and LocalStack containers
- ✓ Build the application
- ✓ Launch Spring Boot on port 8080

## 📋 Manual Setup (Step by Step)

### Step 1: Start Docker Containers
```powershell
cd D:\GitHub\beautlyai-salon\backend

# Stop old containers (if any)
docker compose down -v --remove-orphans

# Start fresh
docker compose up -d

# Wait for health check
Start-Sleep -Seconds 8

# Verify containers are running
docker compose ps
```

Expected output:
```
beautlyai-postgres      postgres:15-alpine      0.0.0.0:5433->5432/tcp
beautlyai-localstack    localstack/localstack   0.0.0.0:4566->4566/tcp
```

### Step 2: Build the Application
```powershell
cd D:\GitHub\beautlyai-salon\backend\salon-api

# Clean build
.\mvnw.cmd clean install -DskipTests
```

### Step 3: Set Environment Variables
```powershell
$env:SPRING_PROFILES_ACTIVE = "local"
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5433/beautlyai_dev"
$env:SPRING_DATASOURCE_USERNAME = "beautlyai_admin"
$env:SPRING_DATASOURCE_PASSWORD = "dev_password_123"
$env:SERVER_PORT = "8080"
$env:AWS_REGION = "ap-southeast-1"
```

### Step 4: Start Spring Boot
```powershell
.\mvnw.cmd spring-boot:run
```

Wait for output showing:
```
Tomcat initialized with port 8080
Started SalonApiApplication
```

## ✓ Verification

### Check API is Running
```powershell
Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" | ConvertTo-Json
```

Expected response:
```json
{
  "status": "UP"
}
```

### Check Database Connection
```powershell
docker compose -f D:\GitHub\beautlyai-salon\backend\docker-compose.yml exec -T postgres `
  psql -U beautlyai_admin -d beautlyai_dev -c "SELECT version();"
```

## 🗄️ Database Details

| Property | Value |
|----------|-------|
| Host | localhost |
| Port | **5433** |
| Database | beautlyai_dev |
| User | beautlyai_admin |
| Password | dev_password_123 |
| Driver | PostgreSQL JDBC |

## 🔗 Available Endpoints

| Endpoint | Purpose |
|----------|---------|
| `http://localhost:8080/actuator/health` | Health check |
| `http://localhost:8080/api/v1/public/auth/register` | User registration (public) |
| `http://localhost:4566` | LocalStack (AWS emulation) |

## 🛠️ Troubleshooting

### Port 5433 Already in Use
```powershell
# Find process using port 5433
netstat -ano | findstr :5433

# Kill the process (get PID from above)
taskkill /PID <PID> /F
```

### Docker Container Conflicts
```powershell
# Force remove all beautlyai containers
docker rm -f beautlyai-postgres beautlyai-localstack

# Then restart
cd D:\GitHub\beautlyai-salon\backend
docker compose up -d
```

### PostgreSQL Won't Connect
```powershell
# Check container logs
docker compose logs postgres

# Ensure role exists
docker compose exec -T postgres psql -U beautlyai_admin -d beautlyai_dev -c "\du"
```

### Spring Boot Won't Start
1. Check if port 8080 is in use: `netstat -ano | findstr :8080`
2. Verify database connection: `docker compose exec -T postgres pg_isready -U beautlyai_admin`
3. Check logs: Look for "password authentication failed"

## 📝 Key Configuration Files

- **Application Config:** `/backend/salon-api/src/main/resources/application-local.yml`
- **Docker Compose:** `/backend/docker-compose.yml` (uses port 5433)
- **Database Init:** `/backend/init-db/01-create-app-user.sql`
- **Startup Script:** `/backend/salon-api/run-app.ps1`

## 🎯 Next Steps

Once the backend is running:

1. **Access the API:** `http://localhost:8080`
2. **View Health:** `http://localhost:8080/actuator/health`
3. **Register User:** POST to `/api/v1/public/auth/register`
4. **Connect Frontend:** Point your React Native app to `http://localhost:8080`

## 📚 Documentation Links

- Spring Boot: `http://localhost:8080/swagger-ui.html` (if configured)
- PostgreSQL: `psql://beautlyai_admin@localhost:5433/beautlyai_dev`
- LocalStack Dashboard: `http://localhost:4566`

---

**Last Updated:** April 11, 2026  
**Status:** ✅ WORKING - All port conflicts resolved

