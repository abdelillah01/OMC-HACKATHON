import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { HABIT_TEMPLATES, COMMITMENT_LEVELS } from '../utils/constants';
import { getUserHabits, getRecentCompletions, activateHabits, deactivateHabit } from './habitService';

// ── Template lookup ──
const TEMPLATE_MAP = {};
HABIT_TEMPLATES.forEach((t) => { TEMPLATE_MAP[t.id] = t; });

// ── Commitment → base willpower (0-100) ──
const COMMITMENT_BASE = {
  chill: 15,
  casual: 30,
  steady: 50,
  dedicated: 70,
  hardcore: 85,
};

const EVAL_WINDOW_DAYS = 5;
const QUANT_MULTIPLIER = 1.3;
const DISMISS_COOLDOWN_DAYS = 3;
const MIN_DAYS_FOR_EVAL = 2; // need at least 2 days of data

// ── Helpers ──

function getEffectiveDifficulty(habitId) {
  const t = TEMPLATE_MAP[habitId];
  if (!t) return 30; // fallback
  return t.difficulty * (t.isQuantitative ? QUANT_MULTIPLIER : 1.0);
}

function dayKey(date) {
  return date.toISOString().split('T')[0];
}

// ── Core: Calculate willpower + plan difficulty ──

export async function evaluatePlan(userId) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return null;

  const profile = userSnap.data();

  // Check cooldown — don't suggest if recently dismissed
  if (profile.suggestionDismissedAt) {
    const dismissed = profile.suggestionDismissedAt.toDate
      ? profile.suggestionDismissedAt.toDate()
      : new Date(profile.suggestionDismissedAt);
    const cooldownEnd = new Date(dismissed);
    cooldownEnd.setDate(cooldownEnd.getDate() + DISMISS_COOLDOWN_DAYS);
    if (new Date() < cooldownEnd) return null;
  }

  // Get active habits + recent completions
  const [activeHabits, recentCompletions] = await Promise.all([
    getUserHabits(userId),
    getRecentCompletions(userId, EVAL_WINDOW_DAYS),
  ]);

  if (activeHabits.length === 0) return null;

  // Group completions by day
  const completionDays = new Set();
  recentCompletions.forEach((c) => completionDays.add(dayKey(c.completedAt)));

  const daysWithData = completionDays.size;
  if (daysWithData < MIN_DAYS_FOR_EVAL) return null;

  // ── Plan Difficulty (weighted average, 0-100) ──
  const planDiffs = activeHabits.map((h) => getEffectiveDifficulty(h.habitId));
  const planDifficulty = planDiffs.reduce((a, b) => a + b, 0) / planDiffs.length;

  // ── Performance Metrics ──
  const totalPossible = activeHabits.length * EVAL_WINDOW_DAYS;
  const totalCompleted = recentCompletions.length;
  const completionRate = Math.min(totalCompleted / totalPossible, 1); // 0-1

  const consistencyRate = daysWithData / EVAL_WINDOW_DAYS; // 0-1

  // Average difficulty of completed habits
  const completedDiffs = recentCompletions.map((c) => getEffectiveDifficulty(c.habitId));
  const avgCompletedDiff = completedDiffs.length > 0
    ? completedDiffs.reduce((a, b) => a + b, 0) / completedDiffs.length
    : 0;
  const difficultyRatio = planDifficulty > 0
    ? Math.min(avgCompletedDiff / planDifficulty, 1.5)
    : 1;

  // ── Performance Score (0-100) ──
  const performanceScore =
    completionRate * 50 +
    consistencyRate * 30 +
    Math.min(difficultyRatio, 1) * 20;

  // ── Willpower (0-100) ──
  const commitBase = COMMITMENT_BASE[profile.commitmentLevel] || 40;
  const willpower = Math.round(commitBase * 0.25 + performanceScore * 0.75);

  // Save willpower to profile (hidden from user)
  await updateDoc(userRef, { willpower });

  // ── Double Threshold Decision ──
  let direction = null;
  let reason = '';

  if (willpower >= planDifficulty + 20 && completionRate >= 0.75) {
    direction = 'harder';
    reason = "You've been crushing your goals consistently! Your current plan might be too easy for you.";
  } else if (willpower <= planDifficulty - 20 && completionRate <= 0.4) {
    direction = 'easier';
    reason = "We noticed you've been having a tough time keeping up. A lighter plan might help you build momentum.";
  }

  if (!direction) return null;

  // ── Build Suggestion ──
  const suggestion = buildSuggestion(
    direction,
    activeHabits,
    profile.selectedGoals || profile.selectedInterests || [],
    profile.commitmentLevel,
  );

  if (!suggestion) return null;

  return {
    direction,
    reason,
    willpower,
    planDifficulty: Math.round(planDifficulty),
    completionRate: Math.round(completionRate * 100),
    ...suggestion,
  };
}

// ── Build a concrete suggestion (which habits to swap) ──

function buildSuggestion(direction, activeHabits, userGoals, commitmentLevel) {
  const activeIds = new Set(activeHabits.map((h) => h.habitId));

  // Available templates matching user goals, not already active
  const available = HABIT_TEMPLATES.filter(
    (t) => !activeIds.has(t.id) && t.goals.some((g) => userGoals.includes(g))
  );

  if (direction === 'harder') {
    return buildHarderSuggestion(activeHabits, available);
  } else {
    return buildEasierSuggestion(activeHabits, available);
  }
}

function buildHarderSuggestion(activeHabits, available) {
  // Sort active by effective difficulty ASC — easiest first
  const sorted = [...activeHabits].sort(
    (a, b) => getEffectiveDifficulty(a.habitId) - getEffectiveDifficulty(b.habitId)
  );

  const swaps = []; // { remove: activeHabit, add: template }
  const toAdd = []; // templates to add without removing

  // Try to replace the 2 easiest habits with harder ones
  for (const habit of sorted.slice(0, 2)) {
    const currentDiff = getEffectiveDifficulty(habit.habitId);
    const template = TEMPLATE_MAP[habit.habitId];
    const category = template?.category || habit.category;

    // Find a harder habit in the same category
    const replacement = available
      .filter((t) => t.category === category && getEffectiveDifficulty(t.id) > currentDiff)
      .sort((a, b) => a.difficulty - b.difficulty)[0]; // pick the next step up

    if (replacement) {
      swaps.push({ remove: habit, add: replacement });
      available.splice(available.indexOf(replacement), 1);
    }
  }

  // If no swaps found, suggest adding a new habit
  if (swaps.length === 0 && available.length > 0) {
    const avgDiff = activeHabits.reduce((s, h) => s + getEffectiveDifficulty(h.habitId), 0) / activeHabits.length;
    const newHabit = available
      .filter((t) => t.difficulty >= avgDiff)
      .sort((a, b) => a.difficulty - b.difficulty)[0];
    if (newHabit) toAdd.push(newHabit);
  }

  if (swaps.length === 0 && toAdd.length === 0) return null;
  return { swaps, toAdd, toRemove: [] };
}

function buildEasierSuggestion(activeHabits, available) {
  // Sort active by effective difficulty DESC — hardest first
  const sorted = [...activeHabits].sort(
    (a, b) => getEffectiveDifficulty(b.habitId) - getEffectiveDifficulty(a.habitId)
  );

  const swaps = [];
  const toRemove = [];

  // Try to replace the 2 hardest habits with easier ones
  for (const habit of sorted.slice(0, 2)) {
    const currentDiff = getEffectiveDifficulty(habit.habitId);
    const template = TEMPLATE_MAP[habit.habitId];
    const category = template?.category || habit.category;

    const replacement = available
      .filter((t) => t.category === category && getEffectiveDifficulty(t.id) < currentDiff)
      .sort((a, b) => b.difficulty - a.difficulty)[0]; // pick the closest easier one

    if (replacement) {
      swaps.push({ remove: habit, add: replacement });
      available.splice(available.indexOf(replacement), 1);
    } else {
      // No easier replacement — suggest removing this habit
      toRemove.push(habit);
    }
  }

  if (swaps.length === 0 && toRemove.length === 0) return null;
  return { swaps, toRemove, toAdd: [] };
}

// ── Apply the suggestion ──

export async function applySuggestion(userId, suggestion) {
  const { swaps, toAdd, toRemove } = suggestion;

  // Remove old habits from swaps + toRemove
  const removePromises = [
    ...swaps.map((s) => deactivateHabit(s.remove.id)),
    ...toRemove.map((h) => deactivateHabit(h.id)),
  ];
  await Promise.all(removePromises);

  // Add new habits from swaps + toAdd
  const newHabits = [
    ...swaps.map((s) => s.add),
    ...toAdd,
  ];
  if (newHabits.length > 0) {
    await activateHabits(userId, newHabits);
  }

  // Clear dismissal cooldown
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { suggestionDismissedAt: null });
}

// ── Dismiss the suggestion (set cooldown) ──

export async function dismissSuggestion(userId) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { suggestionDismissedAt: new Date() });
}
