# syntax=docker/dockerfile:1

# Stage 1: Build Spring Boot JAR
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy Maven wrapper and project files from backend/salon-api
COPY salon-api/mvnw ./mvnw
COPY salon-api/.mvn ./.mvn
COPY salon-api/pom.xml ./pom.xml
COPY salon-api/src ./src

RUN chmod +x ./mvnw && ./mvnw clean package -DskipTests

# Stage 2: Minimal runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Install minimal tool for container health check
RUN apk add --no-cache wget \
    && addgroup -S beautlyai \
    && adduser -S beautlyai -G beautlyai

COPY --from=build /app/target/salon-api-*.jar ./app.jar

EXPOSE 8080

ENV SPRING_PROFILE=local

USER beautlyai

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java -Dspring.profiles.active=${SPRING_PROFILE} -jar app.jar"]

