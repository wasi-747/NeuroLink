# 🧠 NeuroLink - Student Mental Wellness Platform

<div align="center">

**A comprehensive, full-stack mental wellness ecosystem designed for university students, featuring self-help trackers, anonymous peer forums, professional booking directories, educational masterclasses, and an intelligent machine learning service.**

[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-blue?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS v4](https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-yellow?style=for-the-badge&logo=python)](https://www.python.org/)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Frontend Pages](#-frontend-pages)
- [Authentication](#-authentication)
- [Configuration](#-configuration)
- [Data Seeding & Accounts](#-data-seeding--accounts)

---

## 🎯 Overview

**NeuroLink** (also known as **NeuroVerse**) is a dedicated mental wellness platform built to provide university students with a safe, gamified space to manage academic stress and seek support. The application merges three primary systems:

1. **Self-Help Trackers**: Gamified mood tracking, Tiptap-powered journals, custom habit builders, stress self-assessments (PSS scale), and daily gratitude logs.
2. **Anonymous Peer Forums**: A safe community space utilizing auto-generated aliases, supportive emoji reactions, and profanity filtering.
3. **Professional Counseling Booking**: A verified therapist directory connecting students directly to certified counselor sessions.

Additionally, the project integrates an advanced **FastAPI Machine Learning Service** utilizing Hugging Face models and Llama-3.3-70b-versatile via Groq to perform real-time sentiment analysis, run an empathetic AI counselor chatbot, compile weekly reports, and construct cosine-similarity knowledge graphs for personalized learning paths.

---

## ✨ Features

### 🎓 For Students

| Feature | Description |
|---------|-------------|
| **Interactive Dashboard** | Gamified central space showing daily habits, mood patterns, and quick logs |
| **Mood Tracker** | Emoji-based daily mood selector with responsive Recharts timeline charts |
| **Rich-Text Journal** | Private journaling page powered by Tiptap with real-time sentiment analysis |
| **Habit Tracker** | Weekly checklist interface to configure and track health routines |
| **Stress Quiz (PSS)** | Multi-step stress quiz giving progressive feedback and severity analysis |
| **Gratitude Feed** | Logging daily positive moments for mindfulness exercises |

### 🤝 Peer Community & Booking

| Feature | Description |
|---------|-------------|
| **Auto-Generated Aliases**| Standardized anonymous user aliases assigned upon first post to encourage open discussions |
| **Supportive Reactions** | Custom forum reaction interactions (💙, 🤗, 💪, 🌟, 🕊️) with nested commenting |
| **Therapist Booking** | Full-screen directory to filter professional counselors by location, specialty, and session fee |
| **Confetti Courses** | Video-learning course portal with celebratory confetti bursts upon module completion |

### 🤖 Machine Learning & AI Intelligence

| Feature | Description |
|---------|-------------|
| **Crisis Analysis** | Immediate regex pattern trigger for crisis keywords to suggest help lines |
| **Sentiment Fallback** | Analyzes journal text for Negative/Positive/Crisis sentiment via Llama 3.3 |
| **Aria AI Chatbot** | Empathetic chat companion implementing crisis guardrails and support limits |
| **Weekly Summarizer** | Reviews weekly logs, stress scores, and habits to write custom private feedback |
| **Vector Knowledge Graph**| Constructs NetworkX similarity graphs using SentenceTransformer embeddings |
| **Learning Path Planner** | Runs DFS traversal on nodes matching user interests to suggest personalized content roadmaps |

### 👨‍💼 For Administrators

| Feature | Description |
|---------|-------------|
| **Therapist Onboarding** | Approve or reject counselor registration profiles and license submissions |
| **Community Moderation** | Flag, hide, or review reported user posts violating rules |
| **Oversight Panel** | Comprehensive audit portal tracking active courses, sessions, and platform usage |

---

## 🛠️ Tech Stack

### Backend & ML Service

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Node.js Server** | Express | 5.x | REST API core, cookie sessions, and routing |
| **Database** | MongoDB | Latest | Data persistence for users, bookings, posts, and courses |
| **ORM** | Mongoose | Latest | Object data modeling for Node.js |
| **ML Web Server** | FastAPI | 0.111.0 | High-performance python endpoints |
| **ML Engine** | Groq Cloud | Latest | Handles Llama-3.3-70b-versatile inference calls |
| **NLP Vectors** | SentenceTransformers | Latest | Generates all-MiniLM-L6-v2 vector embeddings |
| **Graph Network** | NetworkX | Latest | Builds cosine-similarity relationship knowledge graphs |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18+ | Front-end components library |
| **Vite** | Latest | Next-gen dev server and bundling utility |
| **TailwindCSS** | v4.0 | Next-generation CSS framework using native custom properties |
| **Framer Motion** | Latest | Hardware-accelerated drawer animations and page transitions |
| **Recharts** | Latest | Declarative SVG charting components for mood metrics |
| **Tiptap** | Latest | Headless rich-text editor wrapper |

---

## 🏗️ Architecture

### High-Level System Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                        React Frontend (Vite)                      │  │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────┐  │  │
│  │  │ Pages      │  │ Components   │  │   Context   │  │Services  │  │  │
│  │  │ (Auth/KYC) │  │ (Tailwind v4)│  │  (Auth/Use) │  │(Axios)   │  │  │
│  │  └────────────┘  └──────────────┘  └─────────────┘  └──────────┘  │  │
│  └─────────────────────────────────┬─────────────────────────────────┘  │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
                                     │ HTTP REST Requests & Cookie Sessions
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        MAIN SERVER (Node.js/Express)                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                          Security Gateway                         │  │
│  │           Helmet Protections  │  XSS Sanitizer │ JWT Cookie Auth      │  │
│  └──────────────────────────────────┬────────────────────────────────┘  │
│                                     │                                   │
│  ┌──────────────────────────────────▼────────────────────────────────┐  │
│  │                         Express Routers                           │  │
│  │   Auth │ Mood │ Journal │ Habits │ Forum │ Courses │ Therapists     │  │
│  └──────────────────────────────────┬────────────────────────────────┘  │
└─────────────────────────────────────┼───────────────────────────────────┘
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
┌─────────────────────────────────────┐       ┌───────────────────────────┐
│         FASTAPI ML SERVICE          │       │       Database Layer      │
│  ┌───────────────────────────────┐  │       │    ┌───────────────────┐  │
│  │ Sentiment Analysis Router     │  │       │    │ MongoDB Database  │  │
│  │ Aria Chatbot Assistant        │  │       │    │ (Users/Posts/Logs)│  │
│  │ Weekly Report Compiler        │  │       │    └───────────────────┘  │
│  │ NetworkX Learning Path Graph  │  │       │                           │
│  └───────────────┬───────────────┘  │       │                           │
│                  │                  │       │                           │
│                  ▼                  │       │                           │
│            [Groq Cloud]             │       │                           │
│       (Llama 3.3/Llama 3 8B)        │       │                           │
└─────────────────────────────────────┘       └───────────────────────────┘
```

### Request Flow Lifecycle

```text
Student Interaction → React Hook Form → Axios Request → Express Endpoint → Cookie Check
                                                                               │
       ┌───────────────────────────────────────────────────────────────────────┘
       ▼
Express Controller ──► FastAPI ML Request ──► Groq Cloud Llama Inference
       │                                            │
       ▼                                            ▼
Save Results to MongoDB                       Response parsed to JSON
       │                                            │
       ▼                                            ▼
Success Cookie Verified ◄───────────────────── Send Response DTO
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.x or newer) and npm
- **Python** (v3.9 or newer) with `pip`
- **MongoDB** running locally or via a MongoDB Atlas URI

### Installation & Run Steps

#### 1. Setup the Backend Server
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Initialize the environment configuration:
   Create a `.env` file inside the `server/` directory (see [Configuration](#-configuration)).
4. Run database seed files (Highly recommended):
   ```bash
   npm run seed
   ```
5. Run the dev server:
   ```bash
   npm run dev
   ```
   The backend starts running on `http://localhost:5000`.

#### 2. Setup the FastAPI Machine Learning Service
1. Navigate to the machine learning directory:
   ```bash
   cd ../ml-service
   ```
2. Create and activate a python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install required libraries:
   ```bash
   pip install -r requirements.txt
   ```
4. Install NLP and Graph dependencies (optional but needed for learning path recommendations):
   ```bash
   pip install sentence-transformers networkx
   ```
5. Setup the `.env` file in the `ml-service/` folder with your `GROQ_API_KEY`.
6. Start the FastAPI server using Uvicorn:
   ```bash
   uvicorn main:app --port 8000 --reload
   ```
   The ML service starts running on `http://localhost:8000`.

#### 3. Setup the React Frontend
1. Navigate to the client folder:
   ```bash
   cd ../client
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Boot the Vite development server:
   ```bash
   npm run dev -- --port 3001
   ```
   Navigate to `http://localhost:3001` in your browser.

---

## 📁 Project Structure

```text
Neurolink/
├── client/                               # React Frontend
│   ├── public/                           # Static public assets
│   ├── src/                              # Client Source Files
│   │   ├── components/                   # Reusable UI controls
│   │   ├── context/                      # State providers (AuthContext)
│   │   ├── hooks/                        # Custom hooks (Breathing sound, etc.)
│   │   ├── pages/                        # Page components
│   │   │   ├── admin/                    # Admin moderation tools
│   │   │   ├── courses/                  # Video courses pages
│   │   │   ├── dashboard/                # Habit trackers & journal layouts
│   │   │   ├── forum/                    # Anonymous forum feed
│   │   │   ├── therapists/               # Booking session directories
│   │   │   ├── Home.jsx                  # Welcoming Landing Page
│   │   │   ├── Login.jsx                 # User Credentials form
│   │   │   └── Register.jsx              # Account creation page
│   │   ├── App.jsx                       # Routing configs
│   │   └── main.jsx                      # App startup mount
│   └── package.json
│
├── server/                               # Node.js Express Backend
│   ├── config/                           # Database configurations
│   ├── controllers/                      # Business controller layers
│   ├── middleware/                       # Security & Session middlewares
│   ├── models/                           # Mongoose data modeling
│   │   ├── Article.js                    # Course auxiliary reading articles
│   │   ├── Booking.js                    # Counselor sessions booking schema
│   │   ├── Comment.js                    # Nested comment tree schema
│   │   ├── Course.js                     # Educational course modules
│   │   ├── ForumPost.js                  # Emoji-reactive forum schema
│   │   ├── JournalEntry.js               # Sentiment-tagged private diary
│   │   ├── MoodEntry.js                  # emoji logs
│   │   ├── Therapist.js                  # Counsellors clinical directory
│   │   ├── User.js                       # Profile and system credentials
│   │   └── WellnessReport.js             # Generated weekly AI reports
│   ├── routes/                           # API route definitions
│   ├── utils/                            # Server side helper logs
│   ├── scripts/                          # Seeding scripts directory
│   ├── server.js                         # Application entry point
│   └── package.json
│
├── ml-service/                           # Python FastAPI ML Services
│   ├── routers/                          # ML endpoint routers
│   │   ├── chat.py                       # Counselor Chatbot Aria
│   │   ├── learning.py                   # Graph-traversal recommendations
│   │   ├── report.py                     # Weekly summaries generator
│   │   └── sentiment.py                  # Llama-3.3 sentiment validator
│   ├── main.py                           # FastAPI application mounting file
│   ├── requirements.txt                  # Python dependencies
│   └── .env.example
```

---

## 📊 Database Schema

### Entity Relationship Diagram (ERD)

```text
       ┌──────────────┐                  ┌──────────────┐
       │     USER     │ 1              N │ JOURNAL_ENTRY│
       ├──────────────┤──────────────────┤──────────────┤
       │ _id (PK)     │                  │ _id (PK)     │
       │ name         │                  │ user (FK)    │
       │ email        │                  │ sentiment    │
       │ role         │                  │ content      │
       └──────┬───────┘                  └──────────────┘
              │ 1
              ├──────────────────────────┐
              │ 1                        │ 1
              │                          │
              │ N                        │ N
       ┌──────▼───────┐                  ┌──────▼───────┐
       │  FORUM_POST  │ N              1 │   BOOKING    │
       ├──────────────┤──────────────────┤──────────────┤
       │ _id (PK)     │                  │ _id (PK)     │
       │ authorId (FK)│                  │ userId (FK)  │
       │ category     │                  │ therapist(FK)│
       │ commentCount │                  │ sessionDate  │
       └──────────────┘                  └──────────────┘
```

### Mongoose Models Source Structures

#### User Schema
```javascript
const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please add a name'] },
  email: { type: String, required: [true, 'Please add an email'], unique: true },
  password: { type: String, required: [true, 'Please add a password'], minlength: 6, select: false },
  role: { type: String, enum: ['student', 'therapist', 'admin', 'user'], default: 'user' },
  anonymousAlias: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now }
});
```

#### Journal Entry Schema
```javascript
const JournalEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  title: { type: String, required: [true, "Please add a title"] },
  content: { type: String, required: [true, "Please add content"] },
  sentimentLabel: { type: String, enum: ["POSITIVE", "NEUTRAL", "NEGATIVE", "CRISIS", "UNKNOWN"], default: "UNKNOWN" },
  sentimentScore: { type: Number },
  emotions: { type: Object }
}, { timestamps: true });
```

#### Forum Post Schema
```javascript
const ForumPostSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  anonymousAlias: { type: String, required: true },
  title: { type: String, required: [true, "Please add a title"], maxlength: 100 },
  content: { type: String, required: [true, "Please add content"], maxlength: 1000 },
  category: { type: String, required: true, enum: ["Academic Pressure", "Exam Stress", "Anxiety", "Depression", "Relationship Stress", "Family Issues", "Loneliness", "Sleep Problems", "Self-Esteem", "General Support"] },
  sentimentLabel: { type: String, enum: ["POSITIVE", "NEUTRAL", "NEGATIVE", "CRISIS", "UNKNOWN"], default: "UNKNOWN" },
  sentimentScore: { type: Number },
  reactions: [{
    type: { type: String, enum: ["💙", "🤗", "💪", "🌟", "🕊️"], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  }],
  commentCount: { type: Number, default: 0 },
  isHidden: { type: Boolean, default: false }
}, { timestamps: true });
```

---

## 📡 API Reference

### Base URL
```text
http://localhost:5000/api/v1
```

### Authentication Header
```text
Cookie: token=<jwt_token_string>
```

---

### 🔐 Authentication API

#### Register Account
```http
POST /auth/register
Content-Type: application/json

{
  "name": "Alex Mercer",
  "email": "alex@university.edu",
  "password": "securePassword123"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "64dbf55a1...",
    "name": "Alex Mercer",
    "email": "alex@university.edu",
    "role": "user"
  }
}
```

---

### 🧠 FastAPI ML API

| Method | Endpoint | Description | Port |
|--------|----------|-------------|------|
| `POST` | `/api/ml/analyze/sentiment` | Analyzes text sentiment and emotion configurations | `8000` |
| `POST` | `/api/ml/chat` | Receives history to request chatbot Aria response | `8000` |
| `POST` | `/api/ml/analyze/weekly-report` | Summarizes user stats into private report markdown | `8000` |
| `POST` | `/api/ml/build-graph` | Accepts articles/courses and builds vector nodes | `8000` |
| `POST` | `/api/ml/recommend-path` | Traverses similarity path nodes matching interests | `8000` |

#### Analyze Journal Sentiment & Emotions
```http
POST http://localhost:8000/api/ml/analyze/sentiment
Content-Type: application/json

{
  "text": "I feel so overwhelmed by my final exam prep. I can't sleep.",
  "source": "journal"
}
```
**Response (200 OK):**
```json
{
  "sentiment": "NEGATIVE",
  "confidence": 0.89,
  "crisis_detected": false,
  "emotions": {
    "sadness": 0.45,
    "fear": 0.35,
    "joy": 0.05
  }
}
```

#### Get AI Counselor Aria Response
```http
POST http://localhost:8000/api/ml/chat
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "Hi, I am having a tough week."}
  ],
  "user_context": {
    "firstName": "Alex"
  }
}
```
**Response (200 OK):**
```json
{
  "reply": "Hello Alex. I'm sorry to hear you're having a tough week. I am Aria, your AI wellness companion. While I'm here to support you, please remember I am an AI and not a licensed therapist. What has been making things difficult for you lately?"
}
```

---

## 📱 Frontend Pages

### Public Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Home.jsx` | Platform landing presentation with features description cards |
| `/login` | `Login.jsx` | User authentication gateway page |
| `/register` | `Register.jsx` | User account creation page |

### Protected Routes (Student Account Required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | `Dashboard.jsx` | Mood logging widget, gratitude streak tracker, and analytics charts |
| `/journal` | `Journal.jsx` | Rich-text journaling interface displaying real-time emotional analysis |
| `/forum` | `Forum.jsx` | Anonymous community message board sorted by topics |
| `/therapists`| `TherapistList.jsx`| Counselor directory offering online session booking |
| `/courses` | `CourseCatalog.jsx`| Catalog of video course modules covering wellness |
| `/aria-chat` | `AriaChat.jsx` | Empathetic AI counseling chatbot panel interface |

---

## 🔐 Authentication

### Cookie-based Authentication flow

```text
Client App (Credentials)                       Express API Server                Database
    │                                                  │                            │
    │ ───► POST /auth/login ─────────────────────────► │                            │
    │                                                  │ ───► Fetch User Record ──► │
    │                                                  │ ◄─── User Data Hashed ──── │
    │                                                  │                            │
    │                                              Hasing Matches                   │
    │                                             Set Cookie JWT                    │
    │ ◄─── Send Success JSON (With HTTPOnly Cookie) ───│                            │
    │                                                  │                            │
    │ ───► GET /api/v1/journal (Includes Cookie) ────► │                            │
    │                                              Extract JWT                      │
    │                                             Decodes UserID                    │
    │                                                  │ ───► Fetch Journal Logs ─► │
    │ ◄─── Return Journal Logs ─────────────────────── │ ◄─── Data Arrays ───────── │
```

- **Authentication Storage**: Stored inside secure `HTTPOnly` cookies (`token`) to protect against XSS token extraction.
- **Session Duration**: Default token signature is valid for 30 days.

---

## ⚙️ Configuration

### Main Server Configuration (`server/.env`)
```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://127.0.0.1:27017/neuroverse

JWT_SECRET=your_super_secret_jwt_signature_key_here
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

CLIENT_URL=http://localhost:3001
ML_SERVICE_URL=http://localhost:8000
```

### ML Service Configuration (`ml-service/.env`)
```env
GROQ_API_KEY=gsk_your_groq_cloud_inference_api_key_here
```

### Client Environment Setup (`client/.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

## 🗂️ Data Seeding & Accounts

The database can be automatically seeded with mock counselors, posts, and courses by running the script inside `server/`:
```bash
npm run seed
```

### Generated Sandbox Test Credentials
You can use the following seeded account profiles to test active platform systems:

| Role | Username / Email | Password |
|---|---|---|
| **System Administrator** | `admin@neuroverse.com` | `password123` |
| **Verified Therapist** | `sarah@neuroverse.com` | `password123` |
| **Student Account** | `student1@test.edu` | `password123` |
| **Alternative Student** | `student2@test.edu` | `password123` |
