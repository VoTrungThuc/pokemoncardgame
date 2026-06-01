# Pokémon Card Marketplace System (Production-Ready)

Welcome to the **Pokémon Card Marketplace**, a high-performance, secure, and production-grade fullstack web application for trading and selling collectible Pokémon cards.

---

## Technical Stack & Architecture

### Backend (Spring Boot 3.2.5)
- **Framework**: Spring Boot Web, Spring Security (Stateless JWT Auth).
- **Session Persistence**: Database-backed JWT Refresh Token mechanism with rotation and expiration.
- **Caching**: Spring Cache abstraction with automatic eviction on state changes.
- **ORM & Database**: Spring Data JPA + Hibernate + MySQL (optimized with custom JPQL `@Query` to fetch relations eagerly and prevent N+1 query problems).
- **Pagination**: Native database pagination utilizing `Pageable` and `Page<T>` on listing, rating, and trade history routes.
- **Validation**: Strict server-side request binding verification using Jakarta Validation (`@Valid`).
- **Global Exceptions**: Centralized exception handler controller (`@ControllerAdvice`) mapping validation, not found, and unauthorized requests to clean, standardized HTTP status envelopes.

### Frontend (React + Vite)
- **UI Framework**: React, styled with Tailwind CSS for clean, glassmorphic dark-mode designs.
- **API Access**: Axios client featuring custom request/response interceptors to catch expired JWT access tokens (`401 Unauthorized`), request a refresh token silently, queue pending requests, and retry automatically.
- **Routing**: Client-side tabbed state panel routing with strict session authorization guards.

### DevOps
- **Dockerization**: Complete container orchestration setup using Docker Compose. Includes a multi-stage optimized Maven build image for the backend and an Nginx reverse-proxy image for hosting the React bundle.

---

## Folder Structure

```
PRM-pokemon/
├── docker-compose.yml           # Root orchestration configuration
├── Dockerfile                   # Multi-stage JVM runtime builder
├── pom.xml                      # Backend project definitions
├── .env.example                 # Environment parameters template
├── src/                         # Backend Application
│   └── main/java/com/pokemon/marketplace/
│       ├── config/              # Security and DB seeder configs
│       ├── controller/          # REST Endpoints (Auth, Cards, Listings, Trades)
│       ├── dto/                 # Request/Response Data Objects
│       ├── entity/              # JPA Database Mapping Models
│       ├── exception/           # Custom exception definitions
│       ├── mapper/              # Object mapping definitions
│       ├── repository/          # JPA repositories
│       └── service/             # Transactional business logic
└── frontend/                    # Frontend Application
    ├── Dockerfile               # Node builder & Nginx setup
    ├── package.json             # NPM dependencies
    └── src/
        ├── components/          # React views (Profile, Dashboard, Cards)
        └── services/            # Axios API client integrations
```

---

## Standardized API Response Format

Every REST response is enveloped in a structured JSON payload:
```json
{
  "success": true,
  "data": { ... },
  "message": "Action completed successfully"
}
```

---

## Core API Endpoints

### 1. Authentication (`/api/auth`)
- `POST /api/auth/register` - Create a new user account (returns encrypted BCrypt passwords and User DTO).
- `POST /api/auth/login` - Validate username/password and return both access token (JWT) and refresh token.
- `POST /api/auth/refresh` - Request a new access token using a valid refresh token.
- `POST /api/auth/logout` - Revoke the refresh token and terminate the session.

### 2. Cards Catalog (`/cards`)
- `GET /cards` - Search, filter, and sort cards. Supporting query parameters:
  - `name`: Filter by card name.
  - `rarity`: Filter by card rarity class.
  - `minPrice`, `maxPrice`: Filter by base price range.
  - `page`, `size`, `sort`: Pageable arguments (e.g. `sort=score,desc` to sort by calculated deck strength score).
- `GET /cards/{id}` - Fetch metadata for a specific card (cached).
- `POST /cards` - Add a new card to the system (Admin only, evicts cards cache).
- `DELETE /cards/{id}` - Delete a card (Admin only, evicts cards cache).

### 3. Marketplace Listings (`/api/listings`)
- `GET /api/listings` - Paginated active marketplace items.
  - Query parameters: `availableOnly` (boolean), `page`, `size`, `sort`.
- `POST /api/listings` - List a card for sale.

### 4. Trade Desk (`/api/trades`)
- `POST /api/trades` - Propose a swap request between users. Includes "Fair Trade" validation checks (restricts swaps if card score difference > 1.5).
- `PUT /api/trades/{id}/accept` - Accept the trade, swap card owners, and reset market prices.
- `PUT /api/trades/{id}/reject` - Reject the trade request.
- `GET /api/trades/user/{userId}` - Fetch paginated trade requests involving a user (both sent and received).

### 5. Ratings (`/api/ratings`)
- `POST /api/ratings` - Submit a card quality review (1-10 rating, prevents duplicate ratings per user).
- `GET /api/ratings/card/{cardId}` - Fetch paginated user reviews for a card.

---

## Local Development Setup

### 1. Prerequisite Environments
- Java JDK 17
- Node.js (v18+)
- MySQL Server (v8) or local H2 fallback

### 2. Running Backend (Spring Boot)
1. Copy `.env.example` to `.env` in the root folder and configure your DB details.
2. Ensure you set your environment variables if running locally, or modify `src/main/resources/application.properties` to fall back to H2 database automatically if MySQL is missing.
3. Build and package the project:
   ```bash
   mvn clean install
   ```
4. Run the boot application:
   ```bash
   mvn spring-boot:run
   ```
5. Swagger API Docs will be available at:
   `http://localhost:8080/swagger-ui/index.html`

### 3. Running Frontend (React)
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install client dependencies:
   ```bash
   npm install
   ```
3. Run the development Vite server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   `http://localhost:5173`

---

## Docker Compose Orchestration (Recommended)

To run the complete production-grade system (MySQL database, Backend jar, and Nginx hosted React UI) seamlessly with one command:

1. Build and run the docker-compose stack:
   ```bash
   docker-compose up --build -d
   ```
2. The compose file sets up:
   - **MySQL Container**: Serving on port `3306`.
   - **Backend Spring Boot Container**: Running on port `8080` (waits for database health check).
   - **React Frontend Container**: Hosting the production bundle via Nginx on port `80`.

To stop the containers:
```bash
docker-compose down
```

---

## Cloud Deployment Guide

### Deployment on Railway (VPS/PaaS)
1. **Database**: Spin up a "MySQL" instance on Railway. Copy the connection credentials (URL, Username, Password).
2. **Spring Boot Backend**:
   - Create a service pointing to your GitHub repository root.
   - Specify the build command as `mvn clean package -DskipTests`.
   - Under variables, add:
     - `MYSQL_URL`: Your Railway MySQL connection string.
     - `MYSQL_USER`: Database user.
     - `MYSQL_PASSWORD`: Database password.
     - `JWT_SECRET`: A secure, base64 encoded token.
3. **React Frontend**:
   - Create a service pointing to `/frontend` path inside the GitHub repo.
   - Configure the environment variable:
     - `VITE_API_URL`: Your deployed backend service URL.
   - Railway will detect the `Dockerfile` inside the `frontend` folder and serve it via Nginx on port 80.
  tài khoản đăng nhập 
  user
  password123

  admin
  admin123