# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src
RUN ./mvnw clean package -DskipTests

# Stage 2: Run (minimal image)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S beautlyai && adduser -S beautlyai -G beautlyai
USER beautlyai

COPY --from=build /app/target/salon-api-*.jar app.jar
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \
 CMD wget -qO- http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "-Dspring.profiles.active=${SPRING_PROFILE}", "app.jar"]

