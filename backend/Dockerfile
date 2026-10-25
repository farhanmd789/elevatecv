# ─── Stage 1: Build the Spring Boot Application ──────────────────────────────
FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build jar
COPY src ./src
RUN mvn clean package -DskipTests -B

# ─── Stage 2: Minimal Production JRE Runtime ─────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Add a non-root application user for container security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy executable jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Environment defaults
ENV PORT=8081
EXPOSE ${PORT}

# Run the Spring Boot application
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
