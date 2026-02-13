import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import {
  GENDERS,
  HEALTH_GOALS,
  COMMITMENT_LEVELS,
} from '../utils/constants';
import {
  activateHabits,
  seedHabitTemplates,
  getRecommendedHabits,
} from '../services/habitService';

const TOTAL_STEPS = 4;

export default function OnboardingScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState(null);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [commitmentLevel, setCommitmentLevel] = useState(null);
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 4: filter habits by goals + commitment level
  const filteredHabits = useMemo(() => {
    if (selectedGoals.length === 0 || !commitmentLevel) return [];
    return getRecommendedHabits(selectedGoals, commitmentLevel);
  }, [selectedGoals, commitmentLevel]);

  const toggleGoal = (goalId) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goalId)) return prev.filter((g) => g !== goalId);
      if (prev.length >= 2) return prev;
      return [...prev, goalId];
    });
  };

  const toggleHabit = (habit) => {
    setSelectedHabits((prev) => {
      const exists = prev.find((h) => h.id === habit.id);
      if (exists) return prev.filter((h) => h.id !== habit.id);
      if (prev.length >= 4) return prev;
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
      if (selectedGoals.length === 0) {
        setError('Please select at least one goal.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!commitmentLevel) {
        setError('Please select your commitment level.');
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
    if (selectedHabits.length === 0 || selectedHabits.length > 4) {
      setError('Please select 1 to 4 habits.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await seedHabitTemplates();
      await activateHabits(user.uid, selectedHabits);

      await updateDoc(doc(db, 'users', user.uid), {
        gender,
        selectedGoals,
        commitmentLevel,
        // Legacy fields for backward compatibility
        healthGoal: selectedGoals[0] || '',
        selectedInterests: selectedGoals,
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
                <Image
                  source={
                    g === 'male'
                      ? require('../assets/avatars/male_avatar.png')
                      : require('../assets/avatars/female_avatar.png')
                  }
                  style={styles.genderImage}
                />
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

  // ─── Step 2: Goal Selection (max 2) ───
  if (step === 1) {
    return (
      <View style={styles.container}>
        <Text style={styles.stepLabel}>Step 2 of {TOTAL_STEPS}</Text>
        <Text style={styles.title}>What are your goals?</Text>
        <Text style={styles.subtitle}>
          Pick up to 2 areas to focus on ({selectedGoals.length}/2)
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.goalList}>
          {HEALTH_GOALS.map((g) => {
            const active = selectedGoals.includes(g.id);
            return (
              <TouchableOpacity
                key={g.id}
                style={[styles.goalCard, active && styles.goalCardActive]}
                onPress={() => toggleGoal(g.id)}
              >
                <Text style={styles.goalIcon}>{g.icon}</Text>
                <Text style={[styles.goalText, active && styles.goalTextActive]}>
                  {g.label}
                </Text>
                {active && <Text style={styles.goalCheck}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.navRow}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, selectedGoals.length === 0 && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={selectedGoals.length === 0}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Step 3: Commitment Level ───
  if (step === 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.stepLabel}>Step 3 of {TOTAL_STEPS}</Text>
        <Text style={styles.title}>How committed are you?</Text>
        <Text style={styles.subtitle}>Pick your pace — you can always change later</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.commitList}>
          {COMMITMENT_LEVELS.map((level) => {
            const active = commitmentLevel === level.id;
            return (
              <TouchableOpacity
                key={level.id}
                style={[styles.commitCard, active && styles.commitCardActive]}
                onPress={() => setCommitmentLevel(level.id)}
              >
                <View style={styles.commitHeader}>
                  <Text style={[styles.commitLabel, active && styles.commitLabelActive]}>
                    {level.label}
                  </Text>
                  {active && <Text style={styles.commitCheck}>✓</Text>}
                </View>
                <Text style={[styles.commitDesc, active && styles.commitDescActive]}>
                  {level.description}
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
            style={[styles.button, !commitmentLevel && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!commitmentLevel}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ─── Step 4: Habit Selection (max 4) ───
  return (
    <View style={styles.container}>
      <Text style={styles.stepLabel}>Step 4 of {TOTAL_STEPS}</Text>
      <Text style={styles.title}>Choose your habits</Text>
      <Text style={styles.subtitle}>
        Pick up to 4 habits to start with ({selectedHabits.length}/4)
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
              <View style={styles.habitTop}>
                <Text style={[styles.habitTitle, active && styles.habitTitleActive]}>
                  {habit.title}
                </Text>
                {active && <Text style={styles.habitCheck}>✓</Text>}
              </View>
              <View style={styles.habitMeta}>
                <Text style={styles.habitCategory}>{habit.category}</Text>
                <Text style={styles.habitDifficulty}>Difficulty: {habit.difficulty}</Text>
                <Text style={styles.habitXP}>+{habit.xpReward} XP</Text>
              </View>
              {habit.isQuantitative && habit.targetValue && (
                <Text style={styles.habitTarget}>
                  Target: {habit.targetValue} {habit.unit}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
        {filteredHabits.length === 0 && (
          <Text style={styles.emptyText}>
            No habits match your goals and commitment level. Try going back and adjusting.
          </Text>
        )}
      </ScrollView>

      <View style={styles.navRow}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, selectedHabits.length === 0 && styles.buttonDisabled]}
          onPress={handleFinish}
          disabled={loading || selectedHabits.length === 0}
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
    backgroundColor: '#fff8dc',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  stepLabel: {
    color: '#9b1c1c',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Jersey20',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#283618',
    marginBottom: 6,
    fontFamily: 'Jersey20',
  },
  subtitle: {
    fontSize: 15,
    color: '#8c7a5e',
    marginBottom: 24,
    fontFamily: 'Jersey20',
  },
  error: {
    color: '#ff6b6b',
    marginBottom: 12,
    fontSize: 14,
    fontFamily: 'Jersey20',
  },
  emptyText: {
    color: '#8c7a5e',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'Jersey20',
  },

  // Buttons
  button: {
    backgroundColor: '#9b1c1c',
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
    borderColor: '#8c9b6b',
  },
  backText: {
    color: '#8c7a5e',
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
    backgroundColor: '#fff8ec',
    borderRadius: 16,
    paddingVertical: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8c9b6b',
  },
  genderCardActive: {
    borderColor: '#9b1c1c',
    backgroundColor: '#fff0d4',
  },
  genderImage: {
    width: 64,
    height: 64,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  genderLabel: {
    color: '#8c7a5e',
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Jersey20',
  },
  genderLabelActive: {
    color: '#283618',
  },

  // Goal cards
  goalList: {
    gap: 10,
  },
  goalCard: {
    backgroundColor: '#fff8ec',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#8c9b6b',
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalCardActive: {
    borderColor: '#9b1c1c',
    backgroundColor: '#fff0d4',
  },
  goalIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  goalText: {
    color: '#8c7a5e',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    fontFamily: 'Jersey20',
  },
  goalTextActive: {
    color: '#283618',
  },
  goalCheck: {
    color: '#9b1c1c',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // Commitment cards
  commitList: {
    gap: 10,
  },
  commitCard: {
    backgroundColor: '#fff8ec',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#8c9b6b',
  },
  commitCardActive: {
    borderColor: '#9b1c1c',
    backgroundColor: '#fff0d4',
  },
  commitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commitLabel: {
    color: '#8c7a5e',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Jersey20',
  },
  commitLabelActive: {
    color: '#283618',
  },
  commitCheck: {
    color: '#9b1c1c',
    fontSize: 18,
    fontWeight: 'bold',
  },
  commitDesc: {
    color: '#a89880',
    fontSize: 13,
    fontFamily: 'Jersey20',
  },
  commitDescActive: {
    color: '#8c7a5e',
  },

  // Habit cards
  habitList: {
    flex: 1,
    marginTop: 4,
  },
  habitCard: {
    backgroundColor: '#fff8ec',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#8c9b6b',
  },
  habitCardActive: {
    borderColor: '#9b1c1c',
    backgroundColor: '#fff0d4',
  },
  habitTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  habitTitle: {
    color: '#555',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    fontFamily: 'Jersey20',
  },
  habitTitleActive: {
    color: '#283618',
  },
  habitCheck: {
    color: '#9b1c1c',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  habitMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  habitCategory: {
    color: '#8c7a5e',
    fontSize: 12,
    fontFamily: 'Jersey20',
  },
  habitDifficulty: {
    color: '#8c7a5e',
    fontSize: 12,
    fontFamily: 'Jersey20',
  },
  habitXP: {
    color: '#9b1c1c',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Jersey20',
  },
  habitTarget: {
    color: '#8c7a5e',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
    fontFamily: 'Jersey20',
  },
});
