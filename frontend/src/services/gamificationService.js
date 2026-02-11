import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { calculateLevel, getAvatarStage } from '../utils/helpers';

/**
 * Award XP to user after completing a habit.
 * Recalculates level and avatar stage.
 * Returns { newXP, newLevel, newAvatarStage, leveledUp }
 */
export const awardXP = async (userId, xpAmount) => {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);

  if (!snap.exists()) throw new Error('User not found');

  const data = snap.data();
  const oldLevel = data.level;
  const newXP = data.xp + xpAmount;
  const newLevel = calculateLevel(newXP);
  const newAvatarStage = getAvatarStage(newLevel);
  const leveledUp = newLevel > oldLevel;

  await updateDoc(userRef, {
    xp: newXP,
    level: newLevel,
    avatarStage: newAvatarStage,
  });

  return { newXP, newLevel, newAvatarStage, leveledUp };
};
