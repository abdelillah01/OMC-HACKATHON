import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getTodayString, isToday, isYesterday } from '../utils/helpers';

/**
 * Update daily streak after a habit completion.
 * - If already completed today: no change
 * - If last completion was yesterday: streak++
 * - If gap > 1 day (or first ever): reset streak to 1
 * Returns { newStreak, streakIncreased }
 */
export const updateStreak = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) throw new Error('User not found');

  const data = snap.data();
  const lastDate = data.lastCompletionDate;
  const today = getTodayString();

  // Already completed today — no streak change
  if (isToday(lastDate)) {
    return { newStreak: data.streak, streakIncreased: false };
  }

  let newStreak;
  if (isYesterday(lastDate)) {
    // Consecutive day — increment
    newStreak = data.streak + 1;
  } else {
    // First completion or gap — start fresh
    newStreak = 1;
  }

  await updateDoc(userRef, {
    streak: newStreak,
    lastCompletionDate: today,
  });

  return { newStreak, streakIncreased: true };
};
