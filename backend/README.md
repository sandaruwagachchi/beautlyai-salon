# Salon API - Local Development Setup

## Prerequisites
- Docker & Docker Compose installed
- Java 21
- Maven 3.8+

## Quick Start

### 1. Start PostgreSQL & Adminer
From the `backend/` directory:

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL 15 on port 5432
- Start Adminer on port 8081 for database UI
- Create the `beautylai_dev` database
- Mount a persistent volume for data

### 2. Build and Run the Application

From `backend/salon-api/` directory:

```bash
# Build the application
mvnw.cmd package

# Run the application
mvnw.cmd spring-boot:run
```

The API will start on `http://localhost:8080`

### 3. Access Services

| Service    | URL                 | Credentials                     |
|-----------|---------------------|---------------------------------|
| Salon API | http://localhost:8080 | JWT-based (see auth endpoints) |
| Adminer   | http://localhost:8081 | postgres / beautylai_admin / dev_password_123 |
| PostgreSQL | localhost:5432     | beautylai_admin / dev_password_123 |

## Database Initialization

Flyway migrations are automatically applied on startup. The schema is defined in:
```
src/main/resources/db/migration/V1__Initial_Schema.sql
```

## Stopping Services

```bash
docker-compose down
```

To also remove the data volume:
```bash
docker-compose down -v
```

## Troubleshooting

**Connection refused?**
- Ensure Docker containers are running: `docker-compose ps`
- Wait a few seconds for PostgreSQL to be ready (check health status)

**Port conflicts?**
- Change ports in `docker-compose.yml` if 5432 or 8081 are already in use

**Rebuild containers?**
```bash
docker-compose down -v
docker-compose up -d
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/register` - Register new user

### Clients
- `GET /api/clients` - List all clients
- `GET /api/clients/{id}` - Get client by ID
- `GET /api/clients/user/{userId}` - Get client by user ID
- `POST /api/clients` - Create new client
- `PUT /api/clients/{id}` - Update client
- `DELETE /api/clients/{id}` - Delete client

### Staff
- `GET /api/staff` - List all staff
- `GET /api/staff/active` - List active staff only
- `GET /api/staff/{id}` - Get staff by ID
- `GET /api/staff/user/{userId}` - Get staff by user ID
- `POST /api/staff` - Create new staff member
- `PUT /api/staff/{id}` - Update staff
- `DELETE /api/staff/{id}` - Delete staff

