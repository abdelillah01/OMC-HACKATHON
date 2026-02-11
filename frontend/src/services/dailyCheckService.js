import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { getTodayString } from '../utils/helpers';
import { DAILY_CHECKS } from '../utils/constants';
import { awardXP } from './gamificationService';
import { updateStreak } from './streakService';

/**
 * Build the Firestore doc ID for today's daily check: {uid}_{YYYY-MM-DD}
 */
const getDocId = (userId) => `${userId}_${getTodayString()}`;

/**
 * Get today's daily check document for a user (or null if none exists)
 */
export const getTodayCheck = async (userId) => {
  const docId = getDocId(userId);
  const snap = await getDoc(doc(db, 'dailyChecks', docId));
  return snap.exists() ? snap.data() : null;
};

/**
 * Submit a daily check answer.
 * - If already answered for this type today → skip (anti-cheat)
 * - If YES → award XP (except doctor), update streak
 * - If NO → save false, no XP
 * Returns { xpAwarded, leveledUp, newLevel }
 */
/**
 * Helper: ensure today's doc exists and return its ref + data
 */
const ensureTodayDoc = async (userId) => {
  const docId = getDocId(userId);
  const docRef = doc(db, 'dailyChecks', docId);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    return { docRef, data: snap.data() };
  }

  const newDoc = {
    userId,
    date: getTodayString(),
    water: null,
    movement: null,
    productivity: null,
    medicine: null,
    sleep: null,
    mood: null,
    doctor: null,
    xpEarned: 0,
    tasks: [],
  };
  await setDoc(docRef, newDoc);
  return { docRef, data: newDoc };
};

/**
 * Get today's tasks array for a user (always returns an array)
 */
export const getTodayTasks = async (userId) => {
  const { data } = await ensureTodayDoc(userId);
  return data.tasks || [];
};

/**
 * Add a task to today's list (max 8).
 * Returns the updated tasks array.
 */
export const addTask = async (text, userId) => {
  const { docRef, data } = await ensureTodayDoc(userId);
  const tasks = data.tasks || [];

  if (tasks.length >= 8) return tasks;

  const updated = [...tasks, { text, completed: false, xpAwarded: false }];
  await updateDoc(docRef, { tasks: updated });
  return updated;
};

/**
 * Toggle a task's completed state.
 * Awards +5 XP on first completion (xpAwarded guard).
 * Returns { tasks, xpAwarded, leveledUp, newLevel }
 */
export const toggleTask = async (index, userId) => {
  const { docRef, data } = await ensureTodayDoc(userId);
  const tasks = [...(data.tasks || [])];
  let result = { xpAwarded: 0, leveledUp: false, newLevel: null };

  if (index < 0 || index >= tasks.length) return { tasks, ...result };

  const task = { ...tasks[index] };
  task.completed = !task.completed;

  // Award XP only on first completion
  if (task.completed && !task.xpAwarded) {
    task.xpAwarded = true;
    const xpResult = await awardXP(userId, 5);
    await updateStreak(userId);
    result = { xpAwarded: 5, leveledUp: xpResult.leveledUp, newLevel: xpResult.newLevel };
    await updateDoc(docRef, {
      tasks: tasks.map((t, i) => (i === index ? task : t)),
      xpEarned: (data.xpEarned || 0) + 5,
    });
  } else {
    tasks[index] = task;
    await updateDoc(docRef, { tasks: tasks.map((t, i) => (i === index ? task : t)) });
  }

  return { tasks: tasks.map((t, i) => (i === index ? task : t)), ...result };
};

/**
 * Delete a task by index.
 * Returns the updated tasks array.
 */
export const deleteTask = async (index, userId) => {
  const { docRef, data } = await ensureTodayDoc(userId);
  const tasks = [...(data.tasks || [])];

  if (index < 0 || index >= tasks.length) return tasks;

  tasks.splice(index, 1);
  await updateDoc(docRef, { tasks });
  return tasks;
};

export const submitCheck = async (type, value, userId) => {
  const docId = getDocId(userId);
  const docRef = doc(db, 'dailyChecks', docId);
  const snap = await getDoc(docRef);

  const checkConfig = DAILY_CHECKS.find((c) => c.key === type);
  let result = { xpAwarded: 0, leveledUp: false, newLevel: null };

  if (snap.exists()) {
    const data = snap.data();

    // Anti-cheat: already answered this check today
    if (data[type] === true || data[type] === false) {
      return result;
    }

    // Calculate XP to award
    const xpToAward = value && checkConfig && checkConfig.xp > 0 ? checkConfig.xp : 0;

    // Update existing document
    await updateDoc(docRef, {
      [type]: value,
      xpEarned: (data.xpEarned || 0) + xpToAward,
    });

    // Award XP and update streak if YES
    if (xpToAward > 0) {
      const xpResult = await awardXP(userId, xpToAward);
      await updateStreak(userId);
      result = { xpAwarded: xpToAward, leveledUp: xpResult.leveledUp, newLevel: xpResult.newLevel };
    }
  } else {
    // Create new document for today
    const xpToAward = value && checkConfig && checkConfig.xp > 0 ? checkConfig.xp : 0;

    const newDoc = {
      userId,
      date: getTodayString(),
      water: null,
      movement: null,
      productivity: null,
      medicine: null,
      sleep: null,
      mood: null,
      doctor: null,
      xpEarned: xpToAward,
    };
    newDoc[type] = value;

    await setDoc(docRef, newDoc);

    // Award XP and update streak if YES
    if (xpToAward > 0) {
      const xpResult = await awardXP(userId, xpToAward);
      await updateStreak(userId);
      result = { xpAwarded: xpToAward, leveledUp: xpResult.leveledUp, newLevel: xpResult.newLevel };
    }
  }

  return result;
};

/**
 * Get XP earned per day for the last 7 days.
 * Aggregates from dailyChecks (checks + tasks XP) and habitCompletions (habit XP).
 * Returns [{ date, label, xp }] sorted Mon→Sun.
 */
export const getWeeklyXP = async (userId) => {
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Build last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().split('T')[0],
      label: DAY_LABELS[d.getDay()],
      xp: 0,
    });
  }

  // 1) Fetch dailyChecks docs for each day (checks + tasks XP)
  const checkPromises = days.map((day) => {
    const docId = `${userId}_${day.date}`;
    return getDoc(doc(db, 'dailyChecks', docId));
  });
  const checkSnaps = await Promise.all(checkPromises);
  checkSnaps.forEach((snap, i) => {
    if (snap.exists()) {
      days[i].xp += snap.data().xpEarned || 0;
    }
  });

  // 2) Query habitCompletions for the last 7 days
  const weekAgo = new Date();
  weekAgo.setHours(0, 0, 0, 0);
  weekAgo.setDate(weekAgo.getDate() - 6);
  const startTs = Timestamp.fromDate(weekAgo);

  const q = query(
    collection(db, 'habitCompletions'),
    where('userId', '==', userId),
    where('completedAt', '>=', startTs),
  );
  const habitSnap = await getDocs(q);
  habitSnap.docs.forEach((d) => {
    const data = d.data();
    if (!data.completedAt) return;
    const completedDate = data.completedAt.toDate().toISOString().split('T')[0];
    const dayEntry = days.find((day) => day.date === completedDate);
    if (dayEntry) {
      dayEntry.xp += data.xpAwarded || 0;
    }
  });

  return days;
};
