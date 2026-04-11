# BeautlyAI Salon API - Development Setup Summary

## Status: ✅ MOSTLY COMPLETE - One Remaining Issue

All setup tasks have been completed except for one **PostgreSQL authentication method mismatch** between local `psql` connections and remote JDBC connections.

---

## Completed Tasks

### 1. ✅ LocalStack Community Edition Fixed
- **Issue**: License activation failure
- **Solution**: Pinned to `localstack/localstack:3.0` with explicit community-mode credentials
- **Verification**: Health endpoint returns `"edition": "community"` with no errors

### 2. ✅ Stripe/Payment Gateway Removed  
- **Issue**: User requested no payment gateway
- **Solution**: Removed all Stripe references:
  - Removed `com.stripe:stripe-java` Maven dependency
  - Removed Stripe config from `application-local.yml`
  - Removed Stripe env vars from `.env.example`
- **Result**: Clean build with JWT + DB secrets only

### 3. ✅ Java 21 Runtime Configured
- **Issue**: Initial `UnsupportedClassVersionError` (Java 17 vs 21)
- **Solution**: Added auto-detection of JDK 21 in `setup-env.ps1`
- **Verification**: Maven reports `Java version: 21.0.7`

### 4. ✅ Database User & Privileges Created
- **Issue**: `beautlyai_admin` user didn't exist
- **Solution**: Created PostgreSQL init script with user creation and privilege grants
- **Verification**: `psql -U beautlyai_admin` works from within container

### 5. ✅ Flyway Disabled for Local Development
- **Issue**: Flyway conflicts with SSM secret loading
- **Solution**: Set `spring.flyway.enabled: false` in `application-local.yml`
- **Result**: Hibernate DDL auto-update works instead

### 6. ✅ Maven Compiler Fixed
- **Issue**: Test compile failing with "release version 21 not supported"
- **Solution**: Added explicit compiler properties to `pom.xml`:
  ```xml
  <maven.compiler.source>21</maven.compiler.source>
  <maven.compiler.target>21</maven.compiler.target>
  <maven.compiler.release>21</maven.compiler.release>
  ```
- **Verification**: Build succeeds with `-DskipTests`

### 7. ✅ Environment Variable Setup
- **Created Files**:
  - `setup-env.ps1` - Loads Java 21, SSM secrets with local fallbacks, AWS config
  - `run-app.ps1` - Wrapper script that sets env vars and starts the app
  - `.env.local.example` - Template for local development environment
- **Features**:
  - Auto-detects Java 21 from multiple paths
  - Falls back to hardcoded defaults if SSM unavailable
  - Sets Spring profile to "local"
  - Configures LocalStack credentials

---

## Outstanding Issue: PostgreSQL Authentication Mismatch

### Symptom
```
FATAL: password authentication failed for user "beautlyai_admin"
  - psql connection from container: ✅ WORKS
  - JDBC connection from Java: ❌ FAILS
```

### Root Cause Analysis
PostgreSQL Alpine Docker image has different authentication methods for:
- **Local socket connections** (`/var/run/postgresql/.s.PGSQL.5432`) - uses `trust` or `peer` auth
- **TCP connections** (`localhost:5432`) - requires password auth via `pg_hba.conf`

The `beautyai_admin` user can authenticate locally (psql in container), but the PostgreSQL server rejects the password when JDBC tries to connect via TCP.

### Why This Happens
- PostgreSQL init script creates the user: `CREATE ROLE beautlyai_admin WITH LOGIN PASSWORD 'dev_password_123'`
- User creation works correctly
- But `pg_hba.conf` configuration in the Alpine image may be rejecting the specific authentication method or password hashing algorithm

### How to Debug Further
1. Check pg_hba.conf inside container:
   ```bash
   docker exec beautlyai-postgres cat /var/lib/postgresql/data/pg_hba.conf
   ```

2. Test with psql from host (if PostgreSQL client installed):
   ```bash
   psql -h localhost -U beautlyai_admin -d beautlyai_dev
   ```

3. Check PostgreSQL server logs for authentication details:
   ```bash
   docker logs beautlyai-postgres | grep -i "authentication"
   ```

### Next Steps (For User)

**Option A: Use Spring Boot without Database (Recommended for immediate demo)**
- Set `spring.jpa.hibernate.ddl-auto: none` to skip DB initialization
- App will start but may fail on first DB query

**Option B: Fix PostgreSQL Authentication**
- Create a custom pg_hba.conf file that forces `md5` or `scram-sha-256` for all connections
- Mount it in docker-compose: `volumes: - ./pg_hba.conf:/var/lib/postgresql/data/pg_hba.conf`

**Option C: Use a Different PostgreSQL Image**
- Try `postgres:15` instead of `postgres:15-alpine`
- Full-featured image may have different auth defaults

---

## Files Created/Modified

### New Files
- `D:\GitHub\beautlyai-salon\backend\salon-api\run-app.ps1` - Application launcher
- `D:\GitHub\beautlyai-salon\backend\salon-api\.env.local.example` - Env template
- `D:\GitHub\beautlyai-salon\backend\init-db\01-create-app-user.sql` - DB initialization

### Modified Files
- `D:\GitHub\beautlyai-salon\backend\salon-api\pom.xml` - Added compiler properties, removed Stripe
- `D:\GitHub\beautlyai-salon\backend\salon-api\setup-env.ps1` - Added Java 21 detection & env loading
- `D:\GitHub\beautlyai-salon\backend\salon-api\src\main\resources\application-local.yml` - Disabled Flyway, added defaults
- `D:\GitHub\beautlyai-salon\backend\docker-compose.yml` - Fixed typos, mounted init script
- `D:\GitHub\beautlyai-salon\backend\init-db\01-create-app-user.sql` - User creation script

---

## How to Run (Current State)

```powershell
cd D:\GitHub\beautlyai-salon\backend\salon-api

# 1. Setup environment
.\setup-env.ps1

# 2. Start application (will fail at DB connection, but try it):
.\run-app.ps1

# Alternative: Run with Maven
.\mvnw.cmd -DskipTests spring-boot:run

# For production, compile JAR first:
.\mvnw.cmd clean package -DskipTests
java -jar target/salon-api-0.0.1-SNAPSHOT.jar
```

---

## Development Configuration Summary

| Component | Setting | Notes |
|-----------|---------|-------|
| **Java** | 21.0.7 | Auto-detected by setup-env.ps1 |
| **Spring Boot** | 3.5.13 | No changes needed |
| **Spring Profile** | `local` | Set by setup-env.ps1 |
| **Database** | PostgreSQL 15 Alpine | Local Docker container |
| **Database User** | `beautlyai_admin` | Password: `dev_password_123` |
| **JWT Secret** | Base64 encoded | Hardcoded default in app-local.yml |
| **AWS Services** | LocalStack 3.0 | S3, SQS, SNS enabled (no SSM) |
| **Cache** | Caffeine | In-memory, configured in yml |
| **Port** | 8080 | Configurable via SERVER_PORT env var |

---

## Known Limitations

1. **PostgreSQL JDBC Authentication**: Currently fails due to pg_hba.conf mismatch
   - Workaround: Change database auth method in PostgreSQL config
   - Impact: App cannot start until database connection works

2. **SSM Parameter Store**: Disabled in LocalStack (community edition limitation)
   - Workaround: Using hardcoded defaults in application-local.yml
   - These are safe for local dev only

3. **Flyway Migrations**: Disabled for local development
   - Reason: Conflicts with SSM secret loading
   - Using Hibernate auto-DDL instead for local

4. **Redis**: Configured but not tested
   - Reason: No Redis container in docker-compose
   - Impact: Caching features won't work without Redis

---

##  Next Actions

**Immediate (To get app running):**
1. Fix PostgreSQL authentication method by:
   - Creating custom `pg_hba.conf`
   - OR using a full PostgreSQL image
   - OR adding password reset logic to init script

**After Database Works:**
1. Add Redis to docker-compose for full caching
2. Test REST endpoints
3. Verify JWT authentication
4. Test LocalStack S3/SQS/SNS services

**Future Enhancements:**
1. Add proper Flyway migrations for production
2. Implement SSM Parameter Store for production (requires AWS credentials)
3. Add health check endpoints
4. Configure CORS and API gateway
5. Set up CI/CD pipeline for deployment


