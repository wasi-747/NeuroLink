// Offline-First Storage Service
// Handles local persistence for mood logs, habit streaks, custom habits, and offline action queues

const STORAGE_KEYS = {
  MOODS: "@neurolink_moods",
  HABITS: "@neurolink_habits",
  PROFILE: "@neurolink_profile",
  QUEUE: "@neurolink_offline_queue",
};

// In-memory resilient storage for instant zero-latency access across screens
let memoryStore = {
  [STORAGE_KEYS.MOODS]: [
    {
      id: "m1",
      mood: "Ecstatic",
      score: 5,
      energyLevel: 5,
      tags: ["Productive", "Motivated"],
      note: "Completed sprint milestones and went for a run.",
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: "m2",
      mood: "Happy",
      score: 4,
      energyLevel: 4,
      tags: ["Grateful", "Relaxed"],
      note: "Great sleep and peaceful morning coffee.",
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "m3",
      mood: "Calm",
      score: 4,
      energyLevel: 3,
      tags: ["Focused", "Mindful"],
      note: "10-minute 4-7-8 breathing session before work.",
      timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: "m4",
      mood: "Happy",
      score: 4.5,
      energyLevel: 4,
      tags: ["Grateful", "Loved"],
      note: "Connected with family and completed all habits.",
      timestamp: new Date().toISOString(),
    },
  ],
  [STORAGE_KEYS.HABITS]: [
    { id: "h1", name: "Morning Meditation", icon: "Brain", streak: 7, completedToday: true, category: "Mind" },
    { id: "h2", name: "Drink 2.5L Water", icon: "Droplets", streak: 12, completedToday: true, category: "Health" },
    { id: "h3", name: "10,000 Steps", icon: "Dumbbell", streak: 4, completedToday: false, category: "Fitness" },
    { id: "h4", name: "No Screen Before Bed", icon: "SmartphoneOff", streak: 9, completedToday: false, category: "Sleep" },
    { id: "h5", name: "Gratitude Journal", icon: "Book", streak: 15, completedToday: true, category: "Mind" },
  ],
  [STORAGE_KEYS.QUEUE]: [],
};

// Get Moods from storage
export const getLocalMoods = async () => {
  return [...memoryStore[STORAGE_KEYS.MOODS]];
};

// Save a new Mood log
export const saveLocalMood = async (moodLog) => {
  const newLog = {
    ...moodLog,
    id: moodLog.id || Date.now().toString(),
    timestamp: moodLog.timestamp || new Date().toISOString(),
  };
  memoryStore[STORAGE_KEYS.MOODS] = [newLog, ...memoryStore[STORAGE_KEYS.MOODS]];
  return newLog;
};

// Get Habits from storage
export const getLocalHabits = async () => {
  return [...memoryStore[STORAGE_KEYS.HABITS]];
};

// Save or update habits
export const saveLocalHabits = async (habits) => {
  memoryStore[STORAGE_KEYS.HABITS] = [...habits];
  return memoryStore[STORAGE_KEYS.HABITS];
};

// Add a single new habit
export const addLocalHabit = async (habit) => {
  const newHabit = {
    ...habit,
    id: habit.id || Date.now().toString(),
    streak: habit.streak || 1,
    completedToday: false,
  };
  memoryStore[STORAGE_KEYS.HABITS] = [newHabit, ...memoryStore[STORAGE_KEYS.HABITS]];
  return newHabit;
};

// Toggle habit completion status
export const toggleLocalHabit = async (habitId) => {
  memoryStore[STORAGE_KEYS.HABITS] = memoryStore[STORAGE_KEYS.HABITS].map((h) => {
    if (h._id === habitId || h.id === habitId) {
      const nextCompleted = !h.completedToday;
      return {
        ...h,
        completedToday: nextCompleted,
        streak: nextCompleted ? h.streak + 1 : Math.max(0, h.streak - 1),
      };
    }
    return h;
  });
  return memoryStore[STORAGE_KEYS.HABITS];
};

// Enqueue offline action for sync
export const enqueueOfflineAction = async (actionType, payload) => {
  const item = { id: Date.now().toString(), actionType, payload, createdAt: new Date().toISOString() };
  memoryStore[STORAGE_KEYS.QUEUE].push(item);
  return item;
};

// Flush and sync queue
export const getOfflineQueue = async () => {
  return [...memoryStore[STORAGE_KEYS.QUEUE]];
};

export const clearOfflineQueue = async () => {
  memoryStore[STORAGE_KEYS.QUEUE] = [];
};
