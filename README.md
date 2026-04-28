# NeuroLink: Student Mental Wellness Platform

![NeuroLink Banner](https://images.unsplash.com/photo-1493836512294-502baa1986e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

NeuroLink is a comprehensive, full-stack web application designed to support the mental wellness of university students. This platform provides an all-in-one ecosystem for students to track their mental health, find professional support, engage anonymously with a supportive community, and access educational resources.

Built as a Final Year Project, it showcases a robust **MERN Stack** (MongoDB, Express, React, Node.js) implementation, enhanced with modern tooling like Vite, Tailwind CSS v4, and React Router v6.

---

## 🌟 Key Features

The application is structured into interconnected modules tailored for student needs:

### 1. Dashboard & Self-Help Trackers
A gamified, interactive space for students to monitor their daily mental health:
- **Mood Tracker**: Log daily emotions using an intuitive emoji interface, visualized via responsive Recharts timelines.
- **Journal**: A rich-text private journal (powered by Tiptap) for expressive writing and reflection.
- **Habit Tracker**: Build and maintain positive routines with a visual, weekly checkbox interface.
- **Stress Quiz**: A progressive, multi-step self-assessment tool (based on the PSS scale) with dynamic visual results.
- **Gratitude Log**: A daily feed to note 3 positive moments, promoting mindfulness.

### 2. Anonymous Community Forum
A safe, stigma-free environment for students to seek peer support:
- **Auto-Generated Aliases**: Users are assigned unique, anonymous aliases (e.g., `brave-dolphin`) upon their first post.
- **Rich Interactions**: Nested commenting system and a standardized set of supportive emoji reactions (💙, 🤗, 💪, 🌟, 🕊️).
- **Automated Moderation**: Server-side profanity filtering using the `bad-words` library ensures a safe space.

### 3. Professional Support Directory
Bridging the gap between students and certified mental health professionals:
- **Therapist Directory**: Filterable directory of verified counselors, psychologists, and psychiatrists.
- **Full-Screen Booking**: Integrated booking modals (mobile-optimized) to request sessions and view fees.
- **Admin Management**: Dedicated views for Admins to onboard, verify, and manage therapist profiles.

### 4. Educational Masterclasses
A marketplace for mental wellness education:
- **Course Catalog**: Browse expert-led courses on topics like "Overcoming Academic Anxiety" and "Better Sleep Habits."
- **Learning Interface**: A dedicated video-learning portal with progress tracking, complete with a celebratory confetti burst upon module completion.
- **Resource Library**: Quick-access articles and mindfulness exercises.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** & **Vite**: Lightning-fast build tooling and modern component rendering.
- **Tailwind CSS v4**: Utility-first styling with custom CSS variables for a vibrant, glassmorphic aesthetic.
- **React Router v6**: Client-side routing with protected authenticated routes.
- **React Hook Form & Zod**: Robust client-side validation for seamless data entry.
- **Recharts**: Interactive SVG charts for mood and habit analytics.
- **Framer Motion**: Fluid animations, page transitions, and responsive drawer menus.
- **Tiptap**: Headless wrapper for ProseMirror, delivering a rich-text journaling experience.

### Backend
- **Node.js & Express 5.x**: RESTful API architecture.
- **MongoDB & Mongoose ODM**: Flexible NoSQL schema design supporting relational queries (populate) for complex forum and course data.
- **JWT Authentication**: Secure, HTTP-only cookie-based session management.
- **Bcrypt**: Password hashing and security.
- **Helmet, XSS, Express-Rate-Limit**: Comprehensive middleware protection against injection and brute-force attacks.

---

## 🚀 Installation & Setup

Follow these steps to run NeuroLink locally on your machine.

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (Local installation or MongoDB Atlas URI)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/NeuroLink.git
cd NeuroLink
```

### 2. Install Dependencies
Install dependencies for both the server and the client:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Configuration
Create a `.env` file in the `server` directory and add the following variables:
```env
# server/.env
PORT=5000
NODE_ENV=development

# Database configuration
MONGO_URI=your_mongodb_connection_string

# Authentication Secrets
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# CORS Setting
CLIENT_URL=http://localhost:3001
```

### 4. Database Seeding (Optional but highly recommended)
To populate your database with realistic mock data (including an Admin account, Therapists, Courses, and Forum Posts):
```bash
cd server
npm run seed
```
**Test Accounts provided by the seed script:**
- Admin: `admin@neurolink.com` (Password: `password123`)
- Therapist: `sarah@neurolink.com` (Password: `password123`)
- Student: `student1@test.edu` (Password: `password123`)

### 5. Start the Application
You need to run both the frontend and backend servers.

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev -- --port 3001
```

Navigate to `http://localhost:3001` in your browser.

---

## 📱 Mobile Responsiveness

NeuroLink features a rigorous mobile-first design philosophy. Key responsive decisions include:
- **Bottom-Drawer Interfaces**: Complex sidebars (like the Course Learning Interface) smoothly transition into bottom drawers on mobile screens, preserving vertical space.
- **Full-Screen Modals**: Data-entry modals expand to fill the screen on viewports `<640px` to optimize the touch-typing experience.
- **Accessible Touch Targets**: All interactive buttons, inputs, and links enforce a minimum `44x44px` height matrix for effortless navigation.

---

## 📝 License

This project was built for educational purposes as a Final Year Project. 
