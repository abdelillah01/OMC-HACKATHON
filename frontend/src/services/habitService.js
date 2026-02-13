import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { HABIT_TEMPLATES } from '../utils/constants';

/**
 * Seed predefined habit templates into Firestore (run once)
 */
export const seedHabitTemplates = async () => {
  const habitsRef = collection(db, 'habits');
  const snapshot = await getDocs(habitsRef);

  // Skip if already seeded
  if (!snapshot.empty) return;

  const promises = HABIT_TEMPLATES.map((habit) =>
    setDoc(doc(db, 'habits', habit.id), {
      title: habit.title,
      category: habit.category,
      difficulty: habit.difficulty,
      xpReward: habit.xpReward,
    })
  );
  await Promise.all(promises);
};

/**
 * Get recommended habits: easy habits matching user's selected interests
 */
export const getRecommendedHabits = (selectedInterests) => {
  return HABIT_TEMPLATES.filter(
    (h) => h.difficulty === 'easy' && selectedInterests.includes(h.category)
  );
};

/**
 * Activate selected habits for a user (write to userHabits collection)
 */
export const activateHabits = async (userId, habits) => {
  const promises = habits.map((habit) =>
    addDoc(collection(db, 'userHabits'), {
      userId,
      habitId: habit.id,
      title: habit.title,
      category: habit.category,
      xpReward: habit.xpReward,
      activatedAt: serverTimestamp(),
    })
  );
  await Promise.all(promises);
};



/**
 * Delete a user habit (for replacement or removal)
 */
export const deleteUserHabit = async (userHabitId) => {
  await deleteDoc(doc(db, 'userHabits', userHabitId));
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
 * Record a habit completion
 */
export const completeHabit = async (userId, habitId, xpReward) => {
  await addDoc(collection(db, 'habitCompletions'), {
    userId,
    habitId,
    xpAwarded: xpReward,
    completedAt: serverTimestamp(),
  });
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
