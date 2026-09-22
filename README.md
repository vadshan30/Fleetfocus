# FleetFocus — Real-Time Vehicle Telematics & Fleet Management System

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.1.2-brightgreen.svg?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Java](https://img.shields.io/badge/Java-17-orange.svg?style=for-the-badge&logo=openjdk)](https://www.oracle.com/java/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![Build Status](https://img.shields.io/badge/Build-Passing-success.svg?style=for-the-badge)](https://github.com/vadshan30/Fleetfocus)
[![Tests](https://img.shields.io/badge/Tests-59%20Passing-brightgreen.svg?style=for-the-badge)](https://github.com/vadshan30/Fleetfocus)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

An enterprise-grade Fleet Management System built with **Spring Boot 3** and **React 18**. FleetFocus delivers real-time vehicle telematics monitoring, driver safety tracking, automated trip dispatching, maintenance lifecycle tracking, and role-based access control. Designed for high-availability fleet operations with dark mode support and live telemetry stream processing.

---

## Table of Contents

- [Features](#-features)
- [Screenshots](#-screenshots)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Database Configuration](#database-configuration)
- [Database Schema](#-database-schema)
- [API Documentation](#-api-documentation)
- [Role-Based Access Control](#-role-based-access-control)
- [Test Credentials](#-test-credentials)
- [Testing](#-testing)
- [Project Status](#-project-status)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)
- [Acknowledgments](#-acknowledgments)

---

## Features

### Authentication & Security
- **Stateless JWT Authentication**: Secure 24-hour token expiration with HS256 signing.
- **BCrypt Hashing**: Passwords stored securely with adaptive salt rounds.
- **Granular Role-Based Access Control (RBAC)**: 4 predefined system roles (`FLEET_MANAGER`, `DISPATCHER`, `DRIVER`, `MAINTENANCE_TECH`).

### Fleet & Driver Management
- **Vehicle Inventory**: Real-time status (`AVAILABLE`, `ON_TRIP`, `UNDER_MAINTENANCE`), mileage tracking, and fuel level monitoring.
- **Driver Profiles**: Verified operator licenses, safety rating tracking (4.9 ★ scale), and duty state management (`AVAILABLE`, `ON_TRIP`, `OFF_DUTY`).

### Operations & Telemetry
- **Trip Lifecycle Management**: Immediate dispatching, advance trip scheduling, active journey tracking, and cancellation controls.
- **Live Fleet Monitoring**: Real-time vehicle telemetry auto-refreshing every 5 seconds with speeding alerts (> 100 km/h) and GPS location badges.
- **Maintenance Tracking**: Complete service log history, repair cost calculation, and automated mileage interval alerts (every 5,000 km).

### Analytics & Usability
- **Interactive Executive Dashboard**: Donut charts for fleet availability distribution, top performing drivers/vehicles, and fuel cost efficiency analytics.
- **Data Export**: One-click CSV export across all list tables (Vehicles, Drivers, Trips, Maintenance).
- **Theme Support**: Seamless Dark Mode / Light Mode toggle with glassmorphism UI components.

---


## Tech Stack

| Layer | Technology | Version | Description |
|---|---|---|---|
| **Backend Framework** | Spring Boot | 3.1.2 | RESTful web service API layer |
| **Language** | Java | 17 LTS | Core backend business logic |
| **Security** | Spring Security + JWT | 6.1.2 · 0.11.5 | Authentication & RBAC filter chain |
| **ORM / Data Access** | Spring Data JPA (Hibernate) | 6.2.6 | Relational database abstraction |
| **Database** | MySQL | 8.0 | Enterprise relational database |
| **Build Tool** | Apache Maven | 3.8+ | Backend dependency management |
| **API Docs** | Springdoc OpenAPI (Swagger) | 2.1.0 | Interactive API documentation |
| **Backend Testing** | TestNG + Mockito | 7.7.1 · 5.3.1 | Unit & Integration testing suite |
| **Frontend Framework** | React | 18.2.0 | Declarative UI component library |
| **State Management** | Redux Toolkit | 1.9.5 | Centralized global application state |
| **Routing** | React Router DOM | 6.14.1 | Client-side page routing |
| **HTTP Client** | Axios | 1.4.0 | Promise-based REST API requests |
| **Styling** | Tailwind CSS + CSS Vars | 3.4.19 | Modern utility-first design system |
| **Icons** | Lucide React | 1.47.0 | Clean SVG icon components |
| **Frontend Testing** | Jest + React Testing Library | 29.5.0 | Component rendering & unit tests |

---

## System Architecture

```text
                               +----------------------------------+
                               |        React 18 Single-Page App  |
                               | (Redux Toolkit, Tailwind, Lucide)|
                               +-----------------+----------------+
                                                 |
                                         HTTPS / REST API
                                                 |
                                                 v
                               +-----------------+----------------+
                               |     Spring Boot 3.1 REST API     |
                               +----------------------------------+
                               |  JwtAuthenticationFilter (Security)|
                               +-----------------+----------------+
                               |   Controllers   |   Services     |
                               |   (7 Controllers|   (Business Lg)|
                               +-----------------+----------------+
                                                 |
                                         Spring Data JPA
                                                 |
                                                 v
                               +-----------------+----------------+
                               |        MySQL 8.0 Database        |
                               |  (7 Tables: Users, Vehicles, etc)|
                               +----------------------------------+
```

---

## Project Structure

```text
Fleetfocus/
├── backend/                              # Spring Boot Backend Application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/fleetfocus/
│   │   │   │   ├── config/               # Security, JWT & OpenAPI configs
│   │   │   │   ├── controller/           # REST Endpoints (7 Controllers)
│   │   │   │   ├── dto/                  # Data Transfer Objects
│   │   │   │   ├── model/                # JPA Entity Models (7 Entities)
│   │   │   │   ├── repository/           # Spring Data Repositories
│   │   │   │   ├── security/             # Custom UserDetailsService & JWT Filter
│   │   │   │   └── service/              # Core Business Logic Services
│   │   │   └── resources/
│   │   │       ├── application.properties# App configuration & DB connection
│   │   │       └── schema.sql            # Initial DB DDL script
│   │   └── test/                         # 29 Backend TestNG Unit Tests
│   └── pom.xml                           # Maven Dependencies
│
└── frontend/                             # React Single-Page Application
    ├── public/                           # Static assets & index.html
    ├── src/
    │   ├── components/
    │   │   ├── common/                   # SkeletonLoader, EmptyState, Toast
    │   │   ├── dashboard/                # Dashboard, LiveFleet, DriverPerformance
    │   │   ├── drivers/                  # DriverList, DriverForm
    │   │   ├── layout/                   # Sidebar, TopNavbar
    │   │   ├── maintenance/              # MaintenanceList, MaintenanceForm
    │   │   ├── trips/                    # TripList, TripForm, ScheduleTripForm
    │   │   ├── ui/                       # StatCard, StatusBadge, DataTable, SlideOver
    │   │   └── vehicles/                 # VehicleList, VehicleForm, VehicleDetails
    │   ├── services/                     # Axios API clients
    │   ├── store/                        # Redux slices (auth, vehicles, trips)
    │   ├── styles/                       # Tailwind & custom CSS variables
    │   ├── App.js                        # Client routing & layout wrapper
    │   └── index.js                      # React application entrypoint
    ├── package.json                      # npm dependencies & scripts
    └── tailwind.config.js                # Tailwind CSS configuration
```

---

## Getting Started

### Prerequisites
Ensure you have the following installed on your local system:
- **Java Development Kit (JDK)**: Version 17 or higher
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **MySQL Server**: Version 8.0 or higher
- **Maven**: Version 3.8+ (or use included `mvnw`)

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd Fleetfocus/backend
   ```

2. **Configure Database Connection**:
   Update `src/main/resources/application.properties` with your local MySQL credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/fleetfocus_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   spring.jpa.hibernate.ddl-auto=update
   ```

3. **Build the Backend Application**:
   ```bash
   mvn clean install
   ```

4. **Run the Spring Boot Application**:
   ```bash
   mvn spring-boot:run
   ```
   The backend server will start at `http://localhost:8080`.

---

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd Fleetfocus/frontend
   ```

2. **Install Node Dependencies**:
   ```bash
   npm install
   ```

3. **Compile Tailwind CSS Stylesheet**:
   ```bash
   npm run build:css
   ```

4. **Start the Development Server**:
   ```bash
   npm start
   ```
   The frontend web app will automatically open at `http://localhost:3000`.

---

### Database Configuration

The application will automatically create the `fleetfocus_db` schema on startup if it does not exist. Initial seed data (default admin accounts and test vehicles) is executed on first launch.

```sql
CREATE DATABASE IF NOT EXISTS fleetfocus_db;
USE fleetfocus_db;
```

---

## Database Schema

FleetFocus utilizes 7 relational database entities mapped via JPA:

| Entity Name | Table Name | Key Fields | Description |
|---|---|---|---|
| **SystemUser** | `users` | `id`, `username`, `email`, `password`, `role` | Authentication accounts & user role |
| **Vehicle** | `vehicles` | `id`, `vin`, `licensePlate`, `model`, `status`, `currentMileage` | Fleet inventory & mileage logs |
| **Driver** | `drivers` | `id`, `user_id`, `licenseNumber`, `status` | Driver profiles linked to SystemUser |
| **Trip** | `trips` | `id`, `vehicle_id`, `driver_id`, `startTime`, `endTime`, `status`, `distanceCovered` | Dispatch & journey tracking |
| **TelemetryData** | `telemetry_data` | `id`, `vehicle_id`, `latitude`, `longitude`, `speed`, `fuelLevel`, `timestamp` | Real-time vehicle sensor data |
| **MaintenanceLog** | `maintenance_logs` | `id`, `vehicle_id`, `technician_id`, `serviceDate`, `description`, `cost` | Vehicle repair & service history |
| **Alert** | `alerts` | `id`, `vehicle_id`, `alertType`, `message`, `timestamp`, `isResolved` | System notifications & warnings |

```text
Relationship Overview:
[SystemUser] (1) <---> (1) [Driver]
[Vehicle]    (1) <---> (*) [Trip]
[Driver]     (1) <---> (*) [Trip]
[Vehicle]    (1) <---> (*) [TelemetryData]
[Vehicle]    (1) <---> (*) [MaintenanceLog]
```

---

## API Documentation

Interactive OpenAPI 3.0 documentation is powered by Swagger UI.

- **Swagger UI Console**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON Spec**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

### Sample API Requests

#### 1. User Authentication
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

#### 2. Fetch Available Vehicles
```bash
curl -X GET http://localhost:8080/api/vehicles/available \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

#### 3. Dispatch New Trip
```bash
curl -X POST http://localhost:8080/api/trips/start \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"vehicleId": 1, "driverId": 2}'
```

---

## Role-Based Access Control

| Feature / Action | FLEET_MANAGER | DISPATCHER | DRIVER | MAINTENANCE_TECH |
|---|:---:|:---:|:---:|:---:|
| **View Dashboard & Telemetry** | ✅ | ✅ | ✅ | ✅ |
| **Create / Edit / Delete Vehicles** | ✅ | ❌ | ❌ | ❌ |
| **Create / Edit / Delete Drivers** | ✅ | ❌ | ❌ | ❌ |
| **Dispatch & Schedule Trips** | ✅ | ✅ | ❌ | ❌ |
| **End / Cancel Trips** | ✅ | ✅ | ✅ | ❌ |
| **Log Maintenance & Service** | ✅ | ❌ | ❌ | ✅ |
| **Export Data to CSV** | ✅ | ✅ | ✅ | ✅ |

---

## Test Credentials

Use these pre-configured user credentials to test various role permissions:

| Role | Username | Password | Access Scope |
|---|---|---|---|
| **Fleet Manager** | `admin` | `admin123` | Full Administrative Access |
| **Dispatcher** | `dispatcher` | `disp123` | Trip Dispatching & Driver Tracking |
| **Driver** | `driver1` | `driver123` | Assigned Trip Execution |
| **Maintenance Tech** | `tech1` | `tech123` | Service Logging & Vehicle Maintenance |

---

## Testing

### Backend Unit & Integration Tests (TestNG)
Execute backend unit tests:
```bash
cd Fleetfocus/backend
mvn test
```
**Expected Output**:
```text
[INFO] Tests run: 29, Failures: 0, Skips: 0
[INFO] BUILD SUCCESS
```

### Frontend Unit & Component Tests (Jest)
Execute frontend tests:
```bash
cd Fleetfocus/frontend
npm test -- --watchAll=false
```
**Expected Output**:
```text
Test Suites: 6 passed, 6 total
Tests:       30 passed, 30 total
Snapshots:   0 total
Time:        4.12 s
```

---

## Project Status

- **Backend Development**: ![100%](https://geps.dev/progress/100) Complete
- **Frontend UI/UX Upgrade**: ![100%](https://geps.dev/progress/100) Complete
- **Test Coverage**: ![100%](https://geps.dev/progress/100) 59/59 Tests Passing
- **API Documentation**: ![100%](https://geps.dev/progress/100) Complete

---

## Roadmap

- [x] JWT Authentication & Role-Based Access Control
- [x] Enterprise SaaS UI Design System (Tailwind CSS v3 + Lucide)
- [x] Live Telemetry Auto-Refresh Engine (5s polling)
- [x] Automated Maintenance Mileage Threshold Alerts
- [ ] **AI Assistant Integration**: Natural language fleet querying ("Which drivers need service?")
- [ ] **Predictive Maintenance ML**: Machine learning module predicting engine breakdown risk
- [ ] **Driver Safety Scoring**: Automated score recalculation based on speeding & harsh braking
- [ ] **GPS Route Optimization**: OpenStreetMap / Mapbox live route plotting

---

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository (`https://github.com/vadshan30/Fleetfocus`)
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Author

- **Name**: SRI VADSHAN J
- **GitHub**: [@vadshan30](https://github.com/vadshan30)

---

## 🙏 Acknowledgments

- **Spring Boot Team** for providing an enterprise Java framework.
- **React Community & Tailwind Labs** for modern frontend tooling.
- **Lucide Icons** for clean, accessible SVG icons.
