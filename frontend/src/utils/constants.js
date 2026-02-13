// Avatar evolution stages (male — each stage covers 3 levels)
export const AVATAR_STAGES = {
  1: { name: 'Villager', image: require('../assets/levels-male/firstlevels.png') },
  2: { name: 'Apprentice', image: require('../assets/levels-male/secondlevels.png') },
  3: { name: 'Warrior', image: require('../assets/levels-male/thirdlevels.png') },
  4: { name: 'Knight', image: require('../assets/levels-male/fourthlevels.png') },
  5: { name: 'Champion', image: require('../assets/levels-male/fifthlevels.png') },
  6: { name: 'Hero', image: require('../assets/levels-male/sixthlevels.png') },
  7: { name: 'Legend', image: require('../assets/levels-male/seventhlevel.png') },
};

// XP required per level (level = floor(xp / 100) + 1)
export const XP_PER_LEVEL = 100;

// Max avatar stage
export const MAX_AVATAR_STAGE = 7;

// Gender options
export const GENDERS = ['male', 'female'];

// Predefined goal options (single-select during onboarding)
export const GOALS = [
  'nutrition',
  'hydration',
  'sleep',
  'fitness',
  'mental health',
];

// Available interest categories (multi-select, max 3)
export const INTEREST_CATEGORIES = [
  'nutrition',
  'hydration',
  'sleep',
  'fitness',
  'mental health',
];

// Predefined habit templates to seed in Firestore
export const HABIT_TEMPLATES = [
  // Nutrition
  { id: 'habit_1', title: 'Eat a serving of fruit', category: 'nutrition', difficulty: 'easy', xpReward: 20 },
  { id: 'habit_2', title: 'Eat a home-cooked meal', category: 'nutrition', difficulty: 'easy', xpReward: 25 },
  { id: 'habit_3', title: 'Track all meals for the day', category: 'nutrition', difficulty: 'intermediate', xpReward: 40 },

  // Hydration
  { id: 'habit_4', title: 'Drink 4 glasses of water', category: 'hydration', difficulty: 'easy', xpReward: 15 },
  { id: 'habit_5', title: 'Drink 8 glasses of water', category: 'hydration', difficulty: 'intermediate', xpReward: 35 },
  { id: 'habit_6', title: 'Replace one soda with water', category: 'hydration', difficulty: 'easy', xpReward: 20 },

  // Sleep
  { id: 'habit_7', title: 'Go to bed before midnight', category: 'sleep', difficulty: 'easy', xpReward: 20 },
  { id: 'habit_8', title: 'No screens 30 min before bed', category: 'sleep', difficulty: 'intermediate', xpReward: 35 },
  { id: 'habit_9', title: 'Get 7+ hours of sleep', category: 'sleep', difficulty: 'easy', xpReward: 25 },

  // Fitness
  { id: 'habit_10', title: 'Take a 15-minute walk', category: 'fitness', difficulty: 'easy', xpReward: 20 },
  { id: 'habit_11', title: 'Do 10 push-ups', category: 'fitness', difficulty: 'easy', xpReward: 15 },
  { id: 'habit_12', title: 'Complete a 30-min workout', category: 'fitness', difficulty: 'intermediate', xpReward: 45 },

  // Mental Health
  { id: 'habit_13', title: 'Meditate for 5 minutes', category: 'mental health', difficulty: 'easy', xpReward: 20 },
  { id: 'habit_14', title: 'Write 3 things you are grateful for', category: 'mental health', difficulty: 'easy', xpReward: 20 },
  { id: 'habit_15', title: 'Journal for 10 minutes', category: 'mental health', difficulty: 'intermediate', xpReward: 35 },
];

// Motivational messages shown after completing habits
export const MOTIVATIONAL_MESSAGES = [
  "You're building something great!",
  "Every small step counts!",
  "Consistency is your superpower!",
  "Look at you go! Keep it up!",
  "Your future self will thank you!",
  "One habit at a time, one day at a time!",
  "Progress, not perfection!",
  "You showed up today — that's what matters!",
];

// Daily Check types with XP rewards, icons, and questions
export const DAILY_CHECKS = [
  { key: 'water', title: 'Water', icon: require('../assets/avatars/water.png'), xp: 10, question: 'Did you drink enough water today?' },
  { key: 'movement', title: 'Movement', icon: require('../assets/avatars/sport.png'), xp: 15, question: 'Did you move your body today?' },
  { key: 'productivity', title: 'Productivity', icon: '✅', xp: 20, question: 'Were you productive today?' },
  { key: 'medicine', title: 'Medicine', icon: require('../assets/avatars/medecines.png'), xp: 10, question: 'Did you take your medicine today?' },
  { key: 'sleep', title: 'Sleep', icon: require('../assets/avatars/deep-sleep.png'), xp: 10, question: 'Did you get enough sleep?' },
  { key: 'mood', title: 'Mental State', icon: require('../assets/avatars/how are u feeling.png'), xp: 5, question: 'Are you feeling good mentally?' },
  { key: 'doctor', title: 'Need a Doctor', icon: '🩺', xp: 0, question: 'Do you need to see a doctor?' },
  { key: 'stretching', title: 'Stretching', icon: require('../assets/avatars/stretch.png'), xp: 10, question: 'Did you stretch today?' },
];

// Default user profile values
export const DEFAULT_USER_PROFILE = {
  xp: 0,
  level: 1,
  streak: 0,
  lastCompletionDate: null,
  avatarStage: 1,
  onboardingComplete: false,
};
