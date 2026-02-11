import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { INTEREST_CATEGORIES } from '../utils/constants';
import {
  getRecommendedHabits,
  activateHabits,
  seedHabitTemplates,
} from '../services/habitService';

const STEPS = { GOAL: 0, INTERESTS: 1, HABITS: 2 };

export default function OnboardingScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState(STEPS.GOAL);
  const [healthGoal, setHealthGoal] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Compute recommended habits based on selected interests
  const recommendedHabits = useMemo(
    () => getRecommendedHabits(selectedInterests),
    [selectedInterests]
  );

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleHabit = (habit) => {
    setSelectedHabits((prev) => {
      const exists = prev.find((h) => h.id === habit.id);
      if (exists) return prev.filter((h) => h.id !== habit.id);
      if (prev.length >= 3) return prev; // Max 3
      return [...prev, habit];
    });
  };

  const handleNext = () => {
    setError('');
    if (step === STEPS.GOAL) {
      if (!healthGoal.trim()) {
        setError('Please enter your health goal.');
        return;
      }
      setStep(STEPS.INTERESTS);
    } else if (step === STEPS.INTERESTS) {
      if (selectedInterests.length === 0) {
        setError('Please select at least one interest.');
        return;
      }
      setSelectedHabits([]); // Reset habit selection when interests change
      setStep(STEPS.HABITS);
    }
  };

  const handleBack = () => {
    setError('');
    if (step === STEPS.INTERESTS) setStep(STEPS.GOAL);
    else if (step === STEPS.HABITS) setStep(STEPS.INTERESTS);
  };

  const handleFinish = async () => {
    if (selectedHabits.length !== 3) {
      setError('Please select exactly 3 habits.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Seed habit templates if needed
      await seedHabitTemplates();

      // Activate selected habits for user
      await activateHabits(user.uid, selectedHabits);

      // Update user profile
      await updateDoc(doc(db, 'users', user.uid), {
        healthGoal: healthGoal.trim(),
        selectedInterests,
        onboardingComplete: true,
      });
      // Navigation updates automatically via UserContext onSnapshot
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 1: Health Goal ───
  if (step === STEPS.GOAL) {
    return (
      <View style={styles.container}>
        <Text style={styles.stepLabel}>Step 1 of 3</Text>
        <Text style={styles.title}>What's your health goal?</Text>
        <Text style={styles.subtitle}>
          This helps us personalize your journey
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="e.g. Stay hydrated, sleep better, eat healthier..."
          placeholderTextColor="#666"
          value={healthGoal}
          onChangeText={setHealthGoal}
          multiline
        />

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Step 2: Interest Selection ───
  if (step === STEPS.INTERESTS) {
    return (
      <View style={styles.container}>
        <Text style={styles.stepLabel}>Step 2 of 3</Text>
        <Text style={styles.title}>Pick your interests</Text>
        <Text style={styles.subtitle}>
          Select the areas you want to focus on
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.chipContainer}>
          {INTEREST_CATEGORIES.map((interest) => {
            const active = selectedInterests.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {interest.charAt(0).toUpperCase() + interest.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Step 3: Habit Selection ───
  return (
    <View style={styles.container}>
      <Text style={styles.stepLabel}>Step 3 of 3</Text>
      <Text style={styles.title}>Choose 3 habits</Text>
      <Text style={styles.subtitle}>
        Pick the habits you want to start with ({selectedHabits.length}/3)
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <ScrollView style={styles.habitList} showsVerticalScrollIndicator={false}>
        {recommendedHabits.map((habit) => {
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
                  {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#eaeaea',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#16213e',
    color: '#eaeaea',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 12,
    fontSize: 14,
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
  },
  chipTextActive: {
    color: '#fff',
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
  },
  habitXP: {
    color: '#e94560',
    fontSize: 13,
    fontWeight: '600',
  },
});
