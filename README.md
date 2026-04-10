# BeautlyAI Salon Management System
## Complete Architecture & Setup Guide

> **Version 1.0** | Last Updated: April 2026 | Built by ViralgaraJ.com

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Tech Stack](#tech-stack)
4. [AWS Environment Setup](#aws-environment-setup)
5. [Local Development](#local-development)
6. [Deployment](#deployment)
7. [Contributing Guidelines](#contributing-guidelines)

---

## 🎯 Project Overview

**BeautlyAI** is an enterprise-grade salon management system serving 4 distinct user roles:

| Role | Purpose | Key Features |
|------|---------|--------------|
| **Customer** | Book services, view profile | Service browsing, booking management, payment integration |
| **Staff** | Manage schedule, serve clients | Schedule view, client management, performance tracking |
| **Owner** | Business analytics, staff management | Revenue reports, staff payroll, analytics dashboard |
| **Admin** | System-wide management | User management, salon configuration, system settings |

**Architecture Highlights:**
- ✅ AWS Free Tier optimized ($0 for 12 months)
- ✅ Monorepo structure for full-stack development
- ✅ React Native app (iOS/Android from single codebase)
- ✅ Spring Boot REST API with JWT authentication
- ✅ PostgreSQL database with Flyway migrations
- ✅ Terraform infrastructure as code (IaC)
- ✅ GitHub Actions CI/CD pipelines
- ✅ Enterprise-level security & scalability

---

## 📁 Repository Structure

```
beautlyai-salon/
├── mobile/                          # React Native Multi-Role App
│   ├── src/
│   │   ├── screens/                 # Role-based screens
│   │   │   ├── auth/                # Authentication screens
│   │   │   ├── customer/            # Customer app screens
│   │   │   ├── staff/               # Staff app screens
│   │   │   ├── owner/               # Owner dashboard screens
│   │   │   └── admin/               # Admin management screens
│   │   ├── components/              # Shared UI components (React Native Paper)
│   │   │   └── common/              # Reusable components
│   │   ├── navigation/              # React Navigation stacks per role
│   │   ├── services/                # API client, authentication, notifications
│   │   ├── store/                   # Zustand global state management
│   │   ├── constants/               # App-wide constants
│   │   └── theme/                   # React Native Paper theming
│   ├── App.tsx                      # Root component
│   ├── package.json
│   ├── tsconfig.json
│   ├── app.json                     # EAS & Expo configuration
│   └── assets/                      # App icons, splash screens
│
├── backend/                         # Spring Boot REST API
│   ├── salon-api/                   # Main API service
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── java/com/beautlyai/salon/
│   │   │   │   │   ├── auth/        # JWT + role-based authorization
│   │   │   │   │   ├── booking/     # Appointment domain
│   │   │   │   │   ├── client/      # CRM (customer/staff profiles)
│   │   │   │   │   ├── staff/       # Staff & payroll management
│   │   │   │   │   ├── payment/     # Not used in this project
│   │   │   │   │   ├── notification/# SMS, email, push notifications
│   │   │   │   │   └── common/      # Shared utilities, exception handling
│   │   │   │   └── resources/
│   │   │   │       ├── application.properties
│   │   │   │       ├── application-local.yml
│   │   │   │       └── db/migration/ # Flyway SQL migrations
│   │   │   └── test/                # Unit & integration tests
│   │   ├── pom.xml                  # Maven dependencies
│   │   ├── Dockerfile               # Production image
│   │   ├── docker-compose.yml       # Local dev environment
│   │   └── README.md                # Backend-specific docs
│   │
│   ├── docker-compose.yml           # Database + backend orchestration
│   ├── init-db/                     # Database initialization scripts
│   └── README.md                    # Backend overview
│
├── infra/                           # Terraform Infrastructure as Code
│   ├── modules/                     # Reusable Terraform modules
│   │   ├── vpc/                     # VPC, subnets, NAT, routing
│   │   ├── rds/                     # PostgreSQL database
│   │   ├── ecs/                     # EC2 for Spring Boot (free tier)
│   │   ├── s3/                      # 3 S3 buckets (uploads, exports, static)
│   │   └── sqs-sns/                 # Message queues & SNS topics
│   │
│   ├── environments/
│   │   ├── dev/                     # Development environment config
│   │   │   ├── main.tf              # Module composition
│   │   │   ├── provider.tf          # AWS provider & remote state
│   │   │   ├── variables.tf         # Variable definitions
│   │   │   └── dev.tfvars           # Dev-specific values
│   │   └── prod/                    # (Future) Production config
│   │
│   └── README.md                    # Infrastructure documentation
│
├── .github/
│   └── workflows/                   # GitHub Actions CI/CD
│       ├── backend-ci.yml           # Build, test, code quality
│       └── mobile-ci.yml            # Mobile lint, test, build
│
├── .gitignore                       # Git ignore rules
└── README.md                        # Project overview

```

### Folder Purposes at a Glance

| Folder | Purpose | Technology |
|--------|---------|------------|
| `/mobile` | React Native app for all 4 roles | React Native, TypeScript, Zustand, Expo |
| `/backend/salon-api` | REST API & business logic | Spring Boot, PostgreSQL, JWT, AWS SDK |
| `/infra` | Cloud infrastructure definitions | Terraform, AWS (VPC, RDS, ECS, S3, SQS, SNS) |
| `/.github/workflows` | Automated CI/CD pipelines | GitHub Actions |

---

## 🛠️ Tech Stack

### Mobile (React Native)
```
Frontend:
  - React Native 0.73+
  - React Navigation 6.x (for routing)
  - React Native Paper (Material Design UI)
  - Zustand (state management)
  - Axios (HTTP client)
  - Expo (build & deployment)
  - TypeScript (full type safety)
  
Services:
  - expo-notifications (push notifications)
  - expo-secure-store (secure credential storage)
  - expo-device (device info)
```

### Backend (Spring Boot)
```
Framework:
  - Spring Boot 3.5.13 (latest LTS)
  - Spring Security (JWT authentication)
  - Spring Data JPA (database access)
  - Spring Cache (in-memory caching)

Database:
  - PostgreSQL 15 (primary)
  - Flyway (database migrations)

AWS Integration:
  - AWS SDK 2.25.0 (S3, SQS, SNS, SSM)
  - No payment gateway is included in the current scope

Development:
  - Maven (dependency management)
  - Java 21 (latest LTS)
  - JUnit 5 + Mockito (testing)
  - Lombok (boilerplate reduction)
  - MapStruct (object mapping)
```

### Infrastructure (Terraform)
```
Cloud:
  - AWS (ap-southeast-1 region)
  - Free Tier optimized
  
Services:
  - VPC (networking)
  - RDS db.t2.micro (PostgreSQL 15)
  - EC2 t2.micro (Spring Boot)
  - S3 (file storage)
  - SQS (message queue)
  - SNS (notifications)
  - SSM Parameter Store (secrets)
  - ECR (Docker images)
```

### CI/CD
```
- GitHub Actions (workflow automation)
- Maven (Java build)
- npm (Node.js dependencies)
- Docker (containerization)
```

---

## 🚀 AWS Environment Setup

### Prerequisites
- AWS Account (free tier eligible)
- AWS CLI installed
- AWS credentials configured
- Terraform 1.0+
- Docker & Docker Compose

### Step 1: Configure AWS CLI

```bash
# Install AWS CLI v2 (if not already installed)
# macOS: brew install awscli
# Windows: choco install awscli
# Linux: https://aws.amazon.com/cli/

# Configure credentials (get keys from IAM user)
aws configure
# AWS Access Key ID: [PROVIDED BY TEAM LEAD]
# AWS Secret Access Key: [PROVIDED BY TEAM LEAD]
# Default region: ap-southeast-1
# Default output format: json

# Verify configuration
aws sts get-caller-identity
```

### Step 2: Create Terraform State Backend

```bash
# Create S3 bucket for Terraform state
aws s3api create-bucket \
  --bucket beautlyai-terraform-state \
  --region ap-southeast-1 \
  --create-bucket-configuration LocationConstraint=ap-southeast-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket beautlyai-terraform-state \
  --versioning-configuration Status=Enabled

# Create DynamoDB table for state locking
aws dynamodb create-table \
  --table-name beautlyai-terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region ap-southeast-1
```

### Step 3: Store Secrets in SSM Parameter Store

```bash
# Database password
aws ssm put-parameter \
  --name "/beautlyai/dev/db/password" \
  --type "SecureString" \
  --value "your_secure_password_here"

# JWT Secret (generate with: openssl rand -base64 64)
aws ssm put-parameter \
  --name "/beautlyai/dev/jwt/secret" \
  --type "SecureString" \
  --value "your_jwt_secret_here"

# No payment gateway secrets are stored in SSM for this project

# Verify
aws ssm get-parameters-by-path \
  --path "/beautlyai/dev/" \
  --with-decryption \
  --query "Parameters[*].[Name,Value]" \
  --output table
```

### Step 4: Deploy Infrastructure

```bash
cd infra/environments/dev

# Initialize Terraform
terraform init

# Plan deployment (review changes)
terraform plan -var-file="dev.tfvars"

# Apply changes (type 'yes' when prompted)
terraform apply -var-file="dev.tfvars"

# Get outputs (save these for later)
terraform output
```

**Expected Outputs:**
- `ec2_public_ip` - Spring Boot API endpoint
- `rds_endpoint` - Database connection string
- `s3_uploads_bucket` - User file storage
- `sqs_notification_queue_url` - Message queue
- `sns_topic_arn` - Notification topic

---

## 💻 Local Development

### Backend Setup

```bash
cd backend/salon-api

# Build the project
./mvnw clean install

# Run locally with Docker Compose
docker-compose up

# Migrations run automatically on startup
# API available at: http://localhost:8080

# Check health
curl http://localhost:8080/actuator/health
```

**Docker Compose services:**
- `postgres` (port 5432)
- `spring-boot-api` (port 8080)

### Mobile Setup

```bash
cd mobile

# Install dependencies
npm install

# Create .env from template
cp .env.example .env
# Edit .env with your API URL

# Run on iOS (macOS only)
npm run ios

# Run on Android
npm run android

# Run in web browser (testing)
npm run web

# EAS Build (for physical devices)
npm install -g eas-cli
eas login
eas build --platform ios
```

### Database Migrations

Migrations are managed with **Flyway**:

```bash
# Migrations are in: backend/salon-api/src/main/resources/db/migration/
# Naming: V1__initial_schema.sql, V2__add_users_table.sql, etc.

# Run migrations manually
cd backend/salon-api
./mvnw flyway:migrate

# Validate migrations
./mvnw flyway:validate
```

**Schema Structure:**
- `users` - All users (customers, staff, owners, admins)
- `roles` - Role definitions
- `services` - Salon services
- `bookings` - Appointments
- `payments` - Transactions
- `payroll` - Staff payments

---

## 🚢 Deployment

### Build Spring Boot Docker Image

```bash
cd backend/salon-api

# Build JAR
./mvnw clean package

# Build Docker image
docker build -t salon-api:latest .

# Push to ECR (AWS container registry)
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.ap-southeast-1.amazonaws.com

docker tag salon-api:latest \
  123456789.dkr.ecr.ap-southeast-1.amazonaws.com/salon-api:latest

docker push 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/salon-api:latest
```

### Deploy to EC2

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@<EC2_PUBLIC_IP>

# Pull latest image
docker pull 123456789.dkr.ecr.ap-southeast-1.amazonaws.com/salon-api:latest

# Run container
docker run -d \
  -p 8080:8080 \
  -e DB_HOST=<RDS_ENDPOINT> \
  -e DB_NAME=beautlyai_dev \
  -e DB_USER=beautlyai_admin \
  -e DB_PASSWORD=$(aws ssm get-parameter --name "/beautlyai/dev/db/password" --with-decryption --query 'Parameter.Value' --output text) \
  123456789.dkr.ecr.ap-southeast-1.amazonaws.com/salon-api:latest
```

### Mobile Deployment

```bash
# iOS App Store
eas build --platform ios
eas submit --platform ios

# Google Play Store
eas build --platform android
eas submit --platform android
```

---

## 🤝 Contributing Guidelines

### Branch Naming
```
feature/feature-name       # New features
bugfix/bug-name           # Bug fixes
hotfix/critical-fix       # Production hotfixes
chore/task-name          # Documentation, config, etc.
```

### Commit Messages
```
format: <type>: <subject>

Types:
  feat:     New feature
  fix:      Bug fix
  docs:     Documentation
  style:    Code style (formatting, missing semicolons)
  refactor: Code refactoring
  test:     Test cases
  chore:    Build, dependencies, config

Example:
  feat: Add booking creation endpoint
  fix: Resolve JWT token expiration issue
```

### Pull Request Process
1. Create feature branch from `develop`
2. Make changes & commit
3. Push to remote
4. Create PR against `develop`
5. Ensure CI/CD passes
6. Get code review
7. Merge to `develop`
8. Deploy to staging

### Code Quality Standards

**Backend (Java):**
- Follow Google Java Style Guide
- Write unit tests (>80% coverage)
- Use try-catch for exception handling
- Document public APIs with JavaDoc
- Validate all inputs
- No hardcoded values

**Mobile (TypeScript/React Native):**
- Full TypeScript type coverage
- ESLint + Prettier configured
- Write unit tests with Jest
- Use React hooks best practices
- Functional components only
- Proper error boundary handling

**Terraform:**
- Use descriptive resource names
- Include comments for complex logic
- Validate with `terraform validate`
- Format with `terraform fmt`
- Use variables for reusable values
- Include outputs documentation

---

## 📚 Additional Documentation

| Document | Purpose |
|----------|---------|
| [`backend/salon-api/README.md`](../backend/salon-api/README.md) | Backend API documentation |
| [`infra/README.md`](../infra/README.md) | Infrastructure guide |
| [`mobile/README.md`](../mobile/README.md) | Mobile app guide |
| [API Specification](../backend/salon-api/API.md) | REST endpoint documentation |
| [Database Schema](../backend/salon-api/DATABASE.md) | ERD & table definitions |

---

## ❓ FAQ

**Q: How much will this cost?**
A: $0 for 12 months (AWS Free Tier). After that, ~$15-30/month depending on usage.

**Q: Can I migrate to production later?**
A: Yes! Just change Terraform variables (RDS class, EC2 type, add ALB/Auto-scaling).

**Q: How do I rotate secrets?**
A: Update in SSM Parameter Store, then redeploy: `terraform apply`

**Q: What if I exceed free tier limits?**
A: AWS will alert you. Simply upgrade variables in `dev.tfvars` and reapply.

---

## 📞 Support

- **Team Lead:** [contact]
- **Slack:** #beautlyai-dev
- **Issue Tracker:** GitHub Issues

---

**Last Updated:** April 8, 2026 | **Version:** 1.0 | **Maintained by:** ViralgaraJ.com

