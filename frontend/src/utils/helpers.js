import { XP_PER_LEVEL, MAX_AVATAR_STAGE } from './constants';

/**
 * Calculate level from total XP
 * Formula: level = floor(xp / 100) + 1
 */
export const calculateLevel = (xp) => {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
};

/**
 * Calculate XP progress within current level (0-100)
 */
export const getXPProgress = (xp) => {
  return xp % XP_PER_LEVEL;
};

/**
 * Calculate avatar stage from level
 * Stage 1: levels 1-2, Stage 2: levels 3-4, Stage 3: levels 5-6, Stage 4: levels 7+
 */
export const getAvatarStage = (level) => {
  if (level >= 7) return 4;
  if (level >= 5) return 3;
  if (level >= 3) return 2;
  return 1;
};

/**
 * Get today's date as YYYY-MM-DD string
 */
export const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

/**
 * Get yesterday's date as YYYY-MM-DD string
 */
export const getYesterdayString = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

/**
 * Check if a date string is today
 */
export const isToday = (dateString) => {
  return dateString === getTodayString();
};

/**
 * Check if a date string is yesterday
 */
export const isYesterday = (dateString) => {
  return dateString === getYesterdayString();
};

/**
 * Pick a random item from an array
 */
export const randomPick = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};
