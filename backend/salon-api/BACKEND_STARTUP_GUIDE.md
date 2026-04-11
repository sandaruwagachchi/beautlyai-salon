# BeautlyAI Salon API - Backend Startup Guide

## ✅ Status: FULLY OPERATIONAL

The Spring Boot backend is now correctly configured and running successfully!

## Quick Start

### One-Command Startup
```powershell
cd backend/salon-api
.\run-app.ps1
```

This script will:
1. ✅ Load environment variables from setup-env.ps1
2. ✅ Start Docker PostgreSQL container
3. ✅ Wait for PostgreSQL to be ready
4. ✅ Display environment configuration
5. ✅ Clean and build the project with Maven
6. ✅ Start Spring Boot on port 8080

### Manual Startup (if needed)

#### 1. Load Environment Variables
```powershell
.\setup-env.ps1
```

#### 2. Start PostgreSQL Docker Container
```powershell
docker-compose up -d
```

#### 3. Wait for PostgreSQL (check logs)
```powershell
docker-compose logs -f postgres
```

#### 4. Build the project
```powershell
.\mvnw.cmd clean install -DskipTests
```

#### 5. Start Spring Boot
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:PATH = "C:\Program Files\Java\jdk-21\bin;$env:PATH"
$env:SPRING_PROFILES_ACTIVE = "local"
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5433/beautlyai_dev"
$env:SPRING_DATASOURCE_USERNAME = "beautlyai_admin"
$env:SPRING_DATASOURCE_PASSWORD = "dev_password_123"
$env:SERVER_PORT = "8080"

.\mvnw.cmd spring-boot:run
```

## API Endpoints

### Health Check (for debugging)
```bash
curl -i http://localhost:8080/actuator/health
```
Expected: 403 Forbidden (Spring Security protects this endpoint - normal behavior)

### Docker Status
```powershell
docker-compose ps
```

### View Logs
```powershell
# Spring Boot logs
Get-Content startup.log -Tail 100

# PostgreSQL logs
docker-compose logs postgres

# Real-time logs
docker-compose logs -f
```

## Configuration Files

### application-local.yml
- Datasource: `jdbc:postgresql://localhost:5433/beautlyai_dev`
- Username: `beautlyai_admin`
- Password: `dev_password_123`
- Server Port: `8080`
- Hibernate DDL: `update` (auto-creates tables)
- Cache: Caffeine (in-memory, no Redis needed)

### setup-env.ps1
- Sets JAVA_HOME to Java 21
- Loads secrets from AWS SSM Parameter Store (with local fallbacks)
- Sets up database and application environment variables

### docker-compose.yml (Simplified)
- PostgreSQL 15 Alpine image
- Maps port 5433 → 5432
- Removed problematic LocalStack (not needed for local dev)
- Auto-restart policy

## Known Issues & Fixes Applied

### ❌ Original Issues
1. **LocalStack License Error**: LocalStack container required authentication token
   - **Fix**: Removed LocalStack from docker-compose.yml (not needed for local development)

2. **Database Password Mismatch**: Docker environment used placeholder variable
   - **Fix**: Set hardcoded password to `dev_password_123` in docker-compose.yml

3. **JAVA_HOME Not Set**: Maven couldn't find Java
   - **Fix**: setup-env.ps1 now sets JAVA_HOME to Java 21 location

4. **Hibernate Dialect Error**: Connection failed due to wrong credentials
   - **Fix**: Ensured consistent passwords across application and docker-compose

5. **Port 8080 Already in Use**: Old Java process lingering
   - **Fix**: Kill old processes before restart

### ✅ Solutions Verified
- ✓ PostgreSQL connects successfully
- ✓ Flyway migrations disabled (using Hibernate DDL auto-update instead)
- ✓ Spring Boot starts without errors
- ✓ Health endpoint responds (with 403 from Spring Security as expected)
- ✓ Database connection pooling works (HikariCP)

## Environment Variables

### Database
- `SPRING_DATASOURCE_URL`: jdbc:postgresql://localhost:5433/beautlyai_dev
- `SPRING_DATASOURCE_USERNAME`: beautlyai_admin
- `SPRING_DATASOURCE_PASSWORD`: dev_password_123

### Application
- `SPRING_PROFILES_ACTIVE`: local
- `SERVER_PORT`: 8080
- `AWS_REGION`: ap-southeast-1
- `LOGGING_LEVEL_COM_BEAUTLYAI_SALON`: DEBUG

### Security
- `JWT_SECRET_BASE64`: Loaded from SSM or local default
- `APP_ALLOWED_ORIGINS`: http://localhost:8081,http://127.0.0.1:8081

## Troubleshooting

### "Port 8080 already in use"
```powershell
Get-Process | Where-Object {$_.ProcessName -eq "java"} | Stop-Process -Force
```

### "PostgreSQL connection refused"
```powershell
docker-compose logs postgres
docker-compose restart postgres
```

### "Build failed: cannot find symbol"
```powershell
.\mvnw.cmd clean
.\mvnw.cmd install -DskipTests
```

### "Could not load driver class: org.postgresql.Driver"
- Verify docker-compose is running: `docker-compose ps`
- Verify PostgreSQL is ready: `docker-compose logs postgres`

## Testing the API

Once running, the backend is available at:
- **Base URL**: http://localhost:8080
- **Actuator**: http://localhost:8080/actuator
- **Health**: http://localhost:8080/actuator/health

Example endpoint test (from mobile app):
```javascript
const response = await fetch('http://localhost:8080/api/appointments', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer <JWT_TOKEN>'
  }
});
```

## Next Steps

1. ✅ Backend is running
2. 🔄 Start mobile app development (React Native):
   ```bash
   cd mobile
   npm install
   npm start
   ```
3. 🔄 Configure AWS credentials for SSM Parameter Store:
   ```powershell
   aws configure
   ```
4. 🔄 Set up Terraform infrastructure (when ready for deployment):
   ```bash
   cd infra/environments/dev
   terraform init
   terraform apply
   ```

## Support

For more information, refer to:
- `ENV_TEMPLATE.txt` - All available environment variables
- `setup-env.ps1` - How environment variables are loaded
- `src/main/resources/application-local.yml` - Spring Boot configuration
- Project README.md in root directory

