import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import {
  GENDERS,
  GOALS,
  INTEREST_CATEGORIES,
  HABIT_TEMPLATES,
} from '../utils/constants';
import {
  activateHabits,
  seedHabitTemplates,
} from '../services/habitService';

const TOTAL_STEPS = 4;

export default function OnboardingScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState(null);
  const [goal, setGoal] = useState(null);
  const [interests, setInterests] = useState([]);
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 4: filter habits by selected goal, fallback to all if no match
  const filteredHabits = useMemo(() => {
    const matched = HABIT_TEMPLATES.filter((h) => h.category === goal);
    return matched.length > 0 ? matched : HABIT_TEMPLATES;
  }, [goal]);

  const toggleInterest = (interest) => {
    setInterests((prev) => {
      if (prev.includes(interest)) return prev.filter((i) => i !== interest);
      if (prev.length >= 3) return prev; // Max 3
      return [...prev, interest];
    });
  };

  const toggleHabit = (habit) => {
    setSelectedHabits((prev) => {
      const exists = prev.find((h) => h.id === habit.id);
      if (exists) return prev.filter((h) => h.id !== habit.id);
      if (prev.length >= 3) return prev;
      return [...prev, habit];
    });
  };

  const handleNext = () => {
    setError('');
    if (step === 0) {
      if (!gender) {
        setError('Please select your gender.');
        return;
      }
      setStep(1);
    } else if (step === 1) {
      if (!goal) {
        setError('Please select your main goal.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (interests.length === 0) {
        setError('Please select at least one interest.');
        return;
      }
      setSelectedHabits([]);
      setStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    if (step === 1) setStep(0);
    else if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const handleFinish = async () => {
    if (selectedHabits.length !== 3) {
      setError('Please select exactly 3 habits.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await seedHabitTemplates();
      await activateHabits(user.uid, selectedHabits);

      await updateDoc(doc(db, 'users', user.uid), {
        gender,
        goal,
        interests,
        selectedInterests: interests,
        healthGoal: goal,
        onboardingComplete: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // ─── Step 1: Gender Selection ───
  if (step === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.stepLabel}>Step 1 of {TOTAL_STEPS}</Text>
        <Text style={styles.title}>Who are you?</Text>
        <Text style={styles.subtitle}>Select your gender</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.genderRow}>
          {GENDERS.map((g) => {
            const active = gender === g;
            return (
              <TouchableOpacity
                key={g}
                style={[styles.genderCard, active && styles.genderCardActive]}
                onPress={() => setGender(g)}
              >
                <Text style={styles.genderEmoji}>
                  {g === 'male' ? '🧑' : '👩'}
                </Text>
                <Text style={[styles.genderLabel, active && styles.genderLabelActive]}>
                  {capitalize(g)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.button, styles.soloButton, !gender && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!gender}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Step 2: Goal Selection ───
  if (step === 1) {
    return (
      <View style={styles.container}>
        <Text style={styles.stepLabel}>Step 2 of {TOTAL_STEPS}</Text>
        <Text style={styles.title}>What's your main goal?</Text>
        <Text style={styles.subtitle}>Pick the area you want to focus on most</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.goalList}>
          {GOALS.map((g) => {
            const active = goal === g;
            return (
              <TouchableOpacity
                key={g}
                style={[styles.goalCard, active && styles.goalCardActive]}
                onPress={() => setGoal(g)}
              >
                <Text style={[styles.goalText, active && styles.goalTextActive]}>
                  {capitalize(g)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, !goal && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!goal}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Step 3: Interests Selection (max 3) ───
  if (step === 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.stepLabel}>Step 3 of {TOTAL_STEPS}</Text>
        <Text style={styles.title}>Pick your interests</Text>
        <Text style={styles.subtitle}>
          Select up to 3 areas you care about ({interests.length}/3)
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.chipContainer}>
          {INTEREST_CATEGORIES.map((interest) => {
            const active = interests.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {capitalize(interest)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, interests.length === 0 && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={interests.length === 0}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Step 4: Habit Selection ───
  return (
    <View style={styles.container}>
      <Text style={styles.stepLabel}>Step 4 of {TOTAL_STEPS}</Text>
      <Text style={styles.title}>Choose 3 habits</Text>
      <Text style={styles.subtitle}>
        Pick the habits you want to start with ({selectedHabits.length}/3)
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ScrollView style={styles.habitList} showsVerticalScrollIndicator={false}>
        {filteredHabits.map((habit) => {
          const active = selectedHabits.find((h) => h.id === habit.id);
          return (
            <TouchableOpacity
              key={habit.id}
              style={[styles.habitCard, active && styles.habitCardActive]}
              onPress={() => toggleHabit(habit)}
            >
              <Text style={[styles.habitTitle, active && styles.habitTitleActive]}>
                {habit.title}
              </Text>
              <View style={styles.habitMeta}>
                <Text style={styles.habitCategory}>
                  {capitalize(habit.category)}
                </Text>
                <Text style={styles.habitXP}>+{habit.xpReward} XP</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.navRow}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, selectedHabits.length !== 3 && styles.buttonDisabled]}
          onPress={handleFinish}
          disabled={loading || selectedHabits.length !== 3}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Start Quest</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  stepLabel: {
    color: '#e94560',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Jersey20',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#eaeaea',
    marginBottom: 6,
    fontFamily: 'Jersey20',
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    marginBottom: 24,
    fontFamily: 'Jersey20',
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 12,
    fontSize: 14,
    fontFamily: 'Jersey20',
  },

  // Buttons
  button: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  soloButton: {
    marginLeft: 0,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Jersey20',
  },

  // Navigation row
  navRow: {
    flexDirection: 'row',
    marginTop: 'auto',
    paddingBottom: 40,
    paddingTop: 16,
  },
  backButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  backText: {
    color: '#aaa',
    fontSize: 17,
    fontWeight: '500',
    fontFamily: 'Jersey20',
  },

  // Gender cards
  genderRow: {
    flexDirection: 'row',
    gap: 16,
  },
  genderCard: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  genderCardActive: {
    borderColor: '#e94560',
    backgroundColor: '#1e2a4a',
  },
  genderEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  genderLabel: {
    color: '#aaa',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Jersey20',
  },
  genderLabelActive: {
    color: '#eaeaea',
  },

  // Goal cards
  goalList: {
    gap: 10,
  },
  goalCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#0f3460',
  },
  goalCardActive: {
    borderColor: '#e94560',
    backgroundColor: '#1e2a4a',
  },
  goalText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Jersey20',
  },
  goalTextActive: {
    color: '#eaeaea',
  },

  // Interest chips
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  chipActive: {
    backgroundColor: '#e94560',
    borderColor: '#e94560',
  },
  chipText: {
    color: '#aaa',
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Jersey20',
  },
  chipTextActive: {
    color: '#fff',
  },

  // Habit cards
  habitList: {
    flex: 1,
    marginTop: 4,
  },
  habitCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#0f3460',
  },
  habitCardActive: {
    borderColor: '#e94560',
    backgroundColor: '#1e2a4a',
  },
  habitTitle: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    fontFamily: 'Jersey20',
  },
  habitTitleActive: {
    color: '#eaeaea',
  },
  habitMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  habitCategory: {
    color: '#666',
    fontSize: 13,
    fontFamily: 'Jersey20',
  },
  habitXP: {
    color: '#e94560',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Jersey20',
  },
});
