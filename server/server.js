import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import xss from "xss";
import path from "path";
import cookieParser from "cookie-parser";

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
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
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

// Middleware
import errorHandler from "./middleware/error.js";

// Mount routers
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/mood", moodRoutes);
app.use("/api/v1/journal", journalRoutes);
app.use("/api/v1/stress-quiz", stressQuizRoutes);
app.use("/api/v1/habits", habitRoutes);
app.use("/api/v1/gratitude", gratitudeRoutes);
app.use("/api/v1/forum", forumRoutes);
app.use("/api/v1/resources", resourceRoutes);
app.use("/api/v1/therapists", therapistRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`),
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
