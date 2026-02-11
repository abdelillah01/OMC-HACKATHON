import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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
