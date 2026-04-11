# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy Maven wrapper and project files
COPY mvnw .
COPY .mvn ./.mvn
COPY pom.xml .
COPY src ./src

RUN chmod +x ./mvnw && ./mvnw clean package -DskipTests

# Stage 2: Run (minimal image)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user for security
RUN addgroup -S beautlyai && adduser -S beautlyai -G beautlyai
RUN apk add --no-cache wget

COPY --from=build /app/target/salon-api-*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENV SPRING_PROFILE=local
ENV JAVA_OPTS="-Xms256m -Xmx512m"

USER beautlyai

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dspring.profiles.active=${SPRING_PROFILE} -jar app.jar"]
