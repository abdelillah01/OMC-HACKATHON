# PEXILIS Frontend Documentation

## Quick Start

```bash
cd frontend
npm install
npx expo start
```

Scan the QR code with **Expo Go** (phone must be on same Wi-Fi as your PC).

## Folder Structure

```
frontend/
├── App.js                      # Entry point — wraps app with AuthProvider + UserProvider
├── app.json                    # Expo config (app name, icons, splash)
├── babel.config.js             # Babel + reanimated plugin
├── package.json                # Dependencies & scripts
│
└── src/
    ├── firebase/
    │   └── config.js           # Firebase init, exports `auth` and `db`
    │
    ├── context/                # Global state (React Context)
    │   ├── AuthContext.js      # Tracks logged-in user, provides signUp/logIn/logOut
    │   └── UserContext.js      # Real-time listener on user's Firestore profile
    │
    ├── services/               # Business logic — all Firestore reads/writes go here
    │   ├── authService.js      # signup, login, logout (Firebase Auth + Firestore)
    │   ├── habitService.js     # habit CRUD, completions, today's completions
    │   ├── gamificationService.js  # XP awarding, level + avatar calculation
    │   └── streakService.js    # Daily streak logic (increment/reset)
    │
    ├── screens/                # Full-page views
    │   ├── LoginScreen.js      # Email/password login
    │   ├── SignupScreen.js     # Registration (name + email + password)
    │   ├── OnboardingScreen.js # 3-step: goal → interests → pick 3 habits
    │   ├── DashboardScreen.js  # Main screen: avatar, XP, streak, habits, complete flow
    │   └── ProgressScreen.js   # Stats cards + completion history list
    │
    ├── components/             # Reusable UI pieces (receive data via props)
    │   ├── Avatar.js           # Shows avatar image for current stage (1-4)
    │   ├── XPBar.js            # Progress bar showing XP toward next level
    │   ├── StreakBadge.js      # Fire emoji + streak count pill
    │   ├── HabitCard.js        # Habit row with "Complete" button
    │   ├── CelebrationModal.js # Level-up popup
    │   └── XPPopup.js          # Animated "+20 XP" floating text
    │
    ├── navigation/
    │   └── AppNavigator.js     # Routes: Auth stack → Onboarding → Main tabs
    │
    ├── utils/
    │   ├── constants.js        # Avatar stages, 15 habit templates, interest categories, messages
    │   └── helpers.js          # Level formula, XP progress, date checks, random pick
    │
    └── assets/
        └── avatars/            # Placeholder PNGs for 4 avatar stages
            ├── villager.png
            ├── equipped-villager.png
            ├── warrior.png
            └── knight.png
```

## How the App Flows

```
User opens app
    │
    ├── Not logged in ──→ LoginScreen / SignupScreen
    │
    ├── Logged in, not onboarded ──→ OnboardingScreen (3 steps)
    │
    └── Logged in + onboarded ──→ Bottom tabs
                                    ├── Dashboard (Home tab)
                                    └── Progress (Progress tab)
```

Navigation switches automatically — when a user signs up, onSnapshot detects the new profile and navigates to onboarding. When onboarding completes and sets `onboardingComplete: true`, the navigator switches to Dashboard.

## How Habit Completion Works

When a user taps "Complete" on a habit card in the Dashboard:

1. **Record** → `habitService.completeHabit()` writes to `habitCompletions` collection
2. **XP** → `gamificationService.awardXP()` adds XP, recalculates level and avatar stage
3. **Streak** → `streakService.updateStreak()` increments streak if consecutive day
4. **UI feedback** → animated XP popup appears, habit card turns green
5. **Level-up** → if level increased, a celebration modal appears
6. **Profile syncs** → UserContext's onSnapshot picks up Firestore changes automatically

## Firestore Collections

| Collection | Purpose | Key Fields |
|---|---|---|
| `users/{uid}` | User profile & gamification state | name, email, xp, level, streak, avatarStage, onboardingComplete |
| `habits/{id}` | Predefined habit templates (seeded once) | title, category, difficulty, xpReward |
| `userHabits/{doc}` | User's 3 active habits | userId, habitId, title, category, xpReward |
| `habitCompletions/{doc}` | Every habit completion | userId, habitId, xpAwarded, completedAt |

## Gamification Rules

| Mechanic | Formula |
|---|---|
| **Level** | `floor(xp / 100) + 1` |
| **Avatar** | Levels 1-2 = Villager, 3-4 = Equipped Villager, 5-6 = Warrior, 7+ = Knight |
| **Streak** | +1 if last completion was yesterday, reset to 1 if gap > 1 day, no change if already completed today |

## Color Palette

| Color | Hex | Usage |
|---|---|---|
| Dark background | `#1a1a2e` | Screen backgrounds |
| Card background | `#16213e` | Cards, inputs, tab bar |
| Border | `#0f3460` | Card borders, input borders |
| Accent (red/coral) | `#e94560` | Buttons, titles, active tabs |
| Text primary | `#eaeaea` | Headings, habit titles |
| Text secondary | `#aaa` | Subtitles, labels |
| Success green | `#2ecc71` | Completed habits |
| Gold | `#f39c12` | XP popup, streak count |

## Important Notes

- **Never use `getAuth()`** — use `initializeAuth` with AsyncStorage persistence (see `firebase/config.js`). `getAuth()` crashes on React Native.
- **`newArchEnabled` and `edgeToEdgeEnabled` must be `false`** in `app.json` — they crash Expo Go on Android.
- **Run `npx expo install --fix`** after adding any new dependency to keep versions compatible with Expo 54.
- **Firestore composite indexes** are required for queries combining `where` + `orderBy`. If you see an index error, click the link in the error to auto-create it in Firebase Console.
- **No punishment messaging** — the app design is always positive and encouraging. No guilt, pressure, or negative streaks.
