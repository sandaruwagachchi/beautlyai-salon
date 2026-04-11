# Section 5: Docker Local Development Guide

## 5.1 Local Stack with Docker Compose

Before connecting to AWS, run PostgreSQL and LocalStack locally using Docker Compose. This is the fastest way to develop without incurring AWS costs.

### Architecture Overview

```
Local Development Stack
├── PostgreSQL 15 (Port 5432)
│   └── Database: beautylai_dev
├── LocalStack (Port 4566)
│   ├── AWS S3 Bucket: beautylai-dev
│   ├── AWS SQS: Notification queue
│   └── AWS SNS: Pub/Sub topics
└── Spring Boot API (Port 8080)
    ├── Caffeine Cache (in-memory)
    └── JWT Authentication (24h expiry)
```

### Prerequisites

- **Docker**: Windows, Mac, or Linux with Docker Desktop
- **Java 21**: For running Spring Boot application
- **Maven**: Or use `mvnw.cmd` wrapper included in project

### Quick Start

#### 1. Start Docker Services

```powershell
cd D:\GitHub\beautlyai-salon\backend\salon-api

# Start all containers
docker-compose up -d

# Verify containers are running
docker-compose ps
```

Expected output:
```
NAME                    IMAGE                    PORTS
beautylai-postgres      postgres:15-alpine       5432:5432
beautylai-localstack    localstack/localstack    4566:4566
```

#### 2. Configure Environment Variables

```powershell
# Load development environment setup
.\setup-env.ps1

# Or manually set environment variables
$env:SPRING_PROFILES_ACTIVE = "local"
$env:JWT_SECRET = "dev-secret-key"
```

#### 3. Start Spring Boot Application

```powershell
mvnw.cmd spring-boot:run

# Or from IDE: Right-click SalonApiApplication.java → Run
```

Expected startup logs:
```
2026-04-04T12:00:00.000+05:30  INFO ... : Starting SalonApiApplication using Java 21.0.7
2026-04-04T12:00:01.000+05:30  INFO ... : HikariPool-1 - Starting...
2026-04-04T12:00:02.000+05:30  INFO ... : Tomcat started on port 8080
2026-04-04T12:00:02.000+05:30  INFO ... : Started SalonApiApplication in 3.456 seconds
```

#### 4. Verify Services

**Check Application Health:**
```powershell
curl http://localhost:8080/actuator/health
```

Response:
```json
{"status":"UP"}
```

**Check Actuator Info:**
```powershell
curl http://localhost:8080/actuator/info
```

**Check Metrics:**
```powershell
curl http://localhost:8080/actuator/metrics
```

---

## 5.2 Database Configuration

### PostgreSQL (HikariCP Connection Pool)

**Connection Settings:**
- Host: `localhost`
- Port: `5432`
- Database: `beautylai_dev`
- User: `beautylai_admin`
- Password: `dev_password_123`

**HikariCP Pool Configuration (t2.micro optimized):**
```yaml
hikari:
  maximum-pool-size: 5          # Low pool size for shared hosting
  minimum-idle: 2               # Keep 2 connections ready
  connection-timeout: 20000     # 20 seconds
  idle-timeout: 300000          # 5 minutes
  max-lifetime: 1200000         # 20 minutes
```

**Schema Auto-Creation:**
- Hibernate automatically creates/updates tables from entities
- Setting: `spring.jpa.hibernate.ddl-auto=update`
- Location: `src/main/java/com/beautlyai/salon/**/*.java` (Entity classes)

### Access PostgreSQL Directly

**Using psql CLI:**
```bash
psql -h localhost -p 5432 -U beautylai_admin -d beautylai_dev
```

**Using pgAdmin (if installed):**
1. Open pgAdmin
2. Create new server: `localhost:5432`
3. Username: `beautylai_admin`, Password: `dev_password_123`

---

## 5.3 Caching Configuration

### Caffeine Cache (Free Tier - No Redis)

**Why Caffeine?**
- ✅ Built-in to Spring Cache abstraction
- ✅ No external service needed
- ✅ Fast in-memory caching
- ✅ Automatic eviction policies
- ✅ Zero setup required

**Configuration:**
```yaml
spring:
  cache:
    type: caffeine
    caffeine:
      spec: maximumSize=500,expireAfterWrite=300s
```

**Explained:**
- `maximumSize=500`: Store max 500 entries
- `expireAfterWrite=300s`: Entries expire after 5 minutes of last write

**Using @Cacheable in Code:**
```java
@Service
public class ClientService {
    @Cacheable(value = "clients", key = "#id")
    public ClientDTO getClient(Long id) {
        // Cached for 5 minutes
    }
    
    @CacheEvict(value = "clients", key = "#id")
    public void updateClient(Long id, ClientUpdateDTO dto) {
        // Clears cache immediately
    }
}
```

### Upgrading to Redis (Optional)

When scaling beyond free tier, switch to Redis:

1. Update `docker-compose.yml`:
```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
```

2. Update `application-local.yml`:
```yaml
spring:
  cache:
    type: redis
  redis:
    host: localhost
    port: 6379
```

---

## 5.4 LocalStack Configuration

### AWS Service Simulation on localhost:4566

**Services Enabled:**
- **S3**: Object storage for salon images, documents
- **SQS**: Message queue for background jobs
- **SNS**: Pub/Sub for notifications
- **SSM**: Parameter store for secrets

**Configuration:**
```yaml
aws:
  region: ap-southeast-1
  localstack:
    endpoint: http://localhost:4566
    s3:
      bucket: beautylai-dev
    sqs:
      endpoint: http://localhost:4566
    sns:
      endpoint: http://localhost:4566
```

**Fake AWS Credentials (LocalStack):**
```
Access Key ID:     test
Secret Access Key: test
Region:            ap-southeast-1
```

### Using LocalStack from Code

**Upload to S3:**
```java
@Service
@RequiredArgsConstructor
public class StorageService {
    private final S3Client s3Client;  // Will connect to LocalStack
    
    public void uploadSalonImage(Long salonId, MultipartFile image) {
        // Uploads to http://localhost:4566 S3 bucket
        s3Client.putObject(
            PutObjectRequest.builder()
                .bucket("beautylai-dev")
                .key("salons/" + salonId + "/" + image.getOriginalFilename())
                .build(),
            RequestBody.fromInputStream(image.getInputStream(), image.getSize())
        );
    }
}
```

**Send SQS Message:**
```java
@Service
@RequiredArgsConstructor
public class NotificationService {
    private final SqsClient sqsClient;  // Will connect to LocalStack
    
    public void queueNotification(String message) {
        sqsClient.sendMessage(
            SendMessageRequest.builder()
                .queueUrl("http://localhost:4566/000000000000/notifications")
                .messageBody(message)
                .build()
        );
    }
}
```

---


## 5.6 JWT Authentication

### 24-Hour Token Expiry

**Configuration:**
```yaml
jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000  # 24 hours in milliseconds (1000 * 60 * 60 * 24)
```

**Using JWT in Code:**
```java
@Service
@RequiredArgsConstructor
public class AuthService {
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    
    public AuthResponseDTO login(LoginRequestDTO request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(),
                request.getPassword()
            )
        );
        
        String token = tokenProvider.generateToken(authentication);
        long expiresIn = 86400000; // 24 hours
        
        return AuthResponseDTO.builder()
            .token(token)
            .expiresIn(expiresIn)
            .tokenType("Bearer")
            .build();
    }
}
```

### Securing Endpoints

```java
@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    
    @PostMapping
    @PreAuthorize("hasRole('USER')")  // Requires valid JWT token
    public ResponseEntity<BookingDTO> createBooking(@Valid @RequestBody CreateBookingRequest req) {
        // Only authenticated users can access
    }
}
```

---

## 5.7 Spring Boot Actuator Configuration

### Enabled Endpoints (local.yml)

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when-authorized
```

### Available Endpoints

| Endpoint | URL | Purpose |
|----------|-----|---------|
| **Health** | `GET /actuator/health` | Application health status |
| **Info** | `GET /actuator/info` | Application version, description |
| **Metrics** | `GET /actuator/metrics` | JVM, HTTP, custom metrics |

### Example Responses

**Health Check:**
```powershell
curl http://localhost:8080/actuator/health
```
```json
{
  "status": "UP",
  "components": {
    "db": {"status": "UP"},
    "livenessState": {"status": "UP"},
    "readinessState": {"status": "UP"}
  }
}
```

**Application Info:**
```powershell
curl http://localhost:8080/actuator/info
```
```json
{
  "app": {
    "name": "BeautlyAI Salon API",
    "version": "1.0.0-LOCAL",
    "description": "Salon management API - Local Development"
  }
}
```

---

## 5.8 JVM Memory Settings (t2.micro)

### Memory Configuration for Shared Hosting

**t2.micro Instance Specs:**
- Total RAM: 1GB
- Recommended JVM: -Xms256m -Xmx512m

**Where to Set:**
1. **In run configuration (IDE):**
   - IntelliJ: Run → Edit Configurations → VM options
   - Add: `-Xms256m -Xmx512m`

2. **In Maven wrapper:**
   ```powershell
   $env:MAVEN_OPTS = "-Xms256m -Xmx512m"
   mvnw.cmd spring-boot:run
   ```

3. **In production JAR:**
   ```bash
   java -Xms256m -Xmx512m -jar salon-api-1.0.0.jar
   ```

**Memory Breakdown:**
- `-Xms256m`: Initial heap (256MB) - allocated at startup
- `-Xmx512m`: Maximum heap (512MB) - leaves 256MB for OS/other processes
- Spare 256MB: For OS, buffers, other processes

---

## 5.9 Common Commands Reference

### Docker Compose

```powershell
# Start all services
docker-compose up -d

# View status
docker-compose ps

# View logs
docker-compose logs -f              # All services
docker-compose logs -f postgres      # PostgreSQL only
docker-compose logs -f localstack    # LocalStack only

# Stop (keeps data)
docker-compose stop

# Stop and remove (keeps volumes)
docker-compose down

# Remove everything (deletes all data)
docker-compose down -v

# Rebuild images
docker-compose build --no-cache
```

### Spring Boot

```powershell
# Run with local profile
mvnw.cmd spring-boot:run

# Run with custom properties
mvnw.cmd spring-boot:run --args='--server.port=9090'

# Build JAR
mvnw.cmd clean package

# Run tests
mvnw.cmd test

# Check dependencies
mvnw.cmd dependency:tree
```

### Verify Services

```powershell
# Check PostgreSQL
Test-NetConnection -ComputerName localhost -Port 5432

# Check LocalStack
Test-NetConnection -ComputerName localhost -Port 4566

# Check Spring Boot API
curl http://localhost:8080/actuator/health
```

---

## 5.10 Troubleshooting

### Docker Won't Start

**Error:** `Docker daemon not running`

**Solution:**
1. Open Docker Desktop from Start Menu
2. Wait for tray icon to appear (≈30 seconds)
3. Retry `docker-compose up -d`

### PostgreSQL Connection Fails

**Error:** `Connection refused: localhost:5432`

**Solutions:**
1. Verify container is running: `docker-compose ps`
2. Check logs: `docker-compose logs postgres`
3. Restart: `docker-compose restart postgres`
4. If local PostgreSQL exists, configure it in `application-local.yml`

### LocalStack Not Responding

**Error:** `Unable to connect to localhost:4566`

**Solutions:**
1. Verify container: `docker-compose ps`
2. Check LocalStack logs: `docker-compose logs localstack`
3. Wait 10 seconds after `docker-compose up -d` (LocalStack takes time to initialize)
4. Restart: `docker-compose restart localstack`

### Out of Memory (OOM)

**Error:** `OutOfMemoryError: Java heap space`

**Solution:** Increase JVM memory
```powershell
$env:MAVEN_OPTS = "-Xms512m -Xmx1024m"
mvnw.cmd spring-boot:run
```

### Port Already in Use

**Error:** `Address already in use: bind :5432`

**Solution:** Find and kill process using port
```powershell
# Find PID using port 5432
netstat -ano | findstr :5432

# Kill process (replace XXXX with PID)
taskkill /PID XXXX /F

# Or change port in docker-compose.yml
ports:
  - "5433:5432"  # Use 5433 instead
```

### Spring Boot Won't Connect to Services

**Error:** `Unable to determine a suitable driver class`

**Solution:**
1. Ensure `application-local.yml` is being loaded
2. Check Spring profile: `$env:SPRING_PROFILES_ACTIVE = "local"`
3. Verify PostgreSQL is running
4. Check database credentials in `application-local.yml`

---

## 5.11 Performance Optimization

### For t2.micro Free Tier

**Database Connection Pool:**
- Keep `maximum-pool-size: 5`
- Keep `minimum-idle: 2`
- Reduces memory footprint

**Cache Configuration:**
- Use Caffeine (in-memory, no external service)
- Keep `maximumSize=500`
- Keep `expireAfterWrite=300s` (5 min)

**Logging Level:**
- Keep root level at `INFO`
- Only debug specific packages: `com.beautlyai.salon: DEBUG`
- Reduces I/O and memory usage

**JVM Tuning:**
- Use `-Xms256m -Xmx512m` (don't exceed)
- Enable GC logging: `-Xloggc:logs/gc.log`
- Monitor heap: `jmap -heap <PID>`

---

## 5.12 Next Steps

1. ✅ **Start Docker Services:** `docker-compose up -d`
2. ✅ **Configure Environment:** `.\setup-env.ps1`
3. ✅ **Start Spring Boot:** `mvnw.cmd spring-boot:run`
4. ✅ **Verify:** `curl http://localhost:8080/actuator/health`
5. ⏭️ **Develop Features:** Follow `AGENTS.md` guidelines
6. ⏭️ **Write Tests:** `src/test/java/com/beautlyai/salon/`
7. ⏭️ **Deploy:** Package JAR with `mvnw.cmd clean package`

---

**Happy developing! 🚀**

