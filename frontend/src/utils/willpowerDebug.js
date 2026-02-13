/**
 * DEBUG ONLY — Seeds fake habit completions to test the willpower AI.
 * Remove this file before production / demo.
 */
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getUserHabits } from '../services/habitService';
import { evaluatePlan } from '../services/willpowerService';

/**
 * Seed fake completions to simulate a "struggling" user.
 * Only completes ~20-30% of habits over the last 5 days.
 */
export async function seedStruggling(userId) {
  const habits = await getUserHabits(userId);
  if (habits.length === 0) return 'No active habits found';

  const now = new Date();
  let count = 0;

  // Only complete 1 habit on 2 of the last 5 days
  for (const dayOffset of [1, 3]) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(10, 0, 0, 0);

    const habit = habits[0]; // only the easiest one
    await addDoc(collection(db, 'habitCompletions'), {
      userId,
      habitId: habit.habitId,
      xpAwarded: habit.xpReward,
      completedAt: Timestamp.fromDate(date),
    });
    count++;
  }

  const result = await evaluatePlan(userId);
  return {
    seeded: `${count} completions (struggling pattern)`,
    aiResult: result || 'No suggestion triggered (may need more contrast)',
  };
}

/**
 * Seed fake completions to simulate a "crushing it" user.
 * Completes all habits every day for the last 5 days.
 */
export async function seedCrushing(userId) {
  const habits = await getUserHabits(userId);
  if (habits.length === 0) return 'No active habits found';

  const now = new Date();
  let count = 0;

  for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
    const date = new Date(now);
    date.setDate(date.getDate() - dayOffset);
    date.setHours(10, 0, 0, 0);

    for (const habit of habits) {
      await addDoc(collection(db, 'habitCompletions'), {
        userId,
        habitId: habit.habitId,
        xpAwarded: habit.xpReward,
        completedAt: Timestamp.fromDate(date),
      });
      count++;
    }
  }

  const result = await evaluatePlan(userId);
  return {
    seeded: `${count} completions (crushing it pattern)`,
    aiResult: result || 'No suggestion triggered (plan difficulty may already match)',
  };
}

/**
 * Just run the evaluation without seeding — check current state.
 */
export async function runEvalOnly(userId) {
  const result = await evaluatePlan(userId);
  return result || 'No suggestion triggered';
}
