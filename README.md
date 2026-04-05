# 🏥 HealthTrack Dashboard

A full-stack MERN health tracking application with AI-powered insights via **Baymax** (OpenRouter + Mistral 7B).

---

demo@healthtrack.app
Demo1234

## ✨ Features

- **Health Score** — Daily 0–100 score with grade (A+ to F), broken down by Sleep, Activity, Hydration, Vitals & Consistency
- **6 Goal Metrics** — Sleep, Steps, Water, Exercise, Screen Time, Heart Rate with streak tracking
- **Baymax AI** — Warm, concise health companion powered by Mistral 7B via OpenRouter
- **Weekly Heatmap** — GitHub-style activity grid colored by health score
- **Area Trend Charts** — Gradient-filled charts for Sleep, Steps, Heart Rate, Water
- **3D Card Hover Effects** — Micro-interactions and smooth Framer Motion animations
- **Dark / Light Mode** — System preference + manual toggle
- **30-day Seed Data** — Realistic demo data with progressive improvement trends

---

## 🛠 Tech Stack

| Layer    | Technology                                            |
| -------- | ----------------------------------------------------- |
| Frontend | React 18 + Vite, TailwindCSS, Framer Motion, Recharts |
| Backend  | Node.js, Express, MongoDB + Mongoose                  |
| Auth     | JWT (7-day expiry)                                    |
| AI       | OpenRouter API → Mistral 7B (Baymax)                  |
| Fonts    | Sora (display), Inter (body), JetBrains Mono          |

---

## 🚀 Setup Instructions

### 1. MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and a new cluster
3. Create a database user (username + password)
4. Network Access → Add IP Address → `0.0.0.0/0` (allow all for dev)
5. Connect → Drivers → Copy the connection string
6. Replace `<password>` with your database user password

### 2. OpenRouter API Key

1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up (free tier available)
3. Go to **Keys** section → **Create Key**
4. Copy the key (starts with `sk-or-v1-...`)

### 3. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://youruser:yourpass@cluster0.xxxxx.mongodb.net/healthtrack?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_key_at_least_32_chars
OPENROUTER_API_KEY=sk-or-v1-your_key_here
```

Run seed data (creates demo account + 30 days of data):

```bash
node seed.js
```

Start backend:

```bash
npm run dev
```

Backend runs on: `http://localhost:5000`

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🔑 Demo Credentials

After running `node seed.js`:

| Field    | Value                         |
| -------- | ----------------------------- |
| Email    | `demo@healthtrack.app`        |
| Password | `Demo1234`                    |
| Profile  | Alex Rivera, 28y, 172cm, 74kg |

The demo account includes:

- 30 days of realistic health records
- Progressive improvement trend over time
- Stress period simulation (mid-month)
- 6 active goals with streaks
- Pre-calculated health scores

---

## 📡 API Documentation

### Auth

```
POST /api/auth/register   { email, password }
POST /api/auth/login      { email, password }
```

### Profile

```
GET  /api/profile
POST /api/profile         { name, age, gender, height, weight }
PUT  /api/profile         { name, age, gender, height, weight }
```

### Records

```
GET  /api/records/today
GET  /api/records/summary?days=7    (7, 30, or 90)
GET  /api/records?page=1
POST /api/records         { heartRate, sleepHours, stepCount, waterIntake,
                            screenTime, exerciseDuration, bloodPressure,
                            sugarLevel, moodIndicator, notes }
```

### Goals

```
GET    /api/goals
POST   /api/goals         { metric, target }
PUT    /api/goals/:id     { target, isActive }
DELETE /api/goals/:id
POST   /api/goals/check-today
```

### Wellness

```
GET  /api/wellness/dashboard
GET  /api/wellness/score?days=30
POST /api/wellness/calculate-today
```

### Insights

```
GET /api/insights
```

### Baymax AI

```
GET  /api/ai/status
POST /api/ai/chat   { message, history: [{role, content}] }
```

---

## 🎨 Design System

**Colors:**

- Primary: `#4A6DB5` (blue)
- Sleep: `#7B68EE` (purple)
- Heart: `#E74C3C` (red)
- Activity: `#3A9B6E` (green)
- Hydration: `#4A9BD5` (blue)
- Screen: `#C0622A` (orange)

**Shadows:** `shadow-card` → `shadow-lifted` → `shadow-float`

---

## 📁 Project Structure

```
healthtrack/
├── backend/
│   ├── models/          User, UserProfile, DailyHealthRecord, Goal, HealthScore
│   ├── controllers/     auth, profile, records, insights, ai, goals, wellness
│   ├── routes/          REST API routes
│   ├── services/        aiService (Baymax), healthScoreCalculator
│   ├── middleware/       JWT auth
│   ├── seed.js          Demo data generator
│   └── server.js        Express app entry
│
└── frontend/
    └── src/
        ├── components/
        │   ├── layout/   Sidebar, AISidebar (Baymax)
        │   ├── dashboard/ DashboardHeader, MetricCard, TrendChart, InsightCard
        │   ├── wellness/  HealthScoreGauge, StreakCard, WeeklyHeatmap
        │   └── modals/   AddRecordModal
        ├── context/      AuthContext, ThemeContext
        ├── pages/        Auth, Dashboard, Wellness, Goals, Records,
        │                 Insights, Reports, Profile
        └── services/     Axios API layer
```

---

## 🤖 Baymax AI Notes

Baymax is accessible from the **top-right corner** of the Dashboard header.

- Uses `mistralai/mistral-7b-instruct` via OpenRouter
- Scales response length by question complexity (100–250 tokens)
- Has access to your last 7-day averages and 30-day trends
- Supports multi-turn conversation with history
- Requires `OPENROUTER_API_KEY` in backend `.env`

Without the API key, Baymax shows "Not configured" — all other features work normally.

---

## 📄 License

MIT
