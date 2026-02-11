import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { getUserHabits, completeHabit, getTodayCompletions } from '../services/habitService';
import { awardXP } from '../services/gamificationService';
import { updateStreak } from '../services/streakService';
import { getTodayString, randomPick } from '../utils/helpers';
import { MOTIVATIONAL_MESSAGES } from '../utils/constants';
import Avatar from '../components/Avatar';
import XPBar from '../components/XPBar';
import StreakBadge from '../components/StreakBadge';
import HabitCard from '../components/HabitCard';
import CelebrationModal from '../components/CelebrationModal';
import XPPopup from '../components/XPPopup';

export default function DashboardScreen({ navigation }) {
  const { user, logOut } = useAuth();
  const { profile } = useUser();
  const [habits, setHabits] = useState([]);
  const [todayCompletions, setTodayCompletions] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [motivation, setMotivation] = useState('');

  // Celebration / XP popup state
  const [showCelebration, setShowCelebration] = useState(false);
  const [newLevel, setNewLevel] = useState(null);
  const [xpPopup, setXpPopup] = useState(null); // { amount, visible }

  const loadHabits = useCallback(async () => {
    if (!user) return;
    try {
      const [userHabits, completedMap] = await Promise.all([
        getUserHabits(user.uid),
        getTodayCompletions(user.uid),
      ]);
      setHabits(userHabits);
      setTodayCompletions(completedMap);
    } catch (err) {
      console.error('Failed to load habits:', err);
    }
  }, [user]);

  useEffect(() => {
    loadHabits();
    setMotivation(randomPick(MOTIVATIONAL_MESSAGES));
  }, [loadHabits]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHabits();
    setMotivation(randomPick(MOTIVATIONAL_MESSAGES));
    setRefreshing(false);
  };

  const handleComplete = async (habit) => {
    try {
      // 1. Record the completion
      await completeHabit(user.uid, habit.habitId, habit.xpReward);

      // 2. Award XP and check for level-up
      const result = await awardXP(user.uid, habit.xpReward);

      // 3. Update streak
      await updateStreak(user.uid);

      // 4. Mark as completed today (local state)
      setTodayCompletions((prev) => ({ ...prev, [habit.habitId]: true }));

      // 5. Show XP popup
      setXpPopup({ amount: habit.xpReward, visible: true });
      setTimeout(() => setXpPopup(null), 2000);

      // 6. Show celebration if leveled up
      if (result.leveledUp) {
        setNewLevel(result.newLevel);
        setShowCelebration(true);
      }

      // 7. Refresh motivation message
      setMotivation(randomPick(MOTIVATIONAL_MESSAGES));
    } catch (err) {
      console.error('Completion error:', err);
    }
  };

  const allDone = habits.length > 0 && habits.every((h) => todayCompletions[h.habitId]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#e94560"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {profile?.name || 'Adventurer'}!
            </Text>
            <Text style={styles.level}>Level {profile?.level || 1}</Text>
          </View>
          <StreakBadge streak={profile?.streak || 0} />
        </View>

        {/* Avatar + XP */}
        <Avatar stage={profile?.avatarStage || 1} />
        <XPBar xp={profile?.xp || 0} />

        {/* Motivational message */}
        <Text style={styles.motivation}>{motivation}</Text>

        {/* Active Habits */}
        <Text style={styles.sectionTitle}>Today's Habits</Text>
        {habits.map((habit) => (
          <HabitCard
            key={habit.id}
            habit={habit}
            completedToday={!!todayCompletions[habit.habitId]}
            onComplete={handleComplete}
          />
        ))}

        {allDone && (
          <Text style={styles.allDone}>
            All habits done for today — amazing work!
          </Text>
        )}

        {/* History button */}
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => navigation.navigate('Progress')}
        >
          <Text style={styles.historyBtnText}>View Progress</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logOut}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* XP Popup overlay */}
      {xpPopup?.visible && <XPPopup amount={xpPopup.amount} />}

      {/* Level-up celebration modal */}
      <CelebrationModal
        visible={showCelebration}
        level={newLevel}
        onClose={() => setShowCelebration(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scroll: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#eaeaea',
  },
  level: {
    fontSize: 14,
    color: '#e94560',
    fontWeight: '600',
    marginTop: 2,
  },
  motivation: {
    color: '#aaa',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#eaeaea',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  allDone: {
    color: '#2ecc71',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  historyBtn: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  historyBtnText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutBtn: {
    marginTop: 12,
    padding: 14,
    alignItems: 'center',
  },
  logoutText: {
    color: '#666',
    fontSize: 14,
  },
});
