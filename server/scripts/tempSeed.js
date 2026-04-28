import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Therapist from "../models/Therapist.js";
import Article from "../models/Article.js";
import connectDB from "../config/db.js";

dotenv.config();

const therapists = [
  {
    name: "Dr. Sarah Jenkins",
    email: "sarah.jenkins@mindspace.com",
    title: "Clinical Psychologist",
    specializations: ["Anxiety Therapy", "Depression Support", "Anger Management"],
    location: "Dhaka",
    languages: ["English", "Bengali"],
    bio: "Dr. Jenkins has over 10 years of experience helping students navigate academic pressure and anxiety through structured cognitive behavioral therapy.",
    sessionFee: 1500,
    sessionTypes: ["Online", "In-person"],
    services: ["Exam Stress Counseling", "CBT Sessions", "Time Management Coaching"],
    yearsOfExperience: 12,
  },
  {
    name: "Rahim Chowdhury",
    email: "rahim.c@mindspace.com",
    title: "Student Counselor",
    specializations: ["Study-Based Counseling", "Career Stress", "Sleep Disorders"],
    location: "Chittagong",
    languages: ["Bengali"],
    bio: "Rahim specializes in helping university students overcome procrastination and career anxiety. His sessions are highly actionable.",
    sessionFee: 800,
    sessionTypes: ["Online"],
    services: ["Time Management Coaching", "Academic Performance Coaching"],
    yearsOfExperience: 5,
  },
  {
    name: "Aisha Rahman",
    email: "aisha.r@mindspace.com",
    title: "Trauma Specialist",
    specializations: ["Trauma & PTSD", "Grief Counseling", "Relationship Counseling"],
    location: "Dhaka",
    languages: ["English", "Bengali"],
    bio: "Aisha brings a compassionate approach to grief and relationship issues, offering a safe space for deep healing.",
    sessionFee: 2500,
    sessionTypes: ["In-person", "Online"],
    services: ["Relationship Therapy", "Crisis Intervention", "Group Therapy"],
    yearsOfExperience: 15,
  }
];

const articles = [
  {
    title: "Understanding Exam Anxiety",
    content: "Exam anxiety is a common experience among university students. It's that feeling of dread or panic before or during an exam... (Full article content would go here).",
    category: "Academic Stress",
    tags: ["exams", "anxiety", "tips"],
    readTime: 5,
    thumbnailGradient: "from-blue-400 to-indigo-500"
  },
  {
    title: "The Importance of Sleep for Memory",
    content: "Pulling an all-nighter might seem like a good idea before a big test, but research shows that sleep is crucial for memory consolidation...",
    category: "Sleep",
    tags: ["sleep", "memory", "health"],
    readTime: 4,
    thumbnailGradient: "from-purple-400 to-pink-500"
  },
  {
    title: "5 Mindfulness Exercises for Quick Relief",
    content: "When stress hits hard, it's helpful to have a few quick mindfulness exercises in your toolkit. Here are 5 simple techniques...",
    category: "Mindfulness",
    tags: ["mindfulness", "stress", "exercises"],
    readTime: 3,
    thumbnailGradient: "from-emerald-400 to-teal-500"
  }
];

const seedData = async () => {
  try {
    await connectDB();

    console.log("Cleaning existing data...");
    // Only drop Article and Therapist related, not Users entirely unless we want to reset
    await Article.deleteMany();
    await Therapist.deleteMany();
    
    // Clean only therapist users to avoid duplicates
    const therapistEmails = therapists.map(t => t.email);
    await User.deleteMany({ email: { $in: therapistEmails } });

    console.log("Creating therapists...");
    for (const t of therapists) {
      const user = await User.create({
        name: t.name,
        email: t.email,
        password: "Password123!",
        role: "therapist"
      });

      await Therapist.create({
        userId: user._id,
        title: t.title,
        specializations: t.specializations,
        location: t.location,
        languages: t.languages,
        bio: t.bio,
        sessionFee: t.sessionFee,
        sessionTypes: t.sessionTypes,
        services: t.services,
        yearsOfExperience: t.yearsOfExperience,
        isVerified: true,
        photoUrl: `https://ui-avatars.com/api/?name=${t.name.replace(" ", "+")}&background=random`
      });
    }

    console.log("Creating articles...");
    await Article.insertMany(articles);

    console.log("✅ Data Imported successfully!");
    process.exit();
  } catch (error) {
    console.error("Error with data import", error);
    process.exit(1);
  }
};

seedData();
