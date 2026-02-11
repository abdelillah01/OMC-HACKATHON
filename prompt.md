PROJECT CONTEXT

I am building a hackathon project called PEXILIS, a gamified health habit tracker for Gen Z young adults.
The goal is to build a React Native mobile app using Firebase as backend.

The app must demonstrate:

Functional task tracking

Real-time gamification

A complete motivation loop (Action → Feedback → Motivation → Repeat)

Persistent data across sessions

Clean architecture separation

This is for a judged hackathon, so the implementation must be clean, stable, and complete.

🧱 TECH STACK

React Native (Expo preferred)

Firebase:

Firebase Authentication (email/password)

Firestore (database)

Firebase Storage (if needed for avatars)

Context API or Zustand for state management

React Navigation

🏗️ ARCHITECTURE REQUIREMENTS

Use clean separation:

UI Layer (screens + components)

Business Logic Layer (services: gamification, streak logic, XP logic)

Data Layer (Firebase services)

Organize folders like:

/src
 /components
 /screens
 /navigation
 /services
 /context
 /utils
 /firebase

🎯 CORE FEATURES TO IMPLEMENT
1️⃣ User System

Email/password signup & login

On first signup:

Ask for health goal

Ask user to select interests (nutrition, hydration, sleep, fitness, mental health)

Store user profile in Firestore:

name

email

healthGoal

selectedInterests

xp (default 0)

level (default 1)

streak (default 0)

lastCompletionDate

avatarStage (default 1)

2️⃣ Habit System

Create predefined habit templates in Firestore:

Each habit:

id

title

category (interest)

difficulty ("easy" | "intermediate")

xpReward

After onboarding:

Recommend EASY habits based on selected interests

User activates 3 habits

User can:

View active habits

Mark habit as complete

View completion history

Create Firestore collection:

userHabits

habitCompletions

All completions must persist.

🎮 GAMIFICATION MECHANICS (Minimum 3 Required)

Implement these 3 mechanics:

🥇 1. XP + Level System

Rules:

Completing habit gives xpReward

Level formula:
level = floor(xp / 100) + 1

When level increases:

Show celebration modal

Upgrade avatar stage

Persist XP + level in Firestore.

🔥 2. Daily Streak System (Consistency Reward)

Rules:

If user completes at least 1 habit per day → streak++

If lastCompletionDate was yesterday → increment

If more than 1 day gap → reset streak to 1

No negative messaging allowed

Persist:

streak

lastCompletionDate

Display streak visually on dashboard.

🧙 3. Avatar Evolution System

Avatar stages:
1 = Villager
2 = Equipped Villager
3 = Warrior
4 = Knight

Upgrade avatar when:

Level increases

Avatar must:

Visually change on dashboard

Persist between sessions

🔁 MOTIVATION LOOP IMPLEMENTATION

When user completes habit:

Action:
User taps "Complete"

Immediate Feedback:

Animated XP popup

Streak update animation

Progress bar fills

Motivation:

Encouraging message

Show progress to next level

Avatar glow effect

Repeat:

Suggest next habit

This flow must be clearly implemented.

📊 DASHBOARD REQUIREMENTS

Dashboard must display:

Avatar image

Current level

XP progress bar

Streak counter

Active habits

Motivational message

Button to view history

📈 PROGRESS SCREEN

Show:

Total completions

Current streak

Level

XP

Simple activity list (history)

💾 DATA PERSISTENCE

All user data must persist across:

App restart

Logout/login

Device reload

Use Firestore properly with async/await.

🛡️ SECURITY

Use Firebase Auth

Protect user data with userId filtering

Do not allow reading other users’ data

Validate habit completion on backend logic (in service layer)

🎨 DESIGN PRINCIPLES

The app must:

Feel positive and encouraging

Avoid pressure or guilt messaging

Reward consistency over quantity

Be minimal and clean

Focus on small wins

No punishment mechanics allowed.

📦 DELIVERABLE EXPECTATION

Generate:

Complete folder structure

Navigation setup

Firebase configuration template

Example Firestore structure

Core services:

gamificationService.js

streakService.js

habitService.js

Basic UI screens implemented

Example avatar images placeholders

Clean, readable, well-commented code

Make sure the app:

Runs without errors

Core flows are testable

Gamification updates in real-time

Don’t generate everything at once.
First, analyze the requirements and propose:

Folder structure

Firestore schema

Architecture breakdown

Development roadmap