# AGENTS.md — BeautlyAI Salon API

**Spring Boot 3.5.13 REST API** for salon management (Java 21, Maven, PostgreSQL 15, Redis).

## Project Structure at a Glance

- **Bootstrap**: `src/main/java/com/beautlyai/salon/SalonApiApplication.java`
- **Component Root**: `com.beautlyai.salon` (all code must be scanned here)
- **Pre-scaffolded Features** (empty, ready): `auth/`, `booking/`, `client/`, `notification/`, `staff/`
- **DB**: PostgreSQL on `localhost:5432` (beautylai_dev / beautylai_admin / dev_password_123)

## Feature-Driven Architecture (Key Rule)

Each feature (booking, client, auth, etc.) is **completely isolated** in its own package:
```
src/main/java/com/beautlyai/salon/<feature>/
  ├── Controller.java       # REST endpoints (@PostMapping, @GetMapping, @Valid DTO)
  ├── Service.java          # Business logic (@Service, @RequiredArgsConstructor, @Cacheable)
  ├── Repository.java       # JPA queries (extends JpaRepository<Entity, ID>)
  └── Model.java            # @Entity with @Table, @Id, @Column
```

**Why?** Cross-feature contamination = eventual refactor nightmare. Services only talk via repository results or events, never direct dependencies.

### Concrete Example: Booking Feature
```java
// booking/Booking.java
@Entity @Table(name = "bookings")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String clientName;
    private LocalDateTime appointmentTime;
}

// booking/BookingRepository.java
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByClientNameIgnoreCase(String name);
}

// booking/BookingService.java
@Service @RequiredArgsConstructor
public class BookingService {
    private final BookingRepository repository;
    
    @Cacheable(value = "bookings", key = "#id")
    public BookingDTO getBooking(Long id) {
        return repository.findById(id)
            .map(this::toDTO)
            .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
    }
    
    @Transactional
    public BookingDTO createBooking(CreateBookingRequest req) {
        Booking booking = Booking.builder()
            .clientName(req.getClientName())
            .appointmentTime(req.getAppointmentTime())
            .build();
        return toDTO(repository.save(booking));
    }
}

// booking/BookingController.java
@RestController @RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService service;
    
    @GetMapping("/{id}")
    public ResponseEntity<BookingDTO> getBooking(@PathVariable Long id) {
        return ResponseEntity.ok(service.getBooking(id));
    }
    
    @PostMapping
    public ResponseEntity<BookingDTO> create(@Valid @RequestBody CreateBookingRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(service.createBooking(req));
    }
}
```

## Critical Workflows

### Local Development Quick Start
```powershell
# 1. Start infrastructure
docker-compose up -d

# 2. Build project
.\mvnw.cmd clean compile

# 3. Run tests
.\mvnw.cmd test

# 4. Run app (http://localhost:8080)
.\mvnw.cmd spring-boot:run

# 5. Check health (should show DB + Redis status)
curl http://localhost:8080/actuator/health
```

### Adding a New Feature
1. Create package: `src/main/java/com/beautlyai/salon/<feature>/`
2. Define `@Entity Model` with `@Table(name="...")`, `@Id @GeneratedValue`
3. Create `Repository extends JpaRepository<Model, ID>`
4. Create `@Service` with `@RequiredArgsConstructor` + `@Transactional` methods
5. Create DTOs (`CreateRequest`, `ResponseDTO`) with `@Data @Builder`
6. Create `@RestController @RequestMapping("/api/<feature>s")` endpoints with `@Valid` inputs
7. Add tests in `src/test/java/com/beautlyai/salon/<feature>/`
8. Verify: `mvn test -Dtest=YourFeatureTests`

## Stack & Dependencies

**Spring Boot 3.5.13** with Maven:
- Web (Spring MVC)
- Security 6.5.9 (in-memory default, needs JWT implementation before production)
- Data JPA (Hibernate 6.6.45 + PostgreSQL 42.7.10 driver)
- Data Redis (Lettuce 6.6.0 client; falls back to Caffeine if unavailable)
- Validation (JSR 303 annotations)
- Actuator (health checks `/actuator/health`, metrics)
- Cache (Spring abstraction with Redis TTL 600s)
- Flyway (disabled, enable for production migrations)

**Lombok 1.18.44**: Annotation processor enabled in pom.xml. Use `@Data`, `@RequiredArgsConstructor`, `@Builder`, `@Slf4j`. **Never remove.**

## Database & Schema

### Database Setup (Local Development)
- **URL**: `jdbc:postgresql://localhost:5432/beautylai_dev`
- **Credentials**: `beautylai_admin` / `dev_password_123`
- **DDL Strategy**: `spring.jpa.hibernate.ddl-auto=update` (Hibernate auto-updates schema from entities)
- **Flyway**: Currently disabled (`spring.flyway.enabled=false`). Enable only when implementing versioned migrations.
- **Docker Compose**: Use `docker-compose.yml` to run PostgreSQL 15 + Redis locally
  - Start services: `docker-compose up -d`
  - Adminer UI (database explorer): `http://localhost:8081`
  - See `SETUP.md` for complete local development setup

### Schema Migrations
- **Location**: `src/main/resources/db/migration/`
- **Naming**: Use Flyway convention – `V<number>__<description>.sql` (e.g., `V2__Add_Bookings_Table.sql`)
- **When to use**: Once Flyway is enabled for production deployments
- **Currently**: Use Hibernate auto-update for dev; consider Flyway for schema versioning

## Security Model

### Current Default (Insecure, Dev-Only)
- Spring Security configured with in-memory `UserDetailsService`
- Default credentials auto-generated on startup (see application logs)
- **Action Required Before Production**: Replace with proper authentication (JWT, OAuth2, or LDAP)

### Future JWT Implementation Pattern
When building the `auth/` feature:
1. Create JWT token provider in `auth/` package
2. Implement custom `AuthenticationProvider` and `UserDetailsService`
3. Add security filter chain config (use `@Bean SecurityFilterChain`)
4. Store user credentials in `users` table via `UserRepository`

## Configuration & Properties

### Application Properties
- **File**: `src/main/resources/application.properties`
- **Design**: Kept minimal intentionally – add feature-specific config only when needed
- **Server Port**: 8080 (customizable via `server.port`)
- **Logging**: Root level INFO; package-level DEBUG for `com.beautlyai.salon`

### Adding Config for a Feature
1. Add properties to `application.properties` only for active runtime features.
2. Create a `@ConfigurationProperties` class in the feature package.
3. Enable it with `@EnableConfigurationProperties(...)` in feature config.

> Note: `payment/` is intentionally not used in this project because the platform does not include payment features.

## Testing Conventions

### Test Location
- **Path**: `src/test/java/com/beautlyai/salon/<feature>/`
- **Baseline**: `SalonApiApplicationTests.java` is a smoke test (context loads)

### Test Types

**Controller Tests** – Integration test with mock MVC:
```java
@SpringBootTest
@AutoConfigureMockMvc
class BookingControllerTests {
    @Autowired MockMvc mockMvc;
    @MockBean BookingService bookingService;
    
    @Test
    void testCreateBooking() throws Exception {
        mockMvc.perform(post("/api/bookings")
            .contentType("application/json")
            .content(...))
            .andExpect(status().isCreated());
    }
}
```

**Service Tests** – Fast unit tests without web context:
```java
class BookingServiceTests {
    @Mock BookingRepository repository;
    BookingService service;
    
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new BookingService(repository);
    }
}
```

**Database Tests** – JPA/Hibernate validation:
```java
@DataJpaTest
class BookingRepositoryTests {
    @Autowired BookingRepository repository;
    @Autowired TestEntityManager em;
}
```

## Build & Run Commands

### Using Maven Wrapper (Windows PowerShell)
```powershell
# Compile only
.\mvnw.cmd clean compile

# Run tests
.\mvnw.cmd test

# Run specific test class
.\mvnw.cmd test -Dtest=BookingControllerTests

# Run specific test method
.\mvnw.cmd test -Dtest=BookingControllerTests#testCreateBookingSuccess

# Build JAR
.\mvnw.cmd clean package

# Run application
.\mvnw.cmd spring-boot:run

# Check for dependency issues
.\mvnw.cmd dependency:tree

# Exclude tests from package
.\mvnw.cmd clean package -DskipTests
```

### Docker Compose Commands
```bash
# Start all services (PostgreSQL, Redis, LocalStack, Adminer, Backend)
docker-compose up -d

# View running containers
docker-compose ps

# Stream logs for backend only
docker-compose logs -f backend

# Execute command in container
docker-compose exec postgres psql -U beautylai_admin -d beautylai_dev

# Rebuild backend image after code changes
docker-compose build backend
docker-compose up -d

# Clean up (removes containers, keeps volumes)
docker-compose down

# Clean up including volumes
docker-compose down -v
```

### Common Issues & Troubleshooting

#### Issue: `FATAL: password authentication failed`
- **Cause:** Spring datasource credentials don't match PostgreSQL container
- **Fix:** 
  1. Verify `docker-compose.yml` POSTGRES_PASSWORD = `application.properties` spring.datasource.password
  2. Rebuild: `docker-compose down -v && docker-compose up -d`
  3. Verify: `docker-compose logs postgres | findstr ready` (Windows)

#### Issue: Redis connection fails
- **Cause:** Redis container not running or network issue
- **Fix:** 
  1. Check health: `docker-compose ps` (redis should show "healthy")
  2. Redis is optional; app degrades to Caffeine cache
  3. Non-fatal warning is acceptable for local dev

#### Issue: Database connection fails
- Ensure PostgreSQL is running: `docker-compose ps postgres`
- Verify credentials in both docker-compose.yml and application.properties match
- Test connection: `docker-compose exec postgres psql -U beautylai_admin -d beautylai_dev`

#### Issue: Port 8080 in use
- Change via `server.port=8081` in properties or docker-compose.yml

#### Issue: Lombok annotations not recognized
- Run: `.\mvnw.cmd clean compile`
- IDE: Enable annotation processing in Settings → Build → Compiler → Annotation Processors

## Lombok Usage

### Why It's Here
Eliminates constructor, getter, and toString boilerplate. Configured via Maven compiler annotation processor.

### Common Annotations
```java
@Data                    // @Getter, @Setter, @ToString, @EqualsAndHashCode, @RequiredArgsConstructor
@RequiredArgsConstructor // Constructor for final fields (prefer for dependency injection)
@Builder                 // Builder pattern generation
@Slf4j                   // Static SLF4J logger field
```

### Constructor Injection Pattern
```java
@Service
@RequiredArgsConstructor  // Generates constructor from final fields
public class BookingService {
    private final BookingRepository repository;
    private final NotificationService notificationService;
    
    // Lombok generates: public BookingService(BookingRepository, NotificationService)
}
```

## Caching & Redis

### Cache Abstraction (Spring Cache)
- Spring `@Cacheable`, `@CacheEvict`, `@CachePut` annotations on service methods
- **Backend Options:**
  - **Redis** (production): When Redis available on `localhost:6379` or configured host
  - **Caffeine** (fallback): In-memory cache when Redis unavailable (dev default)
  - **Config:** `spring.cache.type=caffeine` with `spec=maximumSize=500,expireAfterWrite=600s`

### Example Caching Pattern
```java
@Service
@RequiredArgsConstructor
public class ClientService {
    private final ClientRepository repository;
    
    // Cache GET results by clientId for 600 seconds
    @Cacheable(value = "clients", key = "#clientId")
    public ClientDTO getClient(Long clientId) {
        return repository.findById(clientId)
            .map(this::toDTO)
            .orElseThrow(() -> new ResourceNotFoundException("Client not found"));
    }
    
    // Clear cache after UPDATE
    @CacheEvict(value = "clients", key = "#clientId")
    public void updateClient(Long clientId, ClientUpdateDTO dto) {
        Client client = repository.findById(clientId).orElseThrow();
        client.setName(dto.getName());
        repository.save(client);
    }
    
    // Refresh cache after CREATE
    @CachePut(value = "clients", key = "#result.id")
    public ClientDTO createClient(CreateClientRequest req) {
        Client client = new Client();
        client.setName(req.getName());
        Client saved = repository.save(client);
        return toDTO(saved);
    }
}
```

### Cache Health & Monitoring
- Check cache backend via `GET /actuator/health`
- Redis failure: Non-fatal; automatically uses Caffeine fallback
- No explicit cache warming needed; lazy-loaded on first access

## Actuator & Health Checks

### Exposed Endpoint
- **URL**: `http://localhost:8080/actuator`
- **Shows**: Health status, active profiles, beans, metrics
- **Database health**: Returns DOWN if PostgreSQL unreachable (not fatal for startup)
- **Redis health**: Returns DOWN if Redis unreachable (not fatal, cache degrades gracefully)

### Use Case
- Kubernetes/Docker liveness probes: `GET /actuator/health`
- Monitoring dashboards: Prometheus scrapes `/actuator/prometheus` (if metrics enabled)

## Adding a New Feature

### Step-by-Step

1. **Create feature package** under `src/main/java/com/beautlyai/salon/<feature>/`

2. **Define entities** (in `<feature>/model/` or root of package):
   ```java
   @Entity @Table(name = "bookings")
   @Data @NoArgsConstructor @Builder
   public class Booking {
       @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
       private Long id;
       
       @Column(nullable = false)
       private String clientName;
       
       @ManyToOne
       private Staff assignedStaff;
   }
   ```

3. **Create repository**:
   ```java
   @Repository
   public interface BookingRepository extends JpaRepository<Booking, Long> {
       List<Booking> findByAssignedStaff(Staff staff);
   }
   ```

4. **Create DTOs** for API contracts:
   ```java
   @Data @Builder
   public class CreateBookingRequest {
       @NotBlank String clientName;
       @NotNull LocalDateTime appointmentTime;
       Long staffId;
   }
   ```

5. **Create service** with business logic:
   ```java
   @Service @RequiredArgsConstructor
   public class BookingService {
       private final BookingRepository repository;
       
       public BookingDTO createBooking(CreateBookingRequest req) {
           Booking booking = Booking.builder()
               .clientName(req.getClientName())
               .build();
           return toDTO(repository.save(booking));
       }
   }
   ```

6. **Create controller**:
   ```java
   @RestController @RequestMapping("/api/bookings")
   @RequiredArgsConstructor
   public class BookingController {
       private final BookingService service;
       
       @PostMapping
       public ResponseEntity<BookingDTO> create(@Valid @RequestBody CreateBookingRequest req) {
           return ResponseEntity.status(HttpStatus.CREATED)
               .body(service.createBooking(req));
       }
   }
   ```

7. **Add tests** in `src/test/java/com/beautlyai/salon/<feature>/`

8. **Register in Spring** (optional, if custom config needed):
   ```java
   @Configuration
   public class BookingConfiguration {
       // Feature-specific beans here
   }
   ```

## Import Statements & Common Patterns

### REST Controller Imports
```java
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
```

### Service & Repository Imports
```java
import org.springframework.stereotype.Service;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
```

### Lombok & Data Imports
```java
import lombok.RequiredArgsConstructor;
import lombok.Data;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;
```

### JPA/Hibernate
```java
import jakarta.persistence.*;
import org.springframework.data.jpa.repository.JpaRepository;
```

### Validation
```java
import jakarta.validation.constraints.*;
```

## Git & Commit Workflow

- **Branch naming**: Feature branches as `feature/<name>` (e.g., `feature/booking-api`)
- **Commit messages**: Start with feature prefix, e.g., `booking: add POST /api/bookings endpoint`
- **No migrations in PRs**: Coordinate schema changes separately to avoid migration conflicts

## Known Limitations & Future Work

- **Flyway**: Disabled for now; enable when multi-instance deployments require coordinated migrations
- **Security**: Currently in-memory; must implement proper auth before production
- **Redis**: Optional in dev; required for scaling in production (multi-instance cache coherency)
- **API Docs**: No Swagger/OpenAPI yet; add `springdoc-openapi-starter-webmvc-ui` when needed
- **Async Processing**: No message queue yet; add Kafka/RabbitMQ when background jobs needed

## Gotchas & Anti-Patterns

✗ **Don't**:
- Use `new` keyword to instantiate Spring beans; use `@Autowired` or constructor injection
- Put business logic in controllers; keep controllers thin
- Commit database passwords to repo; use environment variables
- Call `@Async` methods from the same service (proxy not created); extract to separate service
- Use `ddl-auto=create-drop` in production; use Flyway migrations instead
- Mix package-private and public fields without clear reason; prefer consistent access modifiers

✓ **Do**:
- Use constructor injection with `@RequiredArgsConstructor` for testability
- Keep services focused on one domain (booking service handles bookings, not payments)
- Add `@Transactional` on service methods that modify data
- Use `@Valid` on controller request parameters for validation
- Use DTOs to decouple entity structure from API contracts
- Write tests before or alongside features
- Review `pom.xml` before adding dependencies; most common needs are already included

## Quick Reference: File Locations

| What | Where |
|------|-------|
| Application class | `src/main/java/.../SalonApiApplication.java` |
| Feature code | `src/main/java/.../salon/<feature>/` |
| Test code | `src/test/java/.../salon/<feature>/` |
| Database config | `src/main/resources/application.properties` |
| SQL migrations | `src/main/resources/db/migration/` |
| Maven config | `pom.xml` (root) |
| Build output | `target/` |

---

**For questions on Spring Boot 3.5.13, see [Official Docs](https://docs.spring.io/spring-boot/3.5.13/reference/)**
