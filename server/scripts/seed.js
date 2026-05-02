import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Therapist from "../models/Therapist.js";
import Course from "../models/Course.js";
import Article from "../models/Article.js";
import ForumPost from "../models/ForumPost.js";
import Comment from "../models/Comment.js";
import MoodEntry from "../models/MoodEntry.js";
import HabitLog from "../models/HabitLog.js";
import Habit from "../models/Habit.js";
import GratitudeEntry from "../models/GratitudeEntry.js";
import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";

// Load env vars
dotenv.config({ path: "./.env" });

const generateAlias = () => {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, animals],
    separator: "-",
    style: "lowerCase",
  });
};

const seedDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected!");

    console.log("Clearing existing data...");
    await User.deleteMany();
    await Therapist.deleteMany();
    await Course.deleteMany();
    await Article.deleteMany();
    await ForumPost.deleteMany();
    await Comment.deleteMany();
    await MoodEntry.deleteMany();
    await Habit.deleteMany();
    await HabitLog.deleteMany();
    await GratitudeEntry.deleteMany();

    console.log("Creating Users...");
    const users = await User.create([
      {
        name: "Admin User",
        email: "admin@neurolink.com",
        password: "password123",
        role: "admin",
      },
      {
        name: "Dr. Sarah Jenkins",
        email: "sarah@neurolink.com",
        password: "password123",
        role: "therapist",
      },
      {
        name: "Dr. Ahmed Khan",
        email: "ahmed@neurolink.com",
        password: "password123",
        role: "therapist",
      },
      {
        name: "Dr. Emily Chen",
        email: "emily@neurolink.com",
        password: "password123",
        role: "therapist",
      },
      {
        name: "Student One",
        email: "student1@test.edu",
        password: "password123",
        role: "user",
        anonymousAlias: generateAlias()
      },
      {
        name: "Student Two",
        email: "student2@test.edu",
        password: "password123",
        role: "user",
        anonymousAlias: generateAlias()
      },
      {
        name: "Student Three",
        email: "student3@test.edu",
        password: "password123",
        role: "user",
        anonymousAlias: generateAlias()
      }
    ]);

    const adminId = users[0]._id;
    const therapistId1 = users[1]._id;
    const therapistId2 = users[2]._id;
    const therapistId3 = users[3]._id;
    const student1 = users[4];
    const student2 = users[5];

    console.log("Creating Therapists...");
    await Therapist.insertMany([
      {
        userId: therapistId1,
        title: "Clinical Psychologist",
        specializations: ["Anxiety Therapy", "Depression Support", "Study-Based Counseling"],
        location: "Online",
        languages: ["English", "Spanish"],
        bio: "Dr. Jenkins specializes in helping students navigate academic pressure and generalized anxiety.",
        sessionFee: 1500,
        currency: "BDT",
        sessionTypes: ["Online", "In-person"],
        services: ["Exam Stress Counseling", "CBT Sessions"],
        isVerified: true,
        rating: 4.8,
        reviewCount: 45,
        yearsOfExperience: 8,
        photoUrl: "https://ui-avatars.com/api/?name=Sarah+Jenkins&background=random"
      },
      {
        userId: therapistId2,
        title: "Counseling Psychologist",
        specializations: ["Relationship Counseling", "Grief Counseling", "Addiction Support"],
        location: "Dhaka",
        languages: ["English", "Bengali"],
        bio: "Dr. Khan has over 10 years of experience helping young adults with relationship issues and career stress.",
        sessionFee: 2000,
        currency: "BDT",
        sessionTypes: ["Online"],
        services: ["Relationship Therapy", "Group Therapy"],
        isVerified: true,
        rating: 4.9,
        reviewCount: 120,
        yearsOfExperience: 12,
        photoUrl: "https://ui-avatars.com/api/?name=Ahmed+Khan&background=random"
      },
      {
        userId: therapistId3,
        title: "Psychiatrist",
        specializations: ["Sleep Disorders", "Eating Disorders", "Trauma & PTSD"],
        location: "Online",
        languages: ["English", "Mandarin"],
        bio: "Dr. Chen focuses on trauma recovery and sleep optimization for high-performing students.",
        sessionFee: 2500,
        currency: "BDT",
        sessionTypes: ["Online", "In-person"],
        services: ["Crisis Intervention", "Mindfulness Training"],
        isVerified: true,
        rating: 4.7,
        reviewCount: 32,
        yearsOfExperience: 6,
        photoUrl: "https://ui-avatars.com/api/?name=Emily+Chen&background=random"
      }
    ]);

    console.log("Creating Courses...");
    await Course.insertMany([
      {
        title: "Overcoming Academic Anxiety",
        slug: "overcoming-academic-anxiety",
        description: "A comprehensive guide to managing exam stress, perfectionism, and academic burnout.",
        instructor: { name: "Dr. Sarah Jenkins", bio: "Clinical Psychologist" },
        thumbnailGradient: "from-blue-500 to-indigo-600",
        price: 0,
        originalPrice: 1500,
        duration: 3.5,
        lessonCount: 5,
        level: "Beginner",
        category: "Anxiety",
        rating: 4.9,
        enrollmentCount: 1540,
        tags: ["anxiety", "study", "exams"],
        whatYouWillLearn: ["Identify burnout triggers", "Manage exam panic", "Create a balanced study schedule", "Practice quick grounding techniques"],
        isPublished: true,
        modules: [
          {
            title: "Understanding Academic Anxiety",
            order: 1,
            lessons: [
              { title: "What is Academic Anxiety?", duration: 15, type: "video", order: 1, isPreview: true },
              { title: "The Cycle of Procrastination", duration: 20, type: "video", order: 2, isPreview: false }
            ]
          },
          {
            title: "Tools for Success",
            order: 2,
            lessons: [
              { title: "Breathing Techniques for Exams", duration: 10, type: "video", order: 1, isPreview: false },
              { title: "Time Blocking Strategies", duration: 25, type: "video", order: 2, isPreview: false },
              { title: "Self-Compassion in Studies", duration: 15, type: "article", order: 3, isPreview: false }
            ]
          }
        ]
      },
      {
        title: "Building Better Sleep Habits",
        slug: "better-sleep-habits",
        description: "Science-backed strategies to fix your sleep schedule and wake up energized.",
        instructor: { name: "Dr. Emily Chen", bio: "Psychiatrist" },
        thumbnailGradient: "from-indigo-900 to-purple-800",
        price: 999,
        originalPrice: 2000,
        duration: 2,
        lessonCount: 4,
        level: "Beginner",
        category: "Sleep",
        rating: 4.7,
        enrollmentCount: 890,
        tags: ["sleep", "habits", "insomnia"],
        whatYouWillLearn: ["Understand sleep cycles", "Create a wind-down routine", "Optimize your bedroom", "Manage racing thoughts at night"],
        isPublished: true,
        modules: [
          {
            title: "The Science of Sleep",
            order: 1,
            lessons: [
              { title: "Why We Sleep", duration: 20, type: "video", order: 1, isPreview: true },
              { title: "Circadian Rhythms Explained", duration: 25, type: "video", order: 2, isPreview: false }
            ]
          },
          {
            title: "Actionable Sleep Strategies",
            order: 2,
            lessons: [
              { title: "Building a Bedtime Routine", duration: 15, type: "video", order: 1, isPreview: false },
              { title: "Sleep Hygiene Checklist", duration: 10, type: "article", order: 2, isPreview: false }
            ]
          }
        ]
      },
      {
        title: "Anger Management Masterclass",
        slug: "anger-management-masterclass",
        description: "Learn to recognize triggers and build emotional control.",
        instructor: { name: "Dr. Ahmed Khan", bio: "Counseling Psychologist" },
        thumbnailGradient: "from-red-500 to-orange-600",
        price: 799,
        duration: 5,
        lessonCount: 15,
        level: "Beginner",
        category: "Anger",
        rating: 4.6,
        enrollmentCount: 450,
        tags: ["anger", "emotions", "control"],
        whatYouWillLearn: ["Identify anger triggers", "De-escalate situations", "Communicate effectively"],
        isPublished: true,
        modules: [
          {
            title: "Understanding Anger", order: 1, lessons: [
              { title: "What is Anger?", duration: 15, type: "video", order: 1, isPreview: true },
              { title: "Common Triggers", duration: 20, type: "video", order: 2, isPreview: false }
            ]
          },
          {
            title: "Management Techniques", order: 2, lessons: [
              { title: "The Pause Strategy", duration: 25, type: "video", order: 1, isPreview: false },
              { title: "Reframing Thoughts", duration: 20, type: "video", order: 2, isPreview: false },
              { title: "Journaling Exercise", duration: 10, type: "article", order: 3, isPreview: false }
            ]
          }
        ]
      },
      {
        title: "Building Resilience & Mental Toughness",
        slug: "building-resilience",
        description: "Develop the mental fortitude to bounce back from setbacks.",
        instructor: { name: "Dr. Sarah Jenkins", bio: "Clinical Psychologist" },
        thumbnailGradient: "from-gray-700 to-gray-900",
        price: 599,
        duration: 4,
        lessonCount: 10,
        level: "Intermediate",
        category: "Self-Care",
        rating: 4.8,
        enrollmentCount: 1200,
        tags: ["resilience", "toughness", "growth"],
        whatYouWillLearn: ["Bounce back from failure", "Maintain focus under pressure"],
        isPublished: true,
        modules: [
          {
            title: "Foundations of Resilience", order: 1, lessons: [
              { title: "Defining Resilience", duration: 20, type: "video", order: 1, isPreview: true },
              { title: "The Growth Mindset", duration: 25, type: "video", order: 2, isPreview: false }
            ]
          },
          {
            title: "Practical Applications", order: 2, lessons: [
              { title: "Handling Rejection", duration: 20, type: "video", order: 1, isPreview: false },
              { title: "Staying Motivated", duration: 20, type: "video", order: 2, isPreview: false }
            ]
          }
        ]
      },
      {
        title: "Mindfulness & Meditation Fundamentals",
        slug: "mindfulness-meditation-fundamentals",
        description: "A practical guide to starting a daily meditation practice.",
        instructor: { name: "Dr. Emily Chen", bio: "Psychiatrist" },
        thumbnailGradient: "from-teal-400 to-emerald-600",
        price: 399,
        duration: 3.5,
        lessonCount: 8,
        level: "Beginner",
        category: "Mindfulness",
        rating: 4.9,
        enrollmentCount: 2000,
        tags: ["mindfulness", "meditation", "peace"],
        whatYouWillLearn: ["Basic meditation postures", "Focusing on the breath", "Body scan techniques"],
        isPublished: true,
        modules: [
          {
            title: "Getting Started", order: 1, lessons: [
              { title: "What is Mindfulness?", duration: 15, type: "video", order: 1, isPreview: true },
              { title: "Setting Up Your Space", duration: 10, type: "article", order: 2, isPreview: false }
            ]
          },
          {
            title: "Core Practices", order: 2, lessons: [
              { title: "Guided Breath Meditation", duration: 25, type: "video", order: 1, isPreview: false },
              { title: "Walking Meditation", duration: 20, type: "video", order: 2, isPreview: false }
            ]
          }
        ]
      },
      {
        title: "Relationships & Social Anxiety",
        slug: "relationships-social-anxiety",
        description: "Overcome the fear of judgment and build meaningful connections.",
        instructor: { name: "Dr. Ahmed Khan", bio: "Counseling Psychologist" },
        thumbnailGradient: "from-pink-500 to-rose-600",
        price: 699,
        duration: 4,
        lessonCount: 12,
        level: "Beginner",
        category: "Relationships",
        rating: 4.7,
        enrollmentCount: 850,
        tags: ["social-anxiety", "relationships", "communication"],
        whatYouWillLearn: ["Identify social triggers", "Use exposure techniques safely", "Communicate boundaries"],
        isPublished: true,
        modules: [
          {
            title: "Understanding Social Anxiety", order: 1, lessons: [
              { title: "The Fear of Judgment", duration: 20, type: "video", order: 1, isPreview: true },
              { title: "Safety Behaviors", duration: 15, type: "article", order: 2, isPreview: false }
            ]
          },
          {
            title: "Building Connections", order: 2, lessons: [
              { title: "Starting Conversations", duration: 25, type: "video", order: 1, isPreview: false },
              { title: "Active Listening", duration: 20, type: "video", order: 2, isPreview: false }
            ]
          }
        ]
      },
      {
        title: "Stress Management for Students",
        slug: "stress-management-students",
        description: "Practical tools for balancing academics, social life, and health.",
        instructor: { name: "Dr. Sarah Jenkins", bio: "Clinical Psychologist" },
        thumbnailGradient: "from-yellow-400 to-orange-500",
        price: 499,
        duration: 3,
        lessonCount: 9,
        level: "Beginner",
        category: "Academic Stress",
        rating: 4.8,
        enrollmentCount: 1700,
        tags: ["stress", "academics", "balance"],
        whatYouWillLearn: ["Time management", "Prioritization", "Relaxation exercises"],
        isPublished: true,
        modules: [
          {
            title: "The Mechanics of Stress", order: 1, lessons: [
              { title: "Good vs. Bad Stress", duration: 15, type: "video", order: 1, isPreview: true },
              { title: "Physical Symptoms", duration: 15, type: "article", order: 2, isPreview: false }
            ]
          },
          {
            title: "Management Strategies", order: 2, lessons: [
              { title: "The Eisenhower Matrix", duration: 20, type: "video", order: 1, isPreview: false },
              { title: "Saying No", duration: 15, type: "video", order: 2, isPreview: false }
            ]
          }
        ]
      },
      {
        title: "Academic Burnout Recovery",
        slug: "academic-burnout-recovery",
        description: "How to recover your motivation when you feel completely exhausted.",
        instructor: { name: "Dr. Emily Chen", bio: "Psychiatrist" },
        thumbnailGradient: "from-cyan-500 to-blue-600",
        price: 299,
        duration: 2.5,
        lessonCount: 7,
        level: "Beginner",
        category: "Academic Stress",
        rating: 4.9,
        enrollmentCount: 2200,
        tags: ["burnout", "recovery", "motivation"],
        whatYouWillLearn: ["Recognize burnout signs", "Restore energy levels", "Rebuild motivation slowly"],
        isPublished: true,
        modules: [
          {
            title: "Identifying Burnout", order: 1, lessons: [
              { title: "Burnout vs. Laziness", duration: 20, type: "video", order: 1, isPreview: true },
              { title: "The 5 Stages of Burnout", duration: 25, type: "video", order: 2, isPreview: false }
            ]
          },
          {
            title: "The Recovery Plan", order: 2, lessons: [
              { title: "Radical Rest", duration: 20, type: "video", order: 1, isPreview: false },
              { title: "Reintroducing Work", duration: 20, type: "video", order: 2, isPreview: false }
            ]
          }
        ]
      }
    ]);

    console.log("Creating Articles...");
    await Article.insertMany([
      {
        title: "5 Quick Mindfulness Exercises for Between Classes",
        content: "College life is fast-paced. Between back-to-back lectures, assignments, and social obligations, it's easy to feel overwhelmed. Here are 5 quick mindfulness exercises you can do anywhere: 1. 4-7-8 Breathing. 2. 5-Senses Grounding. 3. Body Scan. 4. Mindful Walking. 5. One-Minute Meditation. These practices take almost no time but can significantly reset your nervous system.",
        category: "Mindfulness",
        tags: ["mindfulness", "quick-tips", "stress"],
        readTime: 3,
        thumbnailGradient: "from-emerald-400 to-teal-500",
        isPublished: true
      },
      {
        title: "Navigating Imposter Syndrome in University",
        content: "Do you feel like you don't belong here? Like admissions made a mistake? You're not alone. Up to 70% of students experience imposter syndrome at some point. The key is recognizing the signs: discounting success, overworking, and fear of failure. To combat this, start by reframing your thoughts. Document your wins, talk to peers (they likely feel the same), and remember that learning means not knowing everything yet.",
        category: "Academic Stress",
        tags: ["imposter-syndrome", "confidence", "academics"],
        readTime: 5,
        thumbnailGradient: "from-purple-400 to-pink-500",
        isPublished: true
      },
      {
        title: "The Impact of Screen Time on Sleep",
        content: "We all do it: scrolling through TikTok or Instagram in bed. But the blue light emitted by our screens suppresses melatonin production, making it harder to fall asleep and reducing sleep quality. Try implementing a 'digital sunset' one hour before bed. Swap your phone for a book, light stretching, or journaling. Your brain (and your morning self) will thank you.",
        category: "Sleep",
        tags: ["sleep", "habits", "technology"],
        readTime: 4,
        thumbnailGradient: "from-indigo-400 to-cyan-400",
        isPublished: true
      }
    ]);

    console.log("Creating Forum Posts & Comments...");
    const post1 = await ForumPost.create({
      title: "Feeling overwhelmed with finals coming up",
      content: "I have 4 finals in the span of 3 days next week and I feel paralyzed. Every time I sit down to study I just stare at the wall. Has anyone else experienced this kind of study paralysis? How do you break out of it?",
      category: "Exam Stress",
      authorId: student1._id,
      anonymousAlias: student1.anonymousAlias,
      reactions: [
        { type: "🤗", userId: student2._id },
        { type: "💙", userId: therapistId1 }
      ],
      reactionCounts: { "🤗": 1, "💙": 1 }
    });

    await Comment.create({
      content: "I totally get this. The Pomodoro technique really saved me when I felt paralyzed. Just tell yourself you only have to study for 10 minutes. Usually, once you start, it's easier to keep going.",
      postId: post1._id,
      authorId: student2._id,
      anonymousAlias: student2.anonymousAlias
    });

    const post2 = await ForumPost.create({
      title: "Is it normal to feel so lonely in college?",
      content: "Everyone told me these would be the best years of my life, but honestly, I've never felt more alone. It seems like everyone else has already found their friend groups and I'm just on the outside looking in.",
      category: "Loneliness",
      authorId: student2._id,
      anonymousAlias: student2.anonymousAlias,
      reactions: [
        { type: "💙", userId: student1._id }
      ],
      reactionCounts: { "💙": 1 }
    });

    await Comment.create({
      content: "It's completely normal. Social media makes it look like everyone is having a blast 24/7, but a lot of people feel lonely. Have you tried joining any clubs related to your major?",
      postId: post2._id,
      authorId: student1._id,
      anonymousAlias: student1.anonymousAlias
    });

    console.log("Creating Trackers Data...");
    // Generate dates for the past 30 days
    const today = new Date();
    const moodEntries = [];
    const habitLogs = [];
    const gratitudeEntries = [];
    const studentIds = [student1._id, student2._id];

    // Seed past 30 days Mood
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      moodEntries.push({
        user: student1._id,
        timestamp: d,
        mood: Math.floor(Math.random() * 5) + 1,
        note: "Just a seeded mood entry."
      });
      moodEntries.push({
        user: student2._id,
        timestamp: d,
        mood: Math.floor(Math.random() * 5) + 1,
        note: "Another seeded mood entry."
      });
    }

    const habits = await Habit.insertMany([
      { user: student1._id, name: "Drink Water", icon: "💧", isDefault: true },
      { user: student2._id, name: "Read 10 mins", icon: "📚", isDefault: true }
    ]);

    // Seed past 14 days Habit
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      habitLogs.push({ user: student1._id, habit: habits[0]._id, date: d, completed: Math.random() > 0.3 });
      habitLogs.push({ user: student2._id, habit: habits[1]._id, date: d, completed: Math.random() > 0.5 });
    }

    // Seed past 7 days Gratitude
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      gratitudeEntries.push({
        user: student1._id,
        date: d,
        items: ["Family", "Health", "Studies"]
      });
      gratitudeEntries.push({
        user: student2._id,
        date: d,
        items: ["Friends", "Food", "Sleep"]
      });
    }

    await MoodEntry.insertMany(moodEntries);
    await HabitLog.insertMany(habitLogs);
    await GratitudeEntry.insertMany(gratitudeEntries);

    console.log("Data Seeding Completed Successfully!");
    process.exit(0);

  } catch (error) {
    console.error("Error with data import:", error);
    process.exit(1);
  }
};

seedDB();
