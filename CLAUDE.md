# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**PEXILIS** — a gamified health habit tracker mobile app for Gen Z, built for a judged hackathon. Full requirements are in `prompt.md`.

## Tech Stack

- React Native 0.81 with Expo 54 (managed workflow)
- Firebase 12.9 (Auth with email/password, Firestore for data)
- React Navigation 7 (native-stack + bottom-tabs)
- Context API for state management
- react-native-reanimated for animations

## Commands

All commands run from `frontend/`:

```bash
npx expo start              # Start dev server (QR code for Expo Go)
npx expo start --clear      # Start with cleared Metro cache
npx expo start --android    # Launch on Android emulator
npx expo start --ios        # Launch on iOS simulator
npx expo install --fix      # Fix dependency version mismatches
npx expo export --platform android  # Verify build compiles
```

No test suite or linter is configured.

## Architecture

Three-layer separation inside `frontend/src/`:

**Data Layer** (`firebase/config.js`) — Firebase init with `initializeAuth` + AsyncStorage persistence. Exports `auth` and `db`.

**State Layer** (`context/`) — Two providers wrapping the app in `App.js`:
- `AuthProvider` — listens to `onAuthStateChanged`, exposes `user`, `signUp`, `logIn`, `logOut`
- `UserProvider` — real-time `onSnapshot` on the user's Firestore doc, exposes `profile`

**Service Layer** (`services/`) — All Firestore writes go through services, never called directly from screens:
- `authService` — signup (creates user doc with defaults), login, logout
- `habitService` — seed templates, recommend habits, activate, complete, query completions
- `gamificationService` — `awardXP()` updates xp/level/avatarStage, returns `{ leveledUp }`
- `streakService` — `updateStreak()` with yesterday/today/gap logic

**UI Layer** (`screens/` + `components/`) — Screens consume services and context. Components are stateless UI (Avatar, XPBar, StreakBadge, HabitCard, CelebrationModal, XPPopup).

**Navigation** (`AppNavigator.js`) — Conditional rendering based on auth + onboarding state:
1. No user → Auth stack (Login/Signup)
2. User but `!onboardingComplete` → Onboarding stack
3. Onboarded → Bottom tabs (Dashboard/Progress)

## Key Flows

**Habit Completion** (DashboardScreen.handleComplete): `completeHabit()` → `awardXP()` → `updateStreak()` → XP popup animation → celebration modal if leveled up. UserContext auto-updates via onSnapshot.

**Onboarding** (3 steps): health goal → select interests → pick 3 easy habits → seeds Firestore templates + activates habits + sets `onboardingComplete: true`.

## Firestore Schema

- `users/{uid}` — name, email, healthGoal, selectedInterests[], xp, level, streak, lastCompletionDate, avatarStage, onboardingComplete
- `habits/{habitId}` — predefined templates (seeded from `constants.js`)
- `userHabits/{docId}` — userId, habitId, title, category, xpReward
- `habitCompletions/{docId}` — userId, habitId, xpAwarded, completedAt

## Formulas

- Level: `floor(xp / 100) + 1`
- Avatar stage: levels 1-2 = Villager, 3-4 = Equipped Villager, 5-6 = Warrior, 7+ = Knight
- Streak: increment if lastCompletionDate was yesterday, reset to 1 if gap > 1 day, skip if already completed today

## Style Conventions

- Dark theme: background `#1a1a2e`, cards `#16213e`, borders `#0f3460`, accent `#e94560`
- `StyleSheet.create()` co-located in each file
- PascalCase components, camelCase functions, UPPER_CASE constants
- All async operations use try/catch with loading states

## Known Constraints

- `newArchEnabled` and `edgeToEdgeEnabled` must be `false` in `app.json` (crashes Expo Go on Android)
- Firebase auth uses `initializeAuth` with `getReactNativePersistence(AsyncStorage)`, not `getAuth()` (breaks on React Native)
- `react-native-reanimated/plugin` must be last in babel plugins
- Run `npx expo install --fix` after adding dependencies to keep versions compatible
