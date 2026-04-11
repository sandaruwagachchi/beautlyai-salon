# Local Development Setup Guide

## Overview
This project supports multiple development setups:
1. **Local PostgreSQL + LocalStack** (with Docker Compose)
2. **Local PostgreSQL + Caffeine Cache** (no Docker required)
3. **Full Docker Stack** (PostgreSQL + LocalStack + optional Redis)

---

## Option 1: Docker Compose Setup (Recommended for AWS Simulation)

### Prerequisites
- Docker and Docker Compose installed
- Docker Desktop running

### Services Included
- **PostgreSQL 15** on `localhost:5432`
- **LocalStack** on `localhost:4566` (simulates AWS S3, SQS, SNS, SSM)
- **Caffeine Cache** (in-memory, no Redis needed)

### Quick Start

```powershell
cd D:\GitHub\beautlyai-salon\backend\salon-api

# Start services
docker-compose up -d

# Verify all containers are running
docker-compose ps

# View logs
docker-compose logs -f postgres
docker-compose logs -f localstack

# Stop services
docker-compose down
```

### Access Points
- **PostgreSQL**: `localhost:5432` (beautylai_admin / dev_password_123)
- **LocalStack**: `localhost:4566` (AWS services endpoint)

---

## Option 2: Local PostgreSQL Only (No Docker)

If Docker is not available or you prefer native PostgreSQL:

### Prerequisites
- PostgreSQL 15 installed and running on `localhost:5432`
- Database: `beautylai_dev`
- User: `beautylai_admin`
- Password: `dev_password_123`

### Configuration
Already set in `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/beautylai_dev
spring.datasource.username=beautylai_admin
spring.datasource.password=dev_password_123
spring.cache.type=caffeine  # Uses in-memory Caffeine cache
```

### Start Application
```powershell
cd D:\GitHub\beautlyai-salon\backend\salon-api
mvnw.cmd spring-boot:run
```

---

## Option 3: Full Docker Stack with Redis

If you want to include Redis for distributed caching:

### Update docker-compose.yml
Add the Redis service:
```yaml
  redis:
    image: redis:7-alpine
    container_name: beautylai-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
```

### Update application.properties
```properties
spring.cache.type=redis
spring.redis.host=localhost
spring.redis.port=6379
```

---

## Project Configuration

### Current Setup
- **Cache**: Caffeine (in-memory, no external dependencies)
- **Database**: PostgreSQL 15
- **AWS Services**: LocalStack (when using Docker)
- **Port**: 8080 (Spring Boot API)

### Available Credentials

| Service | Host | Port | User | Password |
|---------|------|------|------|----------|
| PostgreSQL | localhost | 5432 | beautylai_admin | dev_password_123 |
| LocalStack | localhost | 4566 | - | - |
| Spring Boot | localhost | 8080 | - | - |

---

## Database Setup

### PostgreSQL Required for All Options
1. Create database `beautylai_dev`
2. Create user `beautylai_admin` with password `dev_password_123`
3. Grant all privileges

**If using Docker**, this is automatic. **If using local PostgreSQL**, set it up first.

### Schema Auto-Creation
Spring Boot automatically creates tables via Hibernate (`spring.jpa.hibernate.ddl-auto=update`)

---

## Troubleshooting

### Port Already in Use
```powershell
# Check what's using port 5432
netstat -ano | findstr :5432

# Find the process (PID column), then kill it
taskkill /PID <PID> /F
```

### Docker Daemon Not Running
- **Windows**: Open Docker Desktop from Start Menu
- **Verify**: `docker ps` should list containers

### PostgreSQL Connection Fails
1. Verify PostgreSQL is running: `psql -U beautylai_admin -d beautylai_dev`
2. Check credentials in `application.properties`
3. Ensure database `beautylai_dev` exists

### Caffeine Cache Not Working
- Check `spring.cache.type=caffeine` in `application.properties`
- Caffeine is built-in, no external setup needed

---

## Docker Compose Commands Reference

```powershell
# Start all services
docker-compose up -d

# View status
docker-compose ps

# View logs
docker-compose logs -f              # All services
docker-compose logs -f postgres     # PostgreSQL only
docker-compose logs -f localstack   # LocalStack only

# Stop services (keep data)
docker-compose stop

# Restart services
docker-compose restart

# Remove containers (keep volumes)
docker-compose down

# Remove everything including volumes (⚠️ deletes data)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
```

---

## Health Checks

Once Spring Boot is running:

```powershell
# Check application health
curl http://localhost:8080/actuator/health

# Expected response
{"status":"UP"}
```

---

## Next Steps

1. Choose your setup option (Docker or local PostgreSQL)
2. Start the services
3. Run Spring Boot: `mvnw.cmd spring-boot:run`
4. Access API: `http://localhost:8080`
5. Review `AGENTS.md` for development guidelines

---

## Environment Variables (Optional)

Override defaults:
```powershell
$env:SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/custom_db"
$env:SPRING_DATASOURCE_USERNAME="custom_user"
$env:SPRING_DATASOURCE_PASSWORD="custom_pass"
mvnw.cmd spring-boot:run
```

---

**Happy coding! 🚀**

