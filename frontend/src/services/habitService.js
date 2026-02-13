import {
  collection,
  doc,
  setDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { HABIT_TEMPLATES, COMMITMENT_LEVELS } from '../utils/constants';

/**
 * Seed predefined habit templates into Firestore.
 * Re-seeds if the count in Firestore differs from HABIT_TEMPLATES.length.
 */
export const seedHabitTemplates = async () => {
  const habitsRef = collection(db, 'habits');
  const snapshot = await getDocs(habitsRef);

  // Re-seed if count differs (handles both empty and outdated)
  if (snapshot.size === HABIT_TEMPLATES.length) return;

  const promises = HABIT_TEMPLATES.map((habit) =>
    setDoc(doc(db, 'habits', habit.id), {
      title: habit.title,
      category: habit.category,
      goals: habit.goals,
      difficulty: habit.difficulty,
      xpReward: habit.xpReward,
      isQuantitative: habit.isQuantitative,
      ...(habit.unit && { unit: habit.unit }),
      ...(habit.targetValue !== undefined && { targetValue: habit.targetValue }),
    })
  );
  await Promise.all(promises);
};

/**
 * Get recommended habits filtered by selected goals and commitment level.
 * Returns habits whose goals overlap with selectedGoals AND difficulty <= maxDifficulty,
 * sorted by difficulty ascending.
 */
export const getRecommendedHabits = (selectedGoals, commitmentLevel) => {
  const level = COMMITMENT_LEVELS.find((l) => l.id === commitmentLevel);
  const maxDifficulty = level ? level.maxDifficulty : 100;

  return HABIT_TEMPLATES
    .filter((h) => {
      const goalOverlap = h.goals.some((g) => selectedGoals.includes(g));
      return goalOverlap && h.difficulty <= maxDifficulty;
    })
    .sort((a, b) => a.difficulty - b.difficulty);
};

/**
 * Activate selected habits for a user (write to userHabits collection).
 * Stores quantitative fields (isQuantitative, unit, targetValue) when present.
 */
export const activateHabits = async (userId, habits) => {
  const promises = habits.map((habit) =>
    addDoc(collection(db, 'userHabits'), {
      userId,
      habitId: habit.id,
      title: habit.title,
      category: habit.category,
      xpReward: habit.xpReward,
      isQuantitative: habit.isQuantitative || false,
      ...(habit.unit && { unit: habit.unit }),
      ...(habit.targetValue !== undefined && { targetValue: habit.targetValue }),
      activatedAt: serverTimestamp(),
    })
  );
  await Promise.all(promises);
};

/**
 * Deactivate (remove) a habit for a user by its userHabits doc ID.
 */
export const deactivateHabit = async (docId) => {
  await deleteDoc(doc(db, 'userHabits', docId));
};

/**
 * Get all active habits for a user
 */
export const getUserHabits = async (userId) => {
  const q = query(
    collection(db, 'userHabits'),
    where('userId', '==', userId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Record a habit completion. Accepts optional completedValue for quantitative habits.
 */
export const completeHabit = async (userId, habitId, xpReward, completedValue) => {
  const data = {
    userId,
    habitId,
    xpAwarded: xpReward,
    completedAt: serverTimestamp(),
  };
  if (completedValue !== undefined && completedValue !== null) {
    data.completedValue = completedValue;
  }
  await addDoc(collection(db, 'habitCompletions'), data);
};

/**
 * Get habit completions for a user (most recent first)
 */
export const getHabitCompletions = async (userId) => {
  const q = query(
    collection(db, 'habitCompletions'),
    where('userId', '==', userId),
    orderBy('completedAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

/**
 * Get today's completions for a user (to restore "Done" state after refresh)
 * Returns a Set of habitIds completed today.
 */
export const getTodayCompletions = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfDay = Timestamp.fromDate(today);

  const q = query(
    collection(db, 'habitCompletions'),
    where('userId', '==', userId),
    where('completedAt', '>=', startOfDay)
  );
  const snapshot = await getDocs(q);
  const completedIds = {};
  snapshot.docs.forEach((doc) => {
    completedIds[doc.data().habitId] = true;
  });
  return completedIds;
};
