# RockOps Mining Site Management System - Project Guide

## 🎯 Quick Reference for AI Assistants

### System Overview
**RockOps** is a comprehensive mining site management system with REST API + WebSocket support, built with Spring Boot 3.4.5, PostgreSQL, and MinIO storage.

### Key Technologies
- **Backend**: Java 21 + Spring Boot 3.4.5
- **Database**: PostgreSQL + Spring Data JPA
- **Storage**: MinIO (local) / Cloudflare R2 (prod)
- **Auth**: JWT + Role-based (13 roles)
- **Real-time**: WebSocket + STOMP
- **Build**: Maven + Docker

---

## 📁 Critical File Locations

### Core Application Files
```
src/main/java/com/rockops/
├── RockOpsApplication.java                    # Main entry point
├── config/
│   ├── SecurityConfig.java                   # JWT + Security setup
│   ├── WebSocketConfig.java                  # WebSocket configuration
│   └── CorsConfig.java                       # CORS settings
├── controller/                               # REST endpoints
│   ├── AuthController.java                   # /api/v1/auth/*
│   ├── EquipmentController.java              # /api/equipment/*
│   ├── MaintenanceController.java            # /api/maintenance/*
│   └── [ModuleName]Controller.java           # Other endpoints
├── service/
│   ├── EquipmentService.java                 # Equipment business logic
│   ├── MaintenanceService.java               # Maintenance workflows
│   ├── NotificationService.java              # WebSocket notifications
│   └── MinioService.java                     # File storage
├── entity/                                   # JPA entities
│   ├── User.java                            # User + roles
│   ├── Equipment.java                       # Equipment management
│   └── MaintenanceRecord.java               # Maintenance tracking
└── dto/                                      # Data transfer objects
```

### Configuration Files
```
src/main/resources/
├── application.properties                    # Dev config
├── application-prod.properties               # Production config
├── application-docker.properties             # Docker config
└── db/migration/                            # Flyway migrations
```

### Build & Deployment
```
├── pom.xml                                   # Maven dependencies
├── Dockerfile                                # Container setup
├── docker-compose.yml                       # Local development
└── railway.json                             # Production deployment
```

---

## 🔧 Common Development Patterns

### Adding New Features
1. **Entity**: Create in `entity/` with JPA annotations
2. **Repository**: Extend JpaRepository in `repository/`
3. **Service**: Business logic in `service/`
4. **Controller**: REST endpoints in `controller/`
5. **DTO**: Data transfer objects in `dto/`

### Authentication Flow
- JWT tokens via `JwtAuthenticationFilter`
- Roles: `USER`, `SITE_ADMIN`, `PROCUREMENT`, `WAREHOUSE_MANAGER`, etc.
- Protected endpoints use `@PreAuthorize("hasRole('ROLE_NAME')")`

### WebSocket Notifications
- Send via `NotificationService.sendNotification()`
- Topics: `/user/queue/notifications` (personal), `/topic/notifications` (broadcast)

### File Operations
- Upload/download via `MinioService`
- Local: MinIO container, Production: Cloudflare R2

---

## 🚨 Key Business Rules

### Equipment Status Flow
`AVAILABLE` → `IN_MAINTENANCE` → `AVAILABLE`

### Maintenance Workflow
1. Create MaintenanceRecord
2. Add MaintenanceSteps
3. Mark as completed
4. Return equipment to service

### Multi-Site Architecture
- All entities are site-specific
- Users assigned to specific sites
- Data isolation per site

---

## 🐛 Common Issues & Solutions

### Database Issues
- **Location**: `application.properties` for DB config
- **Migrations**: Add to `db/migration/V{version}__description.sql`
- **Entity Problems**: Check JPA relationships in `entity/`

### Authentication Problems
- **Config**: `SecurityConfig.java`
- **JWT**: `JwtAuthenticationFilter.java`
- **Roles**: Check `User.java` roles enum

### WebSocket Issues
- **Config**: `WebSocketConfig.java`
- **Service**: `NotificationService.java`
- **Frontend**: Connect to `/ws` endpoint

### File Upload Problems
- **Service**: `MinioService.java`
- **Config**: MinIO settings in `application.properties`

---

## 📊 Database Schema Quick Reference

### Key Relationships
- `User` →← `Site` (Many-to-One)
- `Equipment` →← `Site` (Many-to-One)
- `Equipment` ← `MaintenanceRecord` (One-to-Many)
- `MaintenanceRecord` ← `MaintenanceStep` (One-to-Many)

### Important Tables
- `users` - Authentication + roles
- `sites` - Mining site data
- `equipment` - Machinery tracking
- `maintenance_records` - Service history
- `notifications` - System messages

---

## 🏗️ Architecture Decisions

### Why JWT?
Stateless authentication for REST API scalability

### Why WebSocket?
Real-time notifications for equipment status, maintenance updates

### Why MinIO?
S3-compatible object storage for file management

### Why PostgreSQL?
ACID compliance for financial/equipment data integrity

---

## 🔍 When Debugging Look Here

### Performance Issues
- Check JPA queries in service classes
- Review `application.properties` for connection pooling
- Monitor database logs

### Security Issues
- `SecurityConfig.java` for authentication setup
- `JwtAuthenticationFilter.java` for token validation
- Controller methods for `@PreAuthorize` annotations

### Integration Issues
- `WebSocketConfig.java` for real-time features
- `MinioService.java` for file operations
- `NotificationService.java` for messaging

---

## 💡 Quick Commands

### Local Development
```bash
docker-compose up -d          # Start PostgreSQL + MinIO
./mvnw spring-boot:run        # Run application
```

### Build & Deploy
```bash
./mvnw clean package          # Build JAR
docker build -t rockops .     # Build container
```

---

*This guide helps AI assistants quickly understand the RockOps system architecture and locate relevant files for any development task.*