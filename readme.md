# PEXILIS

A gamified health habit tracker mobile app built for Gen Z. Turn healthy habits into an RPG-style adventure with XP, levels, avatar evolution, and an adaptive AI that keeps your plan in sync with your abilities.

## What It Does

- **Personalized onboarding** — Pick your health goals, commitment level, and starting habits
- **Daily habit tracking** — Complete habits to earn XP, level up, and evolve your character avatar through 7 stages
- **Daily health checks** — Quick yes/no questions (water, sleep, movement, medicine, stretching, mental state) that award bonus XP
- **Streak system** — Consecutive-day tracking to build consistency
- **Adaptive AI (Willpower Engine)** — A hidden willpower score monitors your 5-day completion patterns and suggests plan adjustments when your habits are too easy or too hard
- **Habit management** — Add or remove from 50+ habit templates at any time
- **To-do list** — Daily task manager with XP rewards
- **Nearby hospitals** — Map integration for locating healthcare facilities
- **Friends system** — Social features for

```bash
cd frontend
npm install
npx expo start
```

Scan the QR code with **Expo Go** (phone must be on the same Wi-Fi network).

## How the AI Works

The Willpower Engine runs after every habit completion and evaluates whether the user's plan matches their actual ability:

1. **Plan Difficulty** is calculated as the weighted average difficulty of active habits (quantitative habits like "Run 5km" are weighted 1.3x higher than simple check-off habits)
2. **Willpower Score** (hidden from user) is computed from:
   - 25% commitment level base (set during onboarding)
   - 75% performance score over the last 5 days (completion rate, consistency, difficulty of completed habits)
3. **Double threshold** triggers a suggestion popup:
   - Willpower exceeds plan difficulty by 20+ points AND completion rate >= 75% → suggest harder habits
   - Willpower falls below plan difficulty by 20+ points AND completion rate <= 40% → suggest easier habits
4. The popup proposes specific habit swaps (same category, adjusted difficulty) that the user can accept or dismiss
5. Dismissing sets a 3-day cooldown before the next suggestion

## Project Structure

```
frontend/src/
├── firebase/config.js          # Firebase initialization
├── context/                    # AuthProvider + Use accountability

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.81 + Expo 54 (managed) |
| Backend | Firebase 12.9 (Auth + Firestore) |
| Navigation | React Navigation 7 (native-stack + bottom-tabs) |
| State | React Context API |
| Animations | react-native-reanimated |

## Getting StartedrProvider
├── services/
│   ├── authService.js          # Signup, login, logout
│   ├── habitService.js         # Habit CRUD, completions, history
│   ├── gamificationService.js  # XP, levels, avatar stages
│   ├── streakService.js        # Consecutive-day streak logic
│   ├── dailyCheckService.js    # Daily health checks + XP
│   └── willpowerService.js     # Adaptive AI engine
├── screens/                    # Dashboard, Progress, Onboarding, Login, etc.
├── components/                 # Avatar, XPBar, HabitCard, modals, etc.
├── navigation/AppNavigator.js  # Auth → Onboarding → Main tabs
└── utils/
    ├── constants.js            # 50 habit templates, avatar stages, daily checks
    └── helpers.js              # Level formulas, date utilities
```

## Gamification

| Mechanic | Formula |
|---|---|
| Level | `floor(xp / 100) + 1` |
| Avatar | 7 evolution stages across levels 1-19+ |
| Streak | +1 per consecutive day, resets after a gap |
| Habit XP | `10 + round(difficulty * 0.4)` per completion |

## Team

Built for a hackathon.
