import { db } from '../firebase/config';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { HABIT_TEMPLATES, DEFAULT_USER_PROFILE } from '../utils/constants';

// Weighting for difficulty based on goal alignment
// If habit category matches user goal, it might feel "easier" or "more rewarding" (lower friction)
const GOAL_ALIGNMENT_MULTIPLIER = 0.8;
const NON_ALIGNMENT_MULTIPLIER = 1.0;

/**
 * Calculate the effective difficulty of a habit for a specific user.
 * Adjusts based on the user's primary health goal.
 */
export const calculateEffectiveDifficulty = (habit, userGoal) => {
    const baseScore = habit.difficultyScore || 3; // Default to 3 if missing

    // Normalize strings for comparison
    const category = habit.category ? habit.category.toLowerCase() : '';
    const goal = userGoal ? userGoal.toLowerCase() : '';

    // If the habit matches the goal, reduce effective difficulty (motivation bonus)
    // e.g. A runner finds running easier than a non-runner
    if (category === goal || (category === 'fitness' && goal === 'weight loss')) {
        return Math.max(1, Math.round(baseScore * GOAL_ALIGNMENT_MULTIPLIER));
    }

    return Math.round(baseScore * NON_ALIGNMENT_MULTIPLIER);
};

/**
 * Update user's willpower score based on habit completion or failure.
 * To be called when a habit is completed.
 * 
 * @param {string} userId
 * @param {object} habit - The habit being completed
 * @param {boolean} isSuccess - True if completed, False if missed (cron job/check)
 */
export const updateWillpower = async (userId, habit, isSuccess = true) => {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return null;

    const userData = userSnap.data();
    let currentWillpower = userData.willpower !== undefined ? userData.willpower : DEFAULT_USER_PROFILE.willpower;
    const healthGoal = userData.healthGoal || '';

    const difficulty = calculateEffectiveDifficulty(habit, healthGoal);

    let change = 0;

    if (isSuccess) {
        // Success: Willpower increases. Harder habits give more willpower.
        // Formula: Base (1) + Difficulty * 0.5
        // Easy (2) -> +2
        // Hard (7) -> +4.5
        change = 1 + (difficulty * 0.5);
    } else {
        // Failure: Willpower decreases. Failing a hard habit hurts more (or less? Prompt says: "decreece a lot if he adopt a hard habit and not be consistet")
        // Formula: -(Base (2) + Difficulty * 1.0)
        // Easy (2) -> -4
        // Hard (7) -> -9
        change = -(2 + difficulty);
    }

    let newWillpower = Math.min(100, Math.max(0, currentWillpower + change));

    // Update in Firestore (only if changed significantly to save writes, or just always update)
    if (Math.round(newWillpower) !== Math.round(currentWillpower)) {
        await updateDoc(userRef, { willpower: newWillpower });
    }

    return newWillpower;
};

/**
 * Analyze user state to determine if plan is too easy (Boredom) or too hard (Burnout).
 * Returns a state object.
 */
export const analyzeUserState = (user, userHabits) => {
    const willpower = user.willpower !== undefined ? user.willpower : 50;

    // Thresholds
    const BURNOUT_THRESHOLD = 30; // Low willpower implies struggle
    const BOREDOM_THRESHOLD = 85; // High willpower implies easy coasting

    if (willpower <= BURNOUT_THRESHOLD) {
        return {
            status: 'BURNOUT_RISK',
            message: "It looks like you're struggling to stay consistent. Let's make things a bit easier to build momentum.",
            action: 'EASE_PLAN'
        };
    } else if (willpower >= BOREDOM_THRESHOLD) {
        // Only suggest increasing difficulty if they don't already have very hard habits
        const hasHardHabits = userHabits.some(h => (h.difficultyScore || 0) >= 7);

        if (!hasHardHabits) {
            return {
                status: 'BOREDOM_RISK',
                message: "You're crushing it! Your habits might be too easy for you now. Ready for a challenge?",
                action: 'INTENSIFY_PLAN'
            };
        }
    }

    return { status: 'FLOW', message: '', action: 'MAINTAIN' };
};

/**
 * Generate specific habit suggestions based on the analysis.
 */
export const getSuggestions = (analysis, user, currentHabits) => {
    if (analysis.status === 'FLOW') return null;

    const currentHabitIds = new Set(currentHabits.map(h => h.habitId || h.id));
    const healthGoal = user.healthGoal || '';

    // Filter templates to find candidates
    const candidates = HABIT_TEMPLATES.filter(h => !currentHabitIds.has(h.id));

    let suggestions = [];

    if (analysis.action === 'EASE_PLAN') {
        // Find easier habits in the same categories as current struggling habits
        // Or just generic easy habits
        const easyHabits = candidates.filter(h =>
            calculateEffectiveDifficulty(h, healthGoal) <= 3
        );

        // Suggest replacing a hard habit with an easier one
        const hardUserHabits = currentHabits.filter(h => (h.difficultyScore || 0) >= 5);

        if (hardUserHabits.length > 0 && easyHabits.length > 0) {
            const habitToRemove = hardUserHabits[0];
            const habitToAdd = easyHabits.find(h => h.category === habitToRemove.category) || easyHabits[0];

            suggestions.push({
                type: 'REPLACE',
                remove: habitToRemove,
                add: habitToAdd,
                reason: `Swap "${habitToRemove.title}" for "${habitToAdd.title}" to build consistency.`
            });
        }
    } else if (analysis.action === 'INTENSIFY_PLAN') {
        // Find harder habits
        const hardHabits = candidates.filter(h =>
            calculateEffectiveDifficulty(h, healthGoal) >= 5
        );

        if (hardHabits.length > 0) {
            suggestions.push({
                type: 'ADD',
                add: hardHabits[0],
                reason: `Add "${hardHabits[0].title}" to challenge yourself!`
            });
        }
    }

    return suggestions.length > 0 ? suggestions : null;
};
