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

// Avatar evolution stages (female)
export const AVATAR_STAGES_FEMALE = {
  1: { name: 'Villager', image: require('../assets/levels-female/firstlevels.png') },
  2: { name: 'Apprentice', image: require('../assets/levels-female/secondlevels.png') },
  3: { name: 'Warrior', image: require('../assets/levels-female/thirdlevels.png') },
  4: { name: 'Knight', image: require('../assets/levels-female/fourthlevels.png') },
  5: { name: 'Champion', image: require('../assets/levels-female/fifthlevels.png') },
  6: { name: 'Hero', image: require('../assets/levels-female/sixthlevels.png') },
  7: { name: 'Legend', image: require('../assets/levels-female/seventhlevels.png') },
};

// XP required per level (level = floor(xp / 100) + 1)
export const XP_PER_LEVEL = 100;

// Max avatar stage
export const MAX_AVATAR_STAGE = 7;

// Gender options
export const GENDERS = ['male', 'female'];

// ─── Health Goals (multi-select, max 2 during onboarding) ───
export const HEALTH_GOALS = [
  { id: 'fitness', label: 'Get Fit', icon: '💪' },
  { id: 'energy', label: 'Boost Energy', icon: '⚡' },
  { id: 'hydration', label: 'Stay Hydrated', icon: '💧' },
  { id: 'nutrition', label: 'Eat Better', icon: '🥗' },
  { id: 'sleep', label: 'Sleep Well', icon: '😴' },
];

// ─── Commitment Levels (single-select during onboarding) ───
export const COMMITMENT_LEVELS = [
  { id: 'chill', label: 'Chill', description: 'Just getting started', maxDifficulty: 20 },
  { id: 'casual', label: 'Casual', description: 'A few easy habits', maxDifficulty: 40 },
  { id: 'steady', label: 'Steady', description: 'Building consistency', maxDifficulty: 60 },
  { id: 'dedicated', label: 'Dedicated', description: 'Ready to push harder', maxDifficulty: 80 },
  { id: 'hardcore', label: 'Hardcore', description: 'All in, no excuses', maxDifficulty: 100 },
];

// ─── Habit Categories ───
export const HABIT_CATEGORIES = [
  'Walking',
  'Running',
  'Stretching',
  'Yoga',
  'Strength Training',
  'Water Intake',
  'Meal Prep',
  'Fruits & Vegetables',
  'Sleep Hygiene',
  'Meditation',
  'Journaling',
  'Breathing',
  'Screen Time',
  'Supplements',
];

// Legacy exports (kept for backward compatibility with any old references)
export const GOALS = ['nutrition', 'hydration', 'sleep', 'fitness', 'mental health'];
export const INTEREST_CATEGORIES = ['nutrition', 'hydration', 'sleep', 'fitness', 'mental health'];

// ─── 50 Habit Templates ───
// XP formula: 10 + round(difficulty * 0.4)
export const HABIT_TEMPLATES = [
  // ── Walking (4) ──
  { id: 'h_walk_1', title: 'Take a 10-minute walk', category: 'Walking', goals: ['fitness', 'energy'], difficulty: 8, xpReward: 13, isQuantitative: true, unit: 'minutes', targetValue: 10 },
  { id: 'h_walk_2', title: 'Walk 5,000 steps', category: 'Walking', goals: ['fitness', 'energy'], difficulty: 20, xpReward: 18, isQuantitative: true, unit: 'steps', targetValue: 5000 },
  { id: 'h_walk_3', title: 'Walk 8,000 steps', category: 'Walking', goals: ['fitness', 'energy', 'nutrition'], difficulty: 35, xpReward: 24, isQuantitative: true, unit: 'steps', targetValue: 8000 },
  { id: 'h_walk_4', title: 'Walk 30 minutes after a meal', category: 'Walking', goals: ['fitness', 'nutrition'], difficulty: 45, xpReward: 28, isQuantitative: true, unit: 'minutes', targetValue: 30 },

  // ── Running (3) ──
  { id: 'h_run_1', title: 'Jog for 15 minutes', category: 'Running', goals: ['fitness', 'energy'], difficulty: 35, xpReward: 24, isQuantitative: true, unit: 'minutes', targetValue: 15 },
  { id: 'h_run_2', title: 'Run 2 km', category: 'Running', goals: ['fitness', 'energy'], difficulty: 50, xpReward: 30, isQuantitative: true, unit: 'km', targetValue: 2 },
  { id: 'h_run_3', title: 'Run 5 km', category: 'Running', goals: ['fitness', 'energy'], difficulty: 70, xpReward: 38, isQuantitative: true, unit: 'km', targetValue: 5 },

  // ── Stretching (4) ──
  { id: 'h_str_1', title: 'Morning stretch routine', category: 'Stretching', goals: ['fitness', 'energy', 'sleep'], difficulty: 10, xpReward: 14, isQuantitative: true, unit: 'minutes', targetValue: 5 },
  { id: 'h_str_2', title: 'Stretch for 10 minutes', category: 'Stretching', goals: ['fitness', 'energy'], difficulty: 15, xpReward: 16, isQuantitative: true, unit: 'minutes', targetValue: 10 },
  { id: 'h_str_3', title: 'Full body stretch session', category: 'Stretching', goals: ['fitness', 'energy'], difficulty: 25, xpReward: 20, isQuantitative: true, unit: 'minutes', targetValue: 20 },
  { id: 'h_str_4', title: 'Evening wind-down stretch', category: 'Stretching', goals: ['fitness', 'sleep'], difficulty: 30, xpReward: 22, isQuantitative: true, unit: 'minutes', targetValue: 15 },

  // ── Yoga (3) ──
  { id: 'h_yoga_1', title: '10-minute yoga flow', category: 'Yoga', goals: ['fitness', 'energy'], difficulty: 20, xpReward: 18, isQuantitative: true, unit: 'minutes', targetValue: 10 },
  { id: 'h_yoga_2', title: '20-minute yoga session', category: 'Yoga', goals: ['fitness', 'energy'], difficulty: 35, xpReward: 24, isQuantitative: true, unit: 'minutes', targetValue: 20 },
  { id: 'h_yoga_3', title: 'Power yoga workout', category: 'Yoga', goals: ['fitness', 'energy'], difficulty: 55, xpReward: 32, isQuantitative: true, unit: 'minutes', targetValue: 30 },

  // ── Strength Training (4) ──
  { id: 'h_stren_1', title: 'Do 10 push-ups', category: 'Strength Training', goals: ['fitness', 'energy'], difficulty: 15, xpReward: 16, isQuantitative: true, unit: 'reps', targetValue: 10 },
  { id: 'h_stren_2', title: 'Do 20 squats', category: 'Strength Training', goals: ['fitness', 'energy'], difficulty: 20, xpReward: 18, isQuantitative: true, unit: 'reps', targetValue: 20 },
  { id: 'h_stren_3', title: '15-minute bodyweight workout', category: 'Strength Training', goals: ['fitness', 'energy'], difficulty: 30, xpReward: 22, isQuantitative: true, unit: 'minutes', targetValue: 15 },
  { id: 'h_stren_4', title: '30-minute strength session', category: 'Strength Training', goals: ['fitness', 'energy'], difficulty: 40, xpReward: 26, isQuantitative: true, unit: 'minutes', targetValue: 30 },

  // ── Water Intake (4) ──
  { id: 'h_water_1', title: 'Drink a glass of water on waking', category: 'Water Intake', goals: ['hydration', 'energy'], difficulty: 5, xpReward: 12, isQuantitative: false },
  { id: 'h_water_2', title: 'Drink 4 glasses of water', category: 'Water Intake', goals: ['hydration', 'energy', 'nutrition'], difficulty: 10, xpReward: 14, isQuantitative: true, unit: 'glasses', targetValue: 4 },
  { id: 'h_water_3', title: 'Drink 8 glasses of water', category: 'Water Intake', goals: ['hydration', 'energy', 'nutrition'], difficulty: 20, xpReward: 18, isQuantitative: true, unit: 'glasses', targetValue: 8 },
  { id: 'h_water_4', title: 'Drink 3 liters of water', category: 'Water Intake', goals: ['hydration', 'energy'], difficulty: 30, xpReward: 22, isQuantitative: true, unit: 'liters', targetValue: 3 },

  // ── Meal Prep (4) ──
  { id: 'h_meal_1', title: 'Cook one meal at home', category: 'Meal Prep', goals: ['nutrition', 'energy'], difficulty: 15, xpReward: 16, isQuantitative: false },
  { id: 'h_meal_2', title: 'Prep tomorrow\'s lunch', category: 'Meal Prep', goals: ['nutrition', 'energy'], difficulty: 25, xpReward: 20, isQuantitative: false },
  { id: 'h_meal_3', title: 'Cook two healthy meals', category: 'Meal Prep', goals: ['nutrition', 'energy'], difficulty: 35, xpReward: 24, isQuantitative: true, unit: 'meals', targetValue: 2 },
  { id: 'h_meal_4', title: 'Meal prep for the whole day', category: 'Meal Prep', goals: ['nutrition', 'energy'], difficulty: 45, xpReward: 28, isQuantitative: true, unit: 'meals', targetValue: 3 },

  // ── Fruits & Vegetables (4) ──
  { id: 'h_fv_1', title: 'Eat a piece of fruit', category: 'Fruits & Vegetables', goals: ['nutrition'], difficulty: 8, xpReward: 13, isQuantitative: true, unit: 'servings', targetValue: 1 },
  { id: 'h_fv_2', title: 'Eat 2 servings of vegetables', category: 'Fruits & Vegetables', goals: ['nutrition'], difficulty: 20, xpReward: 18, isQuantitative: true, unit: 'servings', targetValue: 2 },
  { id: 'h_fv_3', title: 'Eat 5 servings of fruits & veggies', category: 'Fruits & Vegetables', goals: ['nutrition'], difficulty: 40, xpReward: 26, isQuantitative: true, unit: 'servings', targetValue: 5 },
  { id: 'h_fv_4', title: 'Go fully plant-based for a day', category: 'Fruits & Vegetables', goals: ['nutrition'], difficulty: 55, xpReward: 32, isQuantitative: false },

  // ── Sleep Hygiene (5) ──
  { id: 'h_sleep_1', title: 'Go to bed before midnight', category: 'Sleep Hygiene', goals: ['sleep', 'energy'], difficulty: 15, xpReward: 16, isQuantitative: false },
  { id: 'h_sleep_2', title: 'Set a consistent wake-up time', category: 'Sleep Hygiene', goals: ['sleep', 'energy'], difficulty: 20, xpReward: 18, isQuantitative: false },
  { id: 'h_sleep_3', title: 'No caffeine after 2 PM', category: 'Sleep Hygiene', goals: ['sleep', 'energy'], difficulty: 30, xpReward: 22, isQuantitative: false },
  { id: 'h_sleep_4', title: 'Get 7+ hours of sleep', category: 'Sleep Hygiene', goals: ['sleep', 'energy'], difficulty: 35, xpReward: 24, isQuantitative: true, unit: 'hours', targetValue: 7 },
  { id: 'h_sleep_5', title: 'Follow a full bedtime routine', category: 'Sleep Hygiene', goals: ['sleep', 'energy'], difficulty: 45, xpReward: 28, isQuantitative: false },

  // ── Meditation (4) ──
  { id: 'h_med_1', title: 'Meditate for 3 minutes', category: 'Meditation', goals: ['energy', 'sleep'], difficulty: 10, xpReward: 14, isQuantitative: true, unit: 'minutes', targetValue: 3 },
  { id: 'h_med_2', title: 'Meditate for 5 minutes', category: 'Meditation', goals: ['energy', 'sleep'], difficulty: 15, xpReward: 16, isQuantitative: true, unit: 'minutes', targetValue: 5 },
  { id: 'h_med_3', title: 'Meditate for 10 minutes', category: 'Meditation', goals: ['energy', 'sleep', 'nutrition'], difficulty: 25, xpReward: 20, isQuantitative: true, unit: 'minutes', targetValue: 10 },
  { id: 'h_med_4', title: 'Guided meditation session', category: 'Meditation', goals: ['energy', 'sleep'], difficulty: 35, xpReward: 24, isQuantitative: true, unit: 'minutes', targetValue: 15 },

  // ── Journaling (4) ──
  { id: 'h_jour_1', title: 'Write 3 things you are grateful for', category: 'Journaling', goals: ['energy', 'sleep'], difficulty: 8, xpReward: 13, isQuantitative: false },
  { id: 'h_jour_2', title: 'Journal for 5 minutes', category: 'Journaling', goals: ['energy', 'sleep'], difficulty: 15, xpReward: 16, isQuantitative: true, unit: 'minutes', targetValue: 5 },
  { id: 'h_jour_3', title: 'Write a daily reflection', category: 'Journaling', goals: ['energy', 'sleep'], difficulty: 20, xpReward: 18, isQuantitative: false },
  { id: 'h_jour_4', title: 'Journal for 10 minutes', category: 'Journaling', goals: ['energy', 'sleep'], difficulty: 30, xpReward: 22, isQuantitative: true, unit: 'minutes', targetValue: 10 },

  // ── Breathing (3) ──
  { id: 'h_breath_1', title: 'Take 5 deep breaths', category: 'Breathing', goals: ['energy', 'sleep'], difficulty: 5, xpReward: 12, isQuantitative: true, unit: 'breaths', targetValue: 5 },
  { id: 'h_breath_2', title: '4-7-8 breathing exercise', category: 'Breathing', goals: ['energy', 'sleep'], difficulty: 10, xpReward: 14, isQuantitative: true, unit: 'rounds', targetValue: 4 },
  { id: 'h_breath_3', title: 'Box breathing for 5 minutes', category: 'Breathing', goals: ['energy', 'sleep'], difficulty: 20, xpReward: 18, isQuantitative: true, unit: 'minutes', targetValue: 5 },

  // ── Screen Time (2) ──
  { id: 'h_screen_1', title: 'No screens 30 min before bed', category: 'Screen Time', goals: ['energy', 'sleep'], difficulty: 35, xpReward: 24, isQuantitative: false },
  { id: 'h_screen_2', title: 'Limit social media to 1 hour', category: 'Screen Time', goals: ['energy', 'sleep'], difficulty: 50, xpReward: 30, isQuantitative: true, unit: 'minutes', targetValue: 60 },

  // ── Supplements (2) ──
  { id: 'h_supp_1', title: 'Take your daily vitamins', category: 'Supplements', goals: ['nutrition', 'energy', 'hydration'], difficulty: 5, xpReward: 12, isQuantitative: false },
  { id: 'h_supp_2', title: 'Take morning supplements', category: 'Supplements', goals: ['nutrition', 'energy'], difficulty: 8, xpReward: 13, isQuantitative: false },
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
  { key: 'medicine', title: 'Medicine', icon: require('../assets/avatars/medecines.png'), xp: 10, question: 'Did you take your medicine today?' },
  { key: 'sleep', title: 'Sleep', icon: require('../assets/avatars/deep-sleep.png'), xp: 10, question: 'Did you get enough sleep?' },
  { key: 'mood', title: 'Mental State', icon: require('../assets/avatars/how are u feeling.png'), xp: 5, question: 'Are you feeling good mentally?' },
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
  commitmentLevel: null,
  selectedGoals: [],
};
