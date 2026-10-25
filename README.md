# ELEVATECV — AI-Powered Resume Builder & Career Suite

![Tech Stack](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg)
![Spring AI](https://img.shields.io/badge/Spring%20AI-Google%20GenAI-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**ELEVATECV** is a full-stack, production-quality web application that empowers job seekers to create compelling, ATS-optimized resumes in minutes using Google Gemini AI.

---

## 🌟 Key Features

### 1. Multi-Step Resume Builder & Real-Time Live Preview
- **7-step structured form**: Personal Info, Summary, Education, Skills (Technical & Soft tags), Projects, Experience, Certifications & Languages.
- **Real-time Live Preview**: Side-by-side editing on desktop, toggle view on mobile.
- **3 ATS-Friendly Templates**:
  - **Classic**: Traditional, clean, and recognized by enterprise ATS systems.
  - **Modern**: Sleek sidebar layout with visual skill indicators and color accents.
  - **Minimal**: Contemporary typography-driven, minimalist layout.
- **Customizable Styling**: Choose from 7 curated accent colors and multiple font families.
- **Auto-Save**: Automatic debounced background saving with status indicators.
- **PDF Export**: Instant client-side PDF generation formatted for standard A4 printing.

### 2. Gemini-Powered AI Capabilities
- **AI Summary Writer**: Crafts high-impact, 3–5 sentence executive summaries tailored to your target role.
- **AI Bullet Point Improver**: Rewrites rough notes and responsibilities into quantified, action-driven bullet points using the STAR method.
- **Full AI Resume Generator**: Generates a complete resume blueprint based on a job role and description.
- **ATS Resume Matcher & Score**: Analyzes your resume against any target job description, scoring overall match (0–100), identifying matching/missing keywords, and providing actionable improvement advice.
- **AI Cover Letter Writer**: Generates tailored, persuasive cover letters based on your selected resume and job posting with one-click copy and download.

### 3. Public Portfolios & Sharing
- Toggle any resume to **Public** with one click.
- Share your public portfolio at `/portfolio/:username` with live preview and PDF download for recruiters.

### 4. Security & Architecture
- **JWT Authentication**: Secure stateless token authentication with BCrypt password hashing.
- **Rate Limiting**: Built-in per-user hourly AI request limits to protect against quota exhaustion and abuse.
- **PostgreSQL JSONB Storage**: Flexible structured document storage for complex resume hierarchies.
- **Swagger UI**: Interactive OpenAPI documentation available at `/swagger-ui.html`.

---

## 🛠️ Tech Stack

### Backend
- **Java 21 & Spring Boot 3.3.5**
- **Spring AI (Google GenAI Starter)**: Powered by Gemini models (default: `gemini-2.5-flash`)
- **Spring Security & JJWT**: Stateless authentication, CORS configuration, custom user details
- **Spring Data JPA & Hibernate**: PostgreSQL persistence with JSONB support
- **Springdoc OpenAPI (Swagger UI)**: API documentation
- **Lombok**: Boilerplate reduction

### Frontend
- **React 19 & Vite**
- **Tailwind CSS v4**: Rich dark mode, glassmorphism, gradient accents, micro-animations
- **React Router v7**: Client-side routing with protected route guards
- **Axios**: HTTP client with request & response interceptors (auto-attach token & handle 401)
- **React Hook Form**: Form validation and state management
- **React Hot Toast**: Notifications and status feedback
- **html2pdf.js**: Client-side PDF rendering

---

## 🚀 Quick Start Guide

### Prerequisites
- **Java 21** installed (`java -version`)
- **Maven 3.9+** installed (`mvn -version`)
- **Node.js 18+** & **npm** installed (`node -v`)
- **PostgreSQL 16** (or Docker to run PostgreSQL)
- **Google Gemini API Key** ([Get free key from Google AI Studio](https://aistudio.google.com/))

---

### Step 1: Database Setup

You can start PostgreSQL using the provided `docker-compose.yml`:

```bash
docker compose up -d
```

Or ensure a local PostgreSQL instance is running with:
- **Host**: `localhost:5432`
- **Database**: `resumeai`
- **User**: `resumeai`
- **Password**: `resumeai123`

---

### Step 2: Backend Configuration & Launch

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Configure environment variables. You can set them in your terminal or create an `.env` / update `application.yml`:
   ```bash
   # Linux/macOS
   export GEMINI_API_KEY="your_actual_gemini_api_key_here"
   export DB_HOST="localhost"
   export DB_PORT="5432"
   export DB_NAME="resumeai"
   export DB_USER="resumeai"
   export DB_PASSWORD="resumeai123"

   # Windows (PowerShell)
   $env:GEMINI_API_KEY="your_actual_gemini_api_key_here"
   $env:DB_HOST="localhost"
   $env:DB_PORT="5432"
   $env:DB_NAME="resumeai"
   $env:DB_USER="resumeai"
   $env:DB_PASSWORD="resumeai123"
   ```

3. Compile and run the backend:
   ```bash
   mvn spring-boot:run
   ```

Backend will start on: **`http://localhost:8081`**  
Swagger UI is accessible at: **`http://localhost:8081/swagger-ui.html`**

---

### Step 3: Frontend Launch

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

Frontend will start on: **`http://localhost:5173`**  
The Vite dev server is preconfigured to proxy `/api` requests directly to `http://localhost:8081`.

---

## 📡 API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Public? |
|--------|----------|-------------|---------|
| `POST` | `/api/auth/signup` | Register a new user | Yes |
| `POST` | `/api/auth/login` | Log in and obtain JWT | Yes |
| `GET`  | `/api/auth/me` | Fetch current user info | No |

### Resumes (`/api/resumes`)
| Method | Endpoint | Description | Public? |
|--------|----------|-------------|---------|
| `GET`  | `/api/resumes` | List all resumes for logged-in user | No |
| `POST` | `/api/resumes` | Create a new resume | No |
| `GET`  | `/api/resumes/{id}` | Get complete resume by ID | No |
| `PUT`  | `/api/resumes/{id}` | Update resume details and content | No |
| `DELETE` | `/api/resumes/{id}` | Delete resume | No |
| `POST` | `/api/resumes/{id}/duplicate` | Duplicate an existing resume | No |
| `PATCH`| `/api/resumes/{id}/visibility` | Toggle public/private visibility | No |

### AI Features (`/api/ai`)
| Method | Endpoint | Description | Public? |
|--------|----------|-------------|---------|
| `POST` | `/api/ai/summary` | Generate a targeted professional summary | No |
| `POST` | `/api/ai/improve` | Rewrite rough bullet points using action verbs | No |
| `POST` | `/api/ai/generate-resume` | Generate full resume schema from target role | No |
| `POST` | `/api/ai/ats-score` | Compute ATS compatibility score & keyword audit | No |
| `POST` | `/api/ai/cover-letter` | Generate tailored cover letter | No |

### Portfolio (`/api/portfolio`)
| Method | Endpoint | Description | Public? |
|--------|----------|-------------|---------|
| `GET`  | `/api/portfolio/{username}` | Fetch all public resumes for a user | Yes |

---

## 📂 Project Structure

```
airesumebuilder/
├── backend/
│   ├── pom.xml
│   ├── .env.example
│   └── src/main/
│       ├── java/com/resumeai/
│       │   ├── ResumeAiApplication.java
│       │   ├── config/             # SecurityConfig, OpenApiConfig, AiConfig
│       │   ├── controller/         # Auth, Resume, Ai, Portfolio controllers
│       │   ├── dto/                # Request & Response DTOs
│       │   ├── entity/             # User, Resume, AiUsageLog entities
│       │   ├── exception/          # GlobalExceptionHandler, Custom exceptions
│       │   ├── repository/         # Spring Data JPA repositories
│       │   ├── security/           # JWT provider, filter, UserDetails
│       │   └── service/            # AuthService, ResumeService, AiService
│       └── resources/
│           └── application.yml
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── ResumePreview.jsx
│       │   ├── editor/             # Multi-step section components
│       │   └── templates/          # Classic, Modern, Minimal templates
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── SignupPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── EditorPage.jsx
│       │   ├── AtsCheckerPage.jsx
│       │   ├── CoverLetterPage.jsx
│       │   └── PortfolioPage.jsx
│       └── services/
│           ├── api.js              # Axios instance & interceptors
│           └── services.js         # API client functions
└── docker-compose.yml              # PostgreSQL container definition
```

---

## 🔒 Security Best Practices
- Passwords hashed using **BCrypt** (strength factor 10).
- Stateless **JWT authentication** with configurable expiration.
- CORS restricted to configured frontend origins.
- SQL injection prevention via Spring Data JPA prepared statements.
- Per-user rate limiting on Gemini AI endpoints (default: 20 calls/hour).

---

## 📄 License
This project is licensed under the MIT License.
