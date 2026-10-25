# 🚀 ELEVATECV — Production Cloud Deployment Guide

This guide walks you through deploying **ELEVATECV** with:
- **Backend & PostgreSQL**: Hosted on [Render](https://render.com) (or [Railway](https://railway.app))
- **Frontend**: Hosted on [Vercel](https://vercel.com) (or Render / Netlify)

---

## 📋 Overview Architecture

```
┌─────────────────────────────────┐       ┌──────────────────────────────────────┐
│       Vercel (Frontend)         │  ───> │        Render (Backend API)          │
│   React 19 SPA (Vite + Tailwind)│       │   Spring Boot 3 (Java 21) on Port 8081│
└─────────────────────────────────┘       └──────────────────┬───────────────────┘
                                                             │
                                                             ▼
                                                  ┌─────────────────────┐
                                                  │  Render PostgreSQL  │
                                                  │  Managed Database   │
                                                  └─────────────────────┘
```

---

## Step 1: Push Project to GitHub

1. Open your terminal in `d:/airesumebuilder` and run:

```bash
git add .
git commit -m "feat: complete production-ready ELEVATECV suite"
```

2. Create a new empty repository on [GitHub](https://github.com/new) (e.g. `elevatecv`).

3. Link and push your repository:
```bash
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/elevatecv.git
git push -u origin main
```

---

## Step 2: Deploy Backend & PostgreSQL on Render

### Option A: 1-Click Blueprint (Recommended)
Because we included `render.yaml`, Render can set up both the database and the backend service automatically:

1. Sign up or log into [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Blueprint**.
3. Connect your `elevatecv` GitHub repository.
4. Render will read `render.yaml` and provision:
   - **elevatecv-postgres** (Managed PostgreSQL database)
   - **elevatecv-backend** (Docker Web Service)
5. Fill in the prompted secret:
   - `GEMINI_API_KEY`: `<YOUR_GOOGLE_GEMINI_API_KEY>` (from Google AI Studio)
6. Click **Apply**.
7. Once deployed, copy your backend URL (e.g. `https://elevatecv-backend.onrender.com`).

---

### Option B: Manual Web Service Setup on Render

If creating manually:
1. **Create PostgreSQL Database**:
   - Click **New +** → **PostgreSQL**.
   - Name: `elevatecv-postgres`. Database: `elevatecv`. User: `elevatecv`.
   - Click **Create Database**.
   - Copy the **Internal Database URL** or connection details.

2. **Create Web Service for Backend**:
   - Click **New +** → **Web Service**.
   - Connect your GitHub repo.
   - **Root Directory**: `backend`
   - **Runtime**: `Docker`
   - **Instance Type**: `Free`
   - **Environment Variables**:
     | Variable | Value |
     | :--- | :--- |
     | `DB_HOST` | *(from your Render Postgres host)* |
     | `DB_PORT` | `5432` |
     | `DB_NAME` | `elevatecv` |
     | `DB_USER` | `elevatecv` |
     | `DB_PASSWORD` | *(from your Render Postgres password)* |
     | `GEMINI_API_KEY` | `<YOUR_GOOGLE_GEMINI_API_KEY>` |
     | `JWT_SECRET` | *(64+ character random string)* |
     | `PORT` | `8081` |
     | `CORS_ALLOWED_ORIGINS` | `https://*.vercel.app,http://localhost:5173` |

---

## Step 3: Deploy Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com) and click **Add New...** → **Project**.
2. Import your `elevatecv` GitHub repository.
3. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables**:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://elevatecv-backend.onrender.com/api` | Your Render backend URL + `/api` |
5. Click **Deploy**!
6. In ~60 seconds, your frontend will be live at `https://<project-name>.vercel.app`!

---

## Step 4: Verify Deployment

1. Visit your Vercel URL: `https://<your-app>.vercel.app`.
2. Register a new user on the **Sign Up** screen.
3. Create and edit a resume, then click **Save**.
4. Test the **Cover Letter Generator** and **ATS Score Checker** powered by Google Gemini AI.
5. Export your resume to PDF using the **PDF** button.

---

## 🛠 Local Docker Compose (Alternative Self-Hosted)

To run the whole stack in containers on any server or VPS:

```bash
# 1. Start PostgreSQL
docker compose up -d postgres

# 2. Build and run backend container
cd backend
docker build -t elevatecv-backend .
docker run -p 8081:8081 --env-file .env elevatecv-backend

# 3. Build and run frontend container
cd ../frontend
docker build -t elevatecv-frontend .
docker run -p 80:80 elevatecv-frontend
```
