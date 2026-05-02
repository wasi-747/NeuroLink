import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import xss from "xss";
import path from "path";
import cookieParser from "cookie-parser";
import axios from "axios";

import connectDB from "./config/db.js";

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Set security headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.CLIENT_URL,
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
      ].filter(Boolean);

      // Allow if origin is in allowedOrigins or if it's a Vercel URL
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased to prevent dev lockouts)
});
app.use(limiter);

// Prevent XSS attacks
const sanitizeObject = (obj) => {
  if (!obj) return;
  for (let key in obj) {
    if (typeof obj[key] === "string") {
      obj[key] = xss(obj[key]);
    } else if (typeof obj[key] === "object") {
      sanitizeObject(obj[key]);
    }
  }
};
app.use((req, res, next) => {
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  next();
});

// Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Route files
import authRoutes from "./routes/auth.js";
import moodRoutes from "./routes/mood.js";
import journalRoutes from "./routes/journal.js";
import stressQuizRoutes from "./routes/stressQuiz.js";
import habitRoutes from "./routes/habit.js";
import gratitudeRoutes from "./routes/gratitude.js";
import forumRoutes from "./routes/forum.js";
import resourceRoutes from "./routes/resource.js";
import therapistRoutes from "./routes/therapist.js";
import courseRoutes from "./routes/course.js";
import adminRoutes from "./routes/admin.js";
import mlRoutes from "./routes/ml.js";
import wellnessReportRoutes from "./routes/wellnessReport.js";
import learningRoutes from "./routes/learning.js";

// Cron Jobs
import { initCronJobs } from "./utils/cronJobs.js";

// Middleware
import errorHandler from "./middleware/error.js";

// Mount routers
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/mood", moodRoutes);
app.use("/api/v1/journal", journalRoutes);
app.use("/api/v1/stress-quiz", stressQuizRoutes);
app.use("/api/v1/habits", habitRoutes);
app.use("/api/v1/learning", learningRoutes);
app.use("/api/v1/gratitude", gratitudeRoutes);
app.use("/api/v1/forum", forumRoutes);
app.use("/api/v1/resources", resourceRoutes);
app.use("/api/v1/therapists", therapistRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/ml", mlRoutes);
app.use("/api/v1/wellness-reports", wellnessReportRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  // Initialize cron jobs
  initCronJobs();

  // Check ML service connection (with retries for concurrent startup)
  if (process.env.ML_SERVICE_URL) {
    const maxRetries = 5;
    const retryDelay = 2000; // 2 seconds between retries
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.get(`${process.env.ML_SERVICE_URL}/health`, { timeout: 5000 });
        if (response.status === 200 && response.data.status === "ok") {
          console.log("✅ ML service connected");
          break;
        } else {
          console.error("❌ ML service connection failed:", response.data);
        }
      } catch (error) {
        const errMsg = error.message || error.code || error.cause?.message || "Unknown error";
        if (attempt < maxRetries) {
          console.log(`⏳ ML service not ready yet (attempt ${attempt}/${maxRetries}: ${errMsg}), retrying in ${retryDelay / 1000}s...`);
          await new Promise((r) => setTimeout(r, retryDelay));
        } else {
          console.error(`❌ ML service unavailable after ${maxRetries} retries: ${errMsg}`);
        }
      }
    }
  }
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});