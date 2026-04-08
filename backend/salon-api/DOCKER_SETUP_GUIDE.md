# Docker Setup for BeautlyAI Salon API

## Prerequisites

### Docker Desktop Installation
1. **Download** Docker Desktop for Windows from: https://www.docker.com/products/docker-desktop/
2. **Install** and run Docker Desktop
3. **Verify** installation:
   ```powershell
   docker --version
   docker compose --version
   ```

## Running Containers Locally

### Step 1: Start Docker Desktop
- Click the **Docker Desktop** application icon on your taskbar or start menu
- Wait for it to fully initialize (status icon will change to green/active)
- The docker daemon must be running before any `docker` or `docker compose` commands work

### Step 2: Check if Ports Are Available
Before starting, ensure no other services are using these ports:

```powershell
# Check for port conflicts
netstat -ano | findstr :5432    # PostgreSQL
netstat -ano | findstr :6379    # Redis
netstat -ano | findstr :4566    # LocalStack
netstat -ano | findstr :8090    # Adminer
netstat -ano | findstr :8080    # Spring Boot API
```

If port 5432 is already in use (from earlier attempts), kill the process:
```powershell
# Find process using port 5432
netstat -ano | findstr :5432

# Kill process by PID (replace with actual PID)
taskkill /PID <PID> /F
```

### Step 3: Start All Services
```powershell
cd D:\GitHub\beautlyai-salon\backend\salon-api
docker compose up -d
```

This will start:
- **PostgreSQL** (port 5432) - Main database
- **Redis** (port 6379) - Caching layer
- **LocalStack** (port 4566) - Mock AWS services (S3, SQS, SNS, SSM)
- **Adminer** (port 8090) - Database UI
- **Spring Boot API** (port 8080) - Application (builds on first run)

### Step 4: Verify All Containers Are Running
```powershell
docker compose ps

# You should see:
# NAME                    STATUS
# beautylai-postgres      Up (healthy)
# beautylai-redis         Up (healthy)
# beautlyai-localstack    Up
# beautylai-adminer       Up
# beautlyai-api           Up (health: starting/healthy)
```

### Step 5: Access Services

| Service | URL | Purpose |
|---------|-----|---------|
| Spring Boot API | http://localhost:8080 | Main application |
| Adminer | http://localhost:8090 | Database UI (username: `beautylai_admin`, password: `dev_password_123`) |
| API Health | http://localhost:8080/actuator/health | Health check endpoint |
| API Actuator | http://localhost:8080/actuator | Spring Boot metrics & info |

### Step 6: View Logs
```powershell
# All services
docker compose logs -f

# Specific service
docker compose logs -f beautylai-postgres
docker compose logs -f beautylai-api
docker compose logs -f beautlyai-redis
```

## Common Issues & Solutions

### Error: "Docker daemon is not running"
**Symptom**: `failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine`

**Solution**: Start Docker Desktop manually
```powershell
# Windows: Click Docker Desktop icon or run:
& 'C:\Program Files\Docker\Docker\Docker Desktop.exe'

# Wait 30-60 seconds for daemon to initialize
# Then retry: docker compose up -d
```

### Error: "Port 5432 already in use"
**Symptom**: `failed to set up container networking: driver failed programming external connectivity on endpoint beautylai-postgres: Bind for 0.0.0.0:5432 failed: port is already allocated`

**Solution**:
```powershell
# Kill existing PostgreSQL process
netstat -ano | findstr :5432
taskkill /PID <PID> /F

# Or stop old Docker containers
docker compose down

# Then restart
docker compose up -d
```

### Error: "failed to parse docker-compose.yml"
**Symptom**: `yaml: construct errors: mapping key "image" already defined`

**Solution**: This has been fixed in the docker-compose.yml. Re-validate:
```powershell
docker compose config --quiet

# Should return silently (no errors)
```

### Error: "Database does not exist"
**Symptom**: `FATAL: database "beautylai_dev" does not exist`

**Solution**: 
1. PostgreSQL initializes on first run, takes 10-30 seconds
2. Check container logs:
   ```powershell
   docker compose logs beautylai-postgres
   ```
3. Wait for healthy status:
   ```powershell
   docker compose ps beautylai-postgres
   # STATUS should show: Up (healthy)
   ```
4. Once healthy, the Spring Boot app can connect

### Redis Connection Refused
**Symptom**: `RedisConnectionFailureException: Unable to connect to Redis`

**Solution**: Redis is optional for development
1. Verify Redis is running:
   ```powershell
   docker compose ps beautylai-redis
   ```
2. If it's down, restart:
   ```powershell
   docker compose restart beautylai-redis
   ```
3. Application uses Caffeine cache fallback if Redis is unavailable

## Stopping & Cleaning Up

```powershell
# Stop all containers (data preserved)
docker compose stop

# Stop and remove containers (keeps volumes)
docker compose down

# Full cleanup (removes containers, volumes, networks)
docker compose down -v

# Remove all built images (forces rebuild next run)
docker compose down --rmi all
```

## Rebuilding the API Image
If you change the `Dockerfile` or want a fresh build:

```powershell
docker compose build --no-cache

# Then restart
docker compose up -d
```

## Production Deployment Notes
- Before production, update:
  - `STRIPE_SECRET_KEY` (real Stripe key)
  - `JWT_SECRET` (strong random string)
  - `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` (real AWS credentials)
- Remove `DEBUG: 0` and sensitive env vars from docker-compose.yml
- Use environment variable files (`.env`) instead of hardcoding secrets
- Change PostgreSQL password from `dev_password_123`

## Troubleshooting Commands

```powershell
# Check docker daemon status
docker ps

# View detailed container info
docker inspect beautylai-postgres

# Execute command in running container
docker compose exec postgres psql -U beautylai_admin -d beautylai_dev -c "\dt"

# Stream real-time logs
docker compose logs -f --tail=50 beautylai-api

# Rebuild and restart everything
docker compose down -v
docker compose up -d --build
```

