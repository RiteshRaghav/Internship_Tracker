<<<<<<< HEAD
# Internship_Tracker
=======
# Internship Tracker
 
 ![Java](https://img.shields.io/badge/Java-17-blue)
 ![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.x-brightgreen)
 ![React](https://img.shields.io/badge/React-18-61dafb)
 ![Build](https://img.shields.io/badge/build-Maven-orange)

 A full-stack application to manage internship applications, resumes, and user profiles with authentication, email-based password reset, and file uploads.

## Features
- __User authentication__: Register, login, JWT auth, `GET /api/auth/me` for profile
- __Password reset via email__: `POST /api/auth/forgot-password` and `POST /api/auth/reset-password`
- __Internship tracking__: CRUD, search by company, filter by status
- __Resume management__: Upload and link resumes to internships
- __Material UI frontend__: Modern React UI with protected routes
- __File uploads__: Configurable upload dir and size limits
- __Database migrations__: Flyway ready

## Screenshots
 Add screenshots in `docs/screenshots/` and reference them here, e.g.:
 
 ![Login](docs/screenshots/login.png)
 ![Dashboard](docs/screenshots/dashboard.png)

## Tech Stack
- __Backend__: Spring Boot 3, Spring Security, Spring Data JPA, JWT (jjwt), Flyway, Java 17
- __DB__: MySQL (runtime driver also supports PostgreSQL if needed)
- __Frontend__: React (CRA), React Router, Material UI, Axios
- __Build__: Maven

## Project Structure
```
/ (project root)
├─ pom.xml
├─ src/main/java/com/Siddharth/internshiptracker/
│  ├─ Controller/ (Auth, Internship, Profile, Resume, User, Test)
│  ├─ config/ (SecurityConfig, JwtConfig, JwtFilter, WebConfig, etc.)
│  ├─ dto/ (LoginRequest, InternshipDTO)
│  ├─ model/ (User, Internship, Resume)
│  ├─ repository/ (...Repository)
│  └─ service/ (UserService, InternshipService, EmailService, ResumeService)
├─ src/main/resources/
│  ├─ application.properties
│  └─ static/frontend/ (React app)
└─ uploads/ (stored files)
```

## Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 18+ and npm (for the frontend)
- MySQL 8+ server running and accessible

## Configuration
 All configuration is in `src/main/resources/application.properties`.
 
 You can configure via environment variables (recommended). Spring Boot maps env vars automatically, for example:
 - `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
 - `JWT_SECRET`, `JWT_EXPIRATION`
 - `SERVER_PORT`
 - `FILE_UPLOAD_DIR`, `MAX_FILE_SIZE`, `MAX_REQUEST_SIZE`
 - `FRONTEND_BASE_URL`
 - `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_SMTP_AUTH`, `MAIL_SMTP_STARTTLS`, `MAIL_FROM`

 Important properties to review/update before running:
- __Database__
  - `spring.datasource.url=jdbc:mysql://localhost:3306/internship_tracker`
  - `spring.datasource.username=...`
  - `spring.datasource.password=...`
  - `spring.jpa.hibernate.ddl-auto=update` (use `validate`/migrations in prod)
- __JWT__
  - `jwt.secret=...` (change in non-dev environments)
  - `jwt.expiration=86400000` (ms)
- __Server__
  - `server.port=8080`
  - `server.servlet.context-path=/`
- __CORS__ is configured in `SecurityConfig` with permissive defaults for dev
- __File uploads__
  - `file.upload-dir=uploads`
  - `spring.servlet.multipart.max-file-size=15MB`
  - `spring.servlet.multipart.max-request-size=20MB`
- __Frontend base URL__ (for reset links)
  - `app.frontend.base-url=http://localhost:3000`
- __Email (SMTP)__
  - `spring.mail.host`, `spring.mail.port`, `spring.mail.username`, `spring.mail.password`
  - `spring.mail.properties.mail.smtp.auth=true`
  - `spring.mail.properties.mail.smtp.starttls.enable=true`

 Security note: do not commit real credentials or secrets. Prefer environment variables or a secrets manager for production.

### Quick start: Environment variables
 1) Copy `.env.example` to `.env` and fill in values.
 2) Export in your shell (Mac/Linux) before running the backend:
    ```bash
    # Example (adjust values)
    export SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/internship_tracker"
    export SPRING_DATASOURCE_USERNAME="root"
    export SPRING_DATASOURCE_PASSWORD="<your-password>"
    export JWT_SECRET="<a-long-random-secret>"
    export FRONTEND_BASE_URL="http://localhost:3000"
    export MAIL_HOST="smtp.gmail.com"
    export MAIL_PORT=587
    export MAIL_USERNAME="<your-email>"
    export MAIL_PASSWORD="<your-app-password>"
    ```
    Note: Spring Boot does not automatically read `.env`; use `export`, your IDE run config, or tools like `direnv`.

## Database Setup (MySQL)
1. Create database:
   ```sql
   CREATE DATABASE internship_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Update `spring.datasource.*` in `application.properties`.
3. Optionally configure Flyway (place migrations under `src/main/resources/db/migration`).

## Running the Backend (Spring Boot)
- From project root:
  ```bash
  ./mvnw spring-boot:run
  # or with Maven installed
  mvn spring-boot:run
  ```
- The API will be available at `http://localhost:8080/`.

## Running the Frontend (React)
- Navigate to `src/main/resources/static/frontend` and install deps:
  ```bash
  npm install
  npm start
  ```
- The app runs at `http://localhost:3000`. A proxy to `http://localhost:8080` is preconfigured in `package.json`.

## Authentication & Security
- JWT-based stateless auth. On login, backend returns `{ token, user }`.
- Include the token in `Authorization: Bearer <token>` for protected API calls.
- Public endpoints are permitted in `SecurityConfig`:
  - `/api/auth/**`
  - `/api/test/public`
  - `GET/POST /api/internships/**` (note: currently open; tighten for prod)
  - Static resources and `/error`
- Everything under `/api/**` otherwise requires authentication.

## Key API Endpoints
Auth (`/api/auth`):
- `POST /register` — register user
- `POST /login` — returns `{ token, user }`
- `GET /me` — current user
- `POST /forgot-password` — `{ email }` sends reset email
- `POST /reset-password` — `{ token, password }`

Internships (`/api/internships`):
- `POST /` — create internship
- `GET /` — list by `userId`
- `GET /{id}` — get one
- `PUT /{id}` — update (or `status` via query/body)
- `DELETE /{id}` — delete
- `GET /search?company=&userId=` — search by company
- `GET /filter?status=&userId=` — filter by status
- `GET /search-filter?company=&status=&userId=` — combined

Other controllers also exist for Profile, Resume, and User operations. Explore the `Controller/` package for specifics.

## Email & Password Reset
- `AuthController` sends a reset link to `${app.frontend.base-url}/reset-password?token=<uuid>`
- Configure SMTP properties for your provider (e.g., Gmail requires an App Password and TLS).

## File Uploads
- Upload directory: `uploads/` at project root. Ensure the process has write permissions.
- Size limits configurable via Spring properties.

## Production Notes
- Replace default secrets and SMTP creds with environment variables
- Tighten security rules in `SecurityConfig` (limit public access)
- Use Flyway migrations and set `spring.jpa.hibernate.ddl-auto=validate`
- Set CORS to allowed origins instead of `*`
- Configure HTTPS and reverse proxy as needed

## Troubleshooting
- __DB connection errors__: verify MySQL is running, credentials, and URL
- __CORS issues__: adjust `CorsConfigurationSource` in `SecurityConfig`
- __Emails not sending__: check SMTP creds, TLS, and less secure/app password settings
- __JWT invalid__: ensure clock skew and `jwt.secret` are consistent

## Scripts & Commands
- Backend dev: `mvn spring-boot:run`
- Backend test: `mvn test`
- Frontend dev: `npm start` in `src/main/resources/static/frontend`
- Frontend build: `npm run build`

## License
This project currently has no explicit license. Add one if you plan to open-source or share publicly.
# Internship-tracker
>>>>>>> 869ecd9 (final commit)
