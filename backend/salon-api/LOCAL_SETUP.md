# Local Development Setup Guide - Free Tier (t2.micro equivalent)

## Overview
This guide covers running the salon-api locally using Docker Compose with minimal resource footprint suitable for AWS Free Tier (t2.micro with 1GB RAM).

**Services Included:**
- PostgreSQL 15 (database)
- Redis 7 (optional, uses Caffeine fallback in local profile)
- LocalStack (S3, SQS, SNS, SSM emulation)
- Adminer (database UI)
- Spring Boot Backend (8080)

---

## Prerequisites

### System Requirements
- **Docker:** 20.10+ with Docker Compose
- **Java:** JDK 21
- **Maven:** 3.8+ (included via `mvnw.cmd`)
- **RAM:** 2GB minimum (1GB for containers + 1GB for IDE/JVM)
- **Disk:** 5GB free space

### Environment Variables (Optional)
```bash
# Override with your test credentials (highly recommended)
export STRIPE_SECRET_KEY=sk_test_your_actual_test_key
export JWT_SECRET=your-secure-dev-secret
export STRIPE_WEBHOOK_SECRET=whsec_test_your_key

# For Windows PowerShell:
$env:STRIPE_SECRET_KEY="sk_test_your_actual_test_key"
$env:JWT_SECRET="your-secure-dev-secret"
$env:STRIPE_WEBHOOK_SECRET="whsec_test_your_key"
```

---

## Quick Start

### 1. Start All Services
```bash
cd salon-api
docker-compose up -d
```

**What starts:**
- PostgreSQL 15 on `localhost:5432`
- Redis 7 on `localhost:6379`
- LocalStack on `localhost:4566`
- Adminer on `localhost:8090`
- Spring Boot API on `localhost:8080`

### 2. Verify Services are Healthy
```bash
docker-compose ps

# Expected output:
# NAME                 STATUS
# beautylai-postgres   Up (healthy)
# beautylai-redis      Up (healthy)
# beautlyai-localstack Up
# beautylai-adminer    Up
# beautylai-api        Up (health status updates after 40s)
```

### 3. Check Application Health
```bash
curl http://localhost:8080/actuator/health

# Expected response:
# {
#   "status": "UP",
#   "components": {
#     "db": { "status": "UP" },
#     "redis": { "status": "UP" }
#   }
# }
```

### 4. Access Services
| Service | URL | Credentials |
|---------|-----|-------------|
| API Health | `http://localhost:8080/actuator/health` | None |
| API Docs | `http://localhost:8080/swagger-ui.html` | None (if enabled) |
| Adminer | `http://localhost:8090` | User: `beautylai_admin` / Pass: `dev_password_123` |
| LocalStack | `http://localhost:4566` | Fake credentials (test/test) |
| Actuator Info | `http://localhost:8080/actuator/info` | None |
| Actuator Metrics | `http://localhost:8080/actuator/metrics` | None |

---

## Running the Application

### Option 1: Docker Compose (Full Stack)
```bash
docker-compose up -d
# Application runs in container with optimized JVM settings
```

### Option 2: Docker Compose + Local Java (Debugging)
```bash
# Start services only (no backend)
docker-compose up -d postgres redis localstack adminer

# Run backend locally (easier debugging in IDE)
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=local"
```

### Option 3: IDE Run Configuration
**IntelliJ IDEA / VS Code:**
1. Set active profile to `local` in Run Configuration
2. Set VM options: `-Xms256m -Xmx512m` (if on t2.micro)
3. Run/Debug

---

## JVM Memory Settings

### For t2.micro (1GB Total RAM)
```bash
# Optimized for AWS Free Tier
JAVA_OPTS="-Xms256m -Xmx512m"
```

**Breakdown:**
- `-Xms256m`: Initial heap (allocated at startup)
- `-Xmx512m`: Maximum heap (512 MB = half of 1GB)
- Leaves ~200MB for non-heap (stack, code cache, etc.)

### For Local Development (8GB+ RAM)
```bash
# Run faster locally with more memory
JAVA_OPTS="-Xms512m -Xmx2g"
```

### For Production t2.micro (with optimization)
```bash
# Production-grade with GC optimization
JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseStringDeduplication -XX:+UseG1GC"
```

### Apply in Docker Container
Edit `docker-compose.yml`:
```yaml
backend:
  environment:
    JAVA_OPTS: "-Xms256m -Xmx512m"
```

---

## Configuration Overview

### Database (PostgreSQL)
```yaml
url: jdbc:postgresql://localhost:5432/beautylai_dev
username: beautylai_admin
password: dev_password_123
hikari:
  maximum-pool-size: 5    # Max 5 concurrent connections (t2.micro safe)
  minimum-idle: 2         # Keep 2 idle
  connection-timeout: 20s
  max-lifetime: 20 minutes
```

### Caching (Caffeine - No Redis Needed)
```yaml
cache:
  type: caffeine
  spec: maximumSize=500,expireAfterWrite=300s  # 5-minute expiry
```

### LocalStack (AWS Services)
```yaml
endpoint: http://localhost:4566
region: ap-southeast-1
services: s3, sqs, sns, ssm
credentials: test / test (fake)
```

### Stripe (Test Mode)
```yaml
stripe:
  api-key: ${STRIPE_SECRET_KEY:sk_test_mock_key_for_local_development}
  webhook-secret: ${STRIPE_WEBHOOK_SECRET:whsec_test_}
```

### JWT (24-hour expiry)
```yaml
jwt:
  secret: ${JWT_SECRET:dev-secret-key-...}
  expiration: 86400000  # 24 hours in milliseconds
  expiry-hours: 24
```

---

## Common Tasks

### View Logs
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis

# View last 100 lines
docker-compose logs --tail=100 backend
```

### Access Database
```bash
# Via Adminer UI
http://localhost:8090
# Login: beautylai_admin / dev_password_123

# Via psql CLI
docker-compose exec postgres psql -U beautylai_admin -d beautylai_dev

# List tables
\dt

# View schema
\d bookings

# Exit
\q
```

### Rebuild Services
```bash
# After code changes, rebuild backend image
docker-compose build backend
docker-compose up -d backend

# Or full rebuild
docker-compose down -v
docker-compose up -d
```

### Reset Database
```bash
# Stop containers and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d
```

### View Container Stats
```bash
docker stats

# Memory usage should be:
# postgres: ~150MB
# redis: ~50MB
# localstack: ~200MB
# backend: ~300-400MB (varies with load)
# Total: ~700MB-800MB (leaves room for host OS)
```

---

## Testing

### Run Tests Locally
```bash
# All tests
./mvnw clean test

# Specific test class
./mvnw test -Dtest=BookingControllerTests

# Specific test method
./mvnw test -Dtest=BookingControllerTests#testCreateBooking

# With coverage
./mvnw clean test jacoco:report
```

### Integration Tests (Requires Docker Services)
```bash
# Ensure docker-compose is running
docker-compose ps

# Run integration tests
./mvnw clean verify -Pintegration
```

---

## Troubleshooting

### Issue: `FATAL: password authentication failed`
**Cause:** Spring credentials don't match PostgreSQL container

**Fix:**
```bash
# Verify docker-compose.yml POSTGRES_PASSWORD = application-local.yml password
docker-compose down -v
docker-compose up -d postgres
sleep 10
docker-compose logs postgres | grep "ready"
docker-compose up -d
```

### Issue: `Unable to connect to Redis`
**Cause:** Redis container not running (non-fatal in local profile)

**Fix:**
```bash
docker-compose up -d redis
docker-compose logs redis
```

### Issue: `OutOfMemoryError` on t2.micro
**Cause:** JVM using too much memory

**Fix:**
```bash
# Reduce max heap in docker-compose.yml
JAVA_OPTS: "-Xms128m -Xmx256m"

# Or run without LocalStack (don't need for basic tests)
docker-compose stop localstack
```

### Issue: Port Already in Use (8080, 5432, etc.)
**Cause:** Another service on same port

**Fix:**
```bash
# Check what's using port 8080
lsof -i :8080  # macOS/Linux
netstat -ano | findstr :8080  # Windows

# Or change port in docker-compose.yml
ports:
  - "8081:8080"  # Use 8081 instead of 8080
```

### Issue: Cannot Connect from IDE
**Cause:** Docker containers on different network

**Fix:**
```bash
# Ensure you're connecting to localhost:5432 (not docker IP)
# Connection string should be: jdbc:postgresql://localhost:5432/beautylai_dev

# If running services separately:
docker-compose up postgres redis
# Then run backend locally (not in Docker)
```

---

## Production Preparation Checklist

Before deploying to production (AWS t2.micro):

- [ ] **Security**
  - [ ] Replace in-memory auth with JWT (auth/ feature)
  - [ ] Change JWT_SECRET to strong random value
  - [ ] Change database password (not `dev_password_123`)
  - [ ] Change Stripe API key to production

- [ ] **Database**
  - [ ] Enable Flyway migrations (`spring.flyway.enabled=true`)
  - [ ] Create migration scripts for schema
  - [ ] Test schema migrations on backup

- [ ] **Caching**
  - [ ] Set up Redis cluster or ElastiCache
  - [ ] Configure Redis connection pooling
  - [ ] Test cache performance under load

- [ ] **AWS**
  - [ ] Set up RDS for PostgreSQL (t2.micro eligible for Free Tier)
  - [ ] Set up ElastiCache for Redis (optional, Free Tier limited)
  - [ ] Configure S3 bucket for LocalStack usage
  - [ ] Set up SQS/SNS topics if used

- [ ] **Monitoring**
  - [ ] Enable CloudWatch metrics
  - [ ] Set up health check alarms
  - [ ] Configure log aggregation (CloudWatch Logs)
  - [ ] Set up auto-scaling policies

- [ ] **JVM**
  - [ ] Test with production JVM settings: `-Xms256m -Xmx512m -XX:+UseG1GC`
  - [ ] Monitor memory under load
  - [ ] Adjust if needed for your traffic

- [ ] **Testing**
  - [ ] Load test on t2.micro instance
  - [ ] Test database failover scenarios
  - [ ] Verify backup/restore procedures
  - [ ] Test zero-downtime deployments

---

## File Structure

```
salon-api/
├── docker-compose.yml           # All services defined
├── Dockerfile                   # Multi-stage build for backend
├── src/main/resources/
│   ├── application.properties   # Base properties (default profile)
│   └── application-local.yml    # Local dev profile (THIS FILE)
├── .mvn/                        # Maven wrapper files
├── mvnw.cmd                     # Maven wrapper for Windows
└── pom.xml                      # Project configuration
```

---

## Useful Commands Reference

```bash
# Start/Stop
docker-compose up -d             # Start all
docker-compose down              # Stop all
docker-compose down -v           # Stop and remove volumes

# Logs
docker-compose logs -f           # All logs
docker-compose logs -f backend   # Backend only
docker-compose logs --tail=100   # Last 100 lines

# Database
docker-compose exec postgres psql -U beautylai_admin -d beautylai_dev

# Testing
./mvnw clean test                # Run tests
./mvnw test -Dtest=Class#method  # Specific test

# Building
./mvnw clean compile             # Compile only
./mvnw clean package             # Build JAR
./mvnw spring-boot:run           # Run locally

# Cleanup
docker system prune              # Remove unused images/containers
docker volume prune              # Remove unused volumes
```

---

## Next Steps

1. **Install Docker** from https://www.docker.com/products/docker-desktop
2. **Clone repository** and navigate to `salon-api/`
3. **Run** `docker-compose up -d`
4. **Verify** `curl http://localhost:8080/actuator/health`
5. **Start developing!** Check AGENTS.md for code patterns

---

**For more information:**
- Architecture: See `AGENTS.md`
- Code patterns: See `AGENTS.md` → Adding a New Feature
- Troubleshooting: See `AGENTS.md` → Common Issues
- Git workflow: See `AGENTS.md` → Git & Commit Workflow

**Questions?** Check docker-compose.yml for service definitions, application-local.yml for configuration.

