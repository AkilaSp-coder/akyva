# AKYVA — CONNECT BEYOND LANGUAGE

> **AKYVA** is a global, AI-powered communication platform designed from the ground up for cross-border collaboration, privacy-first identity, multilingual fluency, and proactive safety.

---

## 🕊️ Architectural Overview

AKYVA pairs an enterprise **Spring Boot 3.x / Java 17** backend with a reactive **React 19 / TypeScript / Vite** frontend:

```
[ AKYVA Web / Mobile Client ]
              │
              ├─── STOMP / WebSocket (Real-time Messaging, Receipts, Typing) ───► /ws
              └─── REST APIs (Auth, Chat, Contacts, AI Services) ───────────────► /api/*
                                                                                    │
                                                                                    ▼
                                                      [ Spring Boot 3 & Security (JWT) ]
                                                                                    │
                                                    ┌───────────────────────────────┴───────────────────────────────┐
                                                    ▼                                                               ▼
                                        [ PostgreSQL (Flyway) ]                                           [ Pluggable AI Service ]
                                        - users / contacts                                                - Gemini 2.5 Flash
                                        - conversations & members                                         - Safe Fallback Engine
                                        - messages & reactions                                            - Multilingual (10+ langs)
                                        - audit & safety reports                                          - Scam Shield & Summaries
```

---

## 1. Requirements

- **Java Development Kit (JDK)**: OpenJDK 17 or higher
- **Build Tool**: Maven 3.8+ (or Maven wrapper `./mvnw`)
- **Node.js**: v20+ / v22+
- **Database**: PostgreSQL 15+ (or Docker PostgreSQL 16)
- **Container Engine**: Docker & Docker Compose (optional for local full-stack run)

---

## 2. Java 17 Installation

### macOS (Homebrew)
```bash
brew install openjdk@17
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
```

### Ubuntu / Debian Linux
```bash
sudo apt update
sudo apt install -y openjdk-17-jdk
java -version
```

### Windows (Chocolatey or Scoop)
```powershell
choco install openjdk17
# or
scoop install openjdk17
```

---

## 3. PostgreSQL Setup & Database Creation

1. Start PostgreSQL server:
```bash
# macOS
brew services start postgresql@16

# Linux
sudo systemctl start postgresql
```

2. Create database and user:
```sql
CREATE USER postgres WITH PASSWORD 'password';
CREATE DATABASE akyva_db OWNER postgres;
GRANT ALL PRIVILEGES ON DATABASE akyva_db TO postgres;
```

3. Flyway executes all schema migrations automatically on application boot from `backend/src/main/resources/db/migration/V1__init_schema.sql`.

---

## 4. Environment Variables

Copy `.env.example` to `.env`:

```env
# Database Configuration
DATABASE_URL=jdbc:postgresql://localhost:5432/akyva_db
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password

# JWT Security
JWT_SECRET=akyva_super_secret_jwt_key_2026_at_least_256_bits_length_for_hmac_sha

# AI Configuration
AI_PROVIDER=gemini
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
GEMINI_MODEL=gemini-2.5-flash

# Frontend Server
PORT=3000
VITE_API_URL=http://localhost:8080
```

---

## 5. Backend Startup (Spring Boot)

Run locally using Maven:
```bash
cd backend
mvn clean spring-boot:run
```

Or build executable JAR:
```bash
mvn clean package -DskipTests
java -jar target/akyva-backend-1.0.0-SNAPSHOT.jar
```

The Spring Boot backend will start on **`http://localhost:8080`**.

---

## 6. Frontend Startup (Vite / React)

From the project root:
```bash
npm install
npm run dev
```

The interactive AKYVA client starts at **`http://localhost:3000`**.

---

## 7. Running with Docker Compose

Run the entire cluster (PostgreSQL + Spring Boot Backend + Frontend) in one command:
```bash
docker compose up --build -d
```

Check logs:
```bash
docker compose logs -f backend
```

---

## 8. Gemini AI Configuration

AKYVA decouples AI logic using `AiService`:
- If `GEMINI_API_KEY` is present in your environment, the system utilizes Google Gemini (`gemini-2.5-flash`) for real-time multilingual translation across 10+ languages (English, Tamil, Hindi, Telugu, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, etc.), message tone rewrites, conversation summaries, and phishing detection.
- If no key is set or the provider experiences rate limiting, AKYVA automatically falls back to `MockAiService` without throwing exceptions or degrading the messaging workflow.

---

## 9. WebSocket STOMP Configuration

AKYVA features real-time bidirectional communication over WebSocket:
- **Endpoint**: `/ws` (with native WebSocket & SockJS fallback)
- **Topics**:
  - `/topic/conversation/{conversationId}`: Incoming messages
  - `/topic/conversation/{conversationId}/read`: Read receipts
  - `/topic/conversation/{conversationId}/typing`: Live typing states
  - `/topic/conversation/{conversationId}/reaction`: Live emoji reactions
  - `/topic/presence`: Real-time user online/offline status
  - `/user/{userId}/queue/notifications`: Private direct alerts

---

## 10. Swagger / OpenAPI Documentation

When the backend is active, explore interactive API documentation at:
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI Schema (JSON)**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## 11. Backend Tests

Run unit and integration tests with:
```bash
cd backend
mvn test
```

Included test suites:
- `AuthServiceTest`: User registration, BCrypt password hashing, and duplicate detection.
- `AiServiceTest`: Smart reply generation, language translation, message tone rewriting, scam detection, and chat summaries.

---

## 12. Privacy & Security Foundation

- **No Public Phone Numbers**: Users connect via unique AKYVA IDs (`AKY-XXXX-XXXX`) and customizable handles.
- **BCrypt & JWT**: Passwords are salted and hashed; tokens expire automatically.
- **Post-Quantum / E2EE Architecture**: State models and message payloads are structured to plug in double-ratchet asymmetric client-side end-to-end encryption.
- **AI Safety Shield**: Incoming suspicious links or financial extortion prompts are flagged with non-destructive warning banners.
