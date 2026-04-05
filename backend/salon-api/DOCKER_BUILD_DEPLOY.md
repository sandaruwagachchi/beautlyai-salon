# Section 5.2: Docker Backend Deployment Guide

## Building and Running the Spring Boot Docker Image

### Overview

The Dockerfile uses a **multi-stage build** approach:
1. **Stage 1 (Build)**: Compiles the application using JDK
2. **Stage 2 (Runtime)**: Runs the compiled JAR with minimal JRE

This results in a small, secure image optimized for production.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│           Docker Image Layers                       │
├─────────────────────────────────────────────────────┤
│ Stage 1: Build (eclipse-temurin:21-jdk-alpine)    │
│   ├── Copy Maven wrapper & pom.xml                 │
│   ├── Copy source code (src/)                      │
│   └── Run: mvnw clean package -DskipTests          │
│       Result: /app/target/salon-api-*.jar          │
│                                                     │
│ Stage 2: Runtime (eclipse-temurin:21-jre-alpine)  │
│   ├── Copy JAR from build stage                    │
│   ├── Create non-root user: beautlyai              │
│   ├── Expose port: 8080                            │
│   ├── Health check: /actuator/health               │
│   └── Run: java -jar app.jar                       │
└─────────────────────────────────────────────────────┘
```

---

## Building the Docker Image

### Option 1: Build Locally (Development)

```powershell
cd D:\GitHub\beautlyai-salon\backend\salon-api

# Build the image
docker build -t beautlyai-api:local .

# Expected output:
# [+] Building 125.3s (16/16) FINISHED
# => exporting to image beautlyai-api:local
```

**Image size**: ~400-500MB (optimized with multi-stage build)

### Option 2: Build with Custom Tag

```powershell
# Build with version tag
docker build -t beautlyai-api:1.0.0 .

# Build with registry
docker build -t registry.example.com/beautlyai-api:1.0.0 .
```

### Option 3: Build and Push to Registry

```powershell
# Build
docker build -t beautlyai-api:latest .

# Login to registry
docker login registry.example.com

# Tag for registry
docker tag beautlyai-api:latest registry.example.com/beautlyai-api:latest

# Push
docker push registry.example.com/beautlyai-api:latest
```

---

## Running the Docker Image

### Option 1: Run Standalone (Local Mode)

```powershell
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=local \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5432/beautylai_dev \
  -e SPRING_DATASOURCE_USERNAME=beautylai_admin \
  -e SPRING_DATASOURCE_PASSWORD=dev_password_123 \
  -e STRIPE_SECRET_KEY=sk_test_YOUR_KEY \
  -e JWT_SECRET=your-secret-key \
  beautlyai-api:local
```

**Note:** `host.docker.internal` allows Docker container to access host's localhost

### Option 2: Run with Docker Compose (Recommended)

```powershell
# Start entire stack (PostgreSQL + Redis + LocalStack + Backend API)
docker-compose up -d

# Or rebuild backend and start
docker-compose up -d --build backend

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

### Option 3: Run in Production Mode

```powershell
docker run -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://prod-db.example.com:5432/beautylai_prod \
  -e SPRING_DATASOURCE_USERNAME=prod_user \
  -e SPRING_DATASOURCE_PASSWORD=prod_password_123 \
  -e STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY \
  -e JWT_SECRET=your-prod-secret-key \
  --restart always \
  beautlyai-api:1.0.0
```

---

## Environment Variables

### Required Variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `SPRING_PROFILES_ACTIVE` | `local` | Spring profile (local, dev, prod) |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://postgres:5432/beautylai_dev` | Database connection |
| `SPRING_DATASOURCE_USERNAME` | `beautylai_admin` | Database user |
| `SPRING_DATASOURCE_PASSWORD` | `dev_password_123` | Database password |

### Optional Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `STRIPE_SECRET_KEY` | `sk_test_mock_for_local` | Stripe API key |
| `JWT_SECRET` | `dev-secret-key-...` | JWT signing secret |
| `SPRING_REDIS_HOST` | `redis` | Redis host |
| `SPRING_REDIS_PORT` | `6379` | Redis port |
| `AWS_REGION` | `ap-southeast-1` | AWS region |

### Set Variables in docker-compose.yml

```yaml
backend:
  environment:
    SPRING_PROFILES_ACTIVE: local
    SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/beautylai_dev
    STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}  # From .env file
    JWT_SECRET: ${JWT_SECRET}                 # From .env file
```

### Create .env File for Secrets

Create `.env` in project root:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
JWT_SECRET=your-jwt-secret-key-here
```

Then docker-compose automatically loads these variables.

---

## Dockerfile Explanation

### Stage 1: Build Stage

```dockerfile
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy Maven wrapper (allows building without Maven installed)
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Copy source code
COPY src ./src

# Build the application (skips tests for speed)
RUN chmod +x mvnw && ./mvnw clean package -DskipTests
```

**What happens:**
1. Uses JDK 21 Alpine (smallest Java image)
2. Copies Maven wrapper (no external Maven needed)
3. Copies pom.xml and source
4. Runs Maven build → produces `target/salon-api-*.jar`

**Output:** JAR file ready to run

### Stage 2: Runtime Stage

```dockerfile
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S beautlyai && adduser -S beautlyai -G beautlyai

# Copy only the JAR (not entire build environment)
COPY --from=build --chown=beautlyai:beautlyai /app/target/salon-api-*.jar app.jar

# Switch to non-root user
USER beautlyai

# Expose port 8080
EXPOSE 8080

# Health check every 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget -qO- http://localhost:8080/actuator/health || exit 1

# JVM memory settings
ENV JAVA_OPTS="-Xms256m -Xmx512m"

# Default profile
ENV SPRING_PROFILES_ACTIVE=local

# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE} -jar app.jar"]
```

**What happens:**
1. Uses JRE only (no compiler, ~60% smaller)
2. Creates non-root user `beautlyai` (security best practice)
3. Copies only the compiled JAR from build stage
4. Sets health check (every 30s, max 3 retries)
5. Configures JVM memory (256m initial, 512m max)
6. Runs the JAR with Spring profile

**Result:** ~300MB final image (vs ~1.2GB with full JDK)

---

## Updated docker-compose.yml

Now includes **5 services**:

### 1. PostgreSQL
```yaml
postgres:
  image: postgres:15-alpine
  ports: ["5432:5432"]
  depends_on: none
```

### 2. Redis
```yaml
redis:
  image: redis:7-alpine
  ports: ["6379:6379"]
  depends_on: none
```

### 3. LocalStack
```yaml
localstack:
  image: localstack/localstack:latest
  ports: ["4566:4566"]
  services: s3,sqs,sns,ssm
  depends_on: none
```

### 4. Adminer (Database UI)
```yaml
adminer:
  image: adminer:latest
  ports: ["8090:8080"]
  depends_on: [postgres]
```

### 5. Backend API
```yaml
backend:
  build: .                    # Uses local Dockerfile
  ports: ["8080:8080"]
  environment: [all vars]
  depends_on: [postgres, redis, localstack]
  healthcheck: /actuator/health
```

**Networking:** All services on `salon-network` bridge network

---

## Common Docker Commands

### Build and Start

```powershell
# Build and start all services
docker-compose up -d --build

# Build only backend
docker-compose build backend

# Start without building
docker-compose up -d

# Start and follow logs
docker-compose up
```

### Manage Containers

```powershell
# View status
docker-compose ps

# View logs
docker-compose logs -f              # All services
docker-compose logs -f backend      # Backend only
docker-compose logs -f postgres     # PostgreSQL only

# Stop services
docker-compose stop

# Stop and remove
docker-compose down

# Remove with volumes
docker-compose down -v
```

### Debug Container

```powershell
# Open shell in container
docker exec -it beautylai-api sh

# Run command in container
docker exec beautylai-api java -version

# View container inspect
docker inspect beautylai-api

# Check resource usage
docker stats beautylai-api
```

### Clean Up

```powershell
# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything (⚠️ warning)
docker system prune -a
```

---

## Health Checks

### Dockerfile Health Check

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget -qO- http://localhost:8080/actuator/health || exit 1
```

**Explained:**
- `--interval=30s`: Check every 30 seconds
- `--timeout=10s`: Wait max 10 seconds for response
- `--start-period=40s`: Grace period before first check
- `--retries=3`: Mark unhealthy after 3 failures

### docker-compose Health Check

```yaml
backend:
  healthcheck:
    test: [ "CMD", "wget", "-qO-", "http://localhost:8080/actuator/health" ]
    interval: 30s
    timeout: 10s
    start_period: 40s
    retries: 3
```

### Manual Health Verification

```powershell
# Check service health
curl http://localhost:8080/actuator/health

# Expected response:
# {"status":"UP","components":{"db":{"status":"UP"},"redis":{"status":"UP"}}}

# Check individual components
curl http://localhost:8080/actuator/health/db
curl http://localhost:8080/actuator/health/redis
```

---

## Performance Optimization

### Image Size Optimization

| Technique | Benefit |
|-----------|---------|
| Multi-stage build | Removes build tools from final image |
| Alpine base | 60% smaller than standard Ubuntu |
| JRE not JDK | Removes compiler, tools |
| `.dockerignore` | Skip unnecessary files during copy |

**Result:** 300-500MB image (vs 1.2GB with standard approach)

### Runtime Performance

```dockerfile
ENV JAVA_OPTS="-Xms256m -Xmx512m"
```

**For t2.micro (1GB RAM):**
- JVM: 512MB max
- OS/Kernel: 256MB
- Buffer: 256MB

### Startup Time

Current: ~5-10 seconds

Optimization options:
```dockerfile
# Use GraalVM for faster startup (50ms)
FROM ghcr.io/graalvm/native-image:latest

# Or use Spring Native
ARG BP_NATIVE_IMAGE=true
```

---

## Security Best Practices

### ✅ Already Implemented

- ✅ Non-root user (`beautlyai`)
- ✅ Multi-stage build (no build tools in final image)
- ✅ Alpine Linux (minimal attack surface)
- ✅ Health checks (detect failures)
- ✅ Environment variables for secrets (not hardcoded)

### ⏭️ Recommended for Production

```dockerfile
# Scan for vulnerabilities
docker scan beautlyai-api:latest

# Use signed base images
FROM docker.io/eclipse-temurin:21-jre-alpine@sha256:xxx

# Add read-only root filesystem
docker run --read-only --tmpfs /tmp beautlyai-api

# Limit resources
docker run --cpus="1.0" --memory="512m" beautlyai-api

# Use secrets management
docker run --secret stripe_key beautlyai-api
```

---

## Deployment Scenarios

### Scenario 1: Local Development

```powershell
# Entire stack with one command
docker-compose up -d

# Access points:
# - API: http://localhost:8080
# - Database UI: http://localhost:8090
# - Redis: localhost:6379
# - LocalStack: http://localhost:4566
```

### Scenario 2: AWS ECS/Fargate

```yaml
# ECS Task Definition
{
  "containerDefinitions": [{
    "image": "registry.example.com/beautlyai-api:1.0.0",
    "portMappings": [{"containerPort": 8080}],
    "environment": [
      {"name": "SPRING_PROFILES_ACTIVE", "value": "prod"},
      {"name": "SPRING_DATASOURCE_URL", "value": "...rds..."}
    ],
    "secrets": [
      {"name": "STRIPE_SECRET_KEY", "valueFrom": "arn:aws:secretsmanager:..."}
    ]
  }]
}
```

### Scenario 3: Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: salon-api
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: beautlyai-api:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        livenessProbe:
          httpGet:
            path: /actuator/health
            port: 8080
          initialDelaySeconds: 40
          periodSeconds: 30
```

---

## Next Steps

1. ✅ **Build Docker image:**
   ```powershell
   docker build -t beautlyai-api:local .
   ```

2. ✅ **Start entire stack:**
   ```powershell
   docker-compose up -d
   ```

3. ✅ **Verify all services:**
   ```powershell
   docker-compose ps
   curl http://localhost:8080/actuator/health
   ```

4. ⏭️ **Development:**
   - Edit code in IDE
   - Rebuild: `docker-compose build backend && docker-compose up -d backend`
   - View logs: `docker-compose logs -f backend`

5. ⏭️ **Deployment:**
   - Tag image: `docker tag beautlyai-api:local beautlyai-api:1.0.0`
   - Push to registry: `docker push ...`
   - Deploy to ECS/Kubernetes

---

**Your application is now fully containerized and ready for deployment! 🚀**

