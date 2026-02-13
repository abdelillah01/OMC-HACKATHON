import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { getUserHabits, completeHabit, getTodayCompletions } from '../services/habitService';
import { awardXP } from '../services/gamificationService';
import { updateStreak } from '../services/streakService';
import { getTodayCheck, submitCheck } from '../services/dailyCheckService';
import { randomPick } from '../utils/helpers';
import { MOTIVATIONAL_MESSAGES, DAILY_CHECKS } from '../utils/constants';
import MainLayout from '../components/MainLayout';
import Avatar from '../components/Avatar';
import XPBar from '../components/XPBar';
import StreakBadge from '../components/StreakBadge';
import HabitCard from '../components/HabitCard';
import CelebrationModal from '../components/CelebrationModal';
import XPPopup from '../components/XPPopup';
import WeeklyXPChart from '../components/WeeklyXPChart';
import DailyCheckCard from '../components/DailyCheckCard';
import DailyCheckModal from '../components/DailyCheckModal';
import TasksModal from '../components/TasksModal';

export default function DashboardScreen({ navigation, route }) {
  const { user } = useAuth();
  const { profile } = useUser();
  const [habits, setHabits] = useState([]);
  const [todayCompletions, setTodayCompletions] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [motivation, setMotivation] = useState('');

  const [showCelebration, setShowCelebration] = useState(false);
  const [newLevel, setNewLevel] = useState(null);
  const [xpPopup, setXpPopup] = useState(null);

  const [dailyCheckData, setDailyCheckData] = useState(null);
  const [selectedCheck, setSelectedCheck] = useState(null);

  const [showTasksModal, setShowTasksModal] = useState(false);

  useEffect(() => {
    if (route.params?.openTasks) {
      setShowTasksModal(true);
      navigation.setParams({ openTasks: false });
    }
  }, [route.params?.openTasks]);

  const loadData = useCallback(async () => {
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
    try {
      const checkData = await getTodayCheck(user.uid);
      setDailyCheckData(checkData);
    } catch (err) {
      console.error('Failed to load daily checks:', err);
      setDailyCheckData(null);
    }
  }, [user]);

  useEffect(() => {
    loadData();
    setMotivation(randomPick(MOTIVATIONAL_MESSAGES));
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setMotivation(randomPick(MOTIVATIONAL_MESSAGES));
    setRefreshing(false);
  };

  const handleComplete = async (habit) => {
    try {
      await completeHabit(user.uid, habit.habitId, habit.xpReward);
      const result = await awardXP(user.uid, habit.xpReward);
      await updateStreak(user.uid);

      setTodayCompletions((prev) => ({ ...prev, [habit.habitId]: true }));

      setXpPopup({ amount: habit.xpReward, visible: true });
      setTimeout(() => setXpPopup(null), 2000);

      if (result.leveledUp) {
        setNewLevel(result.newLevel);
        setShowCelebration(true);
      }

      setMotivation(randomPick(MOTIVATIONAL_MESSAGES));
    } catch (err) {
      console.error('Completion error:', err);
    }
  };

  const handleCheckSubmit = async (type, value) => {
    return await submitCheck(type, value, user.uid);
  };

  const handleCheckClose = (result) => {
    setSelectedCheck(null);
    if (!result) return;

    setDailyCheckData((prev) => ({
      ...prev,
      [result.type || selectedCheck?.key]: result.xpAwarded !== undefined,
    }));

    if (result.xpAwarded > 0) {
      setXpPopup({ amount: result.xpAwarded, visible: true });
      setTimeout(() => setXpPopup(null), 2000);
    }

    if (result.leveledUp) {
      setNewLevel(result.newLevel);
      setShowCelebration(true);
    }

    loadData();
  };

  const handleTaskXP = (result) => {
    if (result.xpAwarded > 0) {
      setXpPopup({ amount: result.xpAwarded, visible: true });
      setTimeout(() => setXpPopup(null), 2000);
    }
    if (result.leveledUp) {
      setNewLevel(result.newLevel);
      setShowCelebration(true);
    }
  };

  const allDone = habits.length > 0 && habits.every((h) => todayCompletions[h.habitId]);

  return (
    <MainLayout
      navigation={navigation}
      title={`Hello, ${profile?.name || 'Adventurer'}!`}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#9b1c1c" />
      }
      showActionGrid={false}
      overlays={<>{xpPopup?.visible && <XPPopup amount={xpPopup.amount} />}</>}
    >
      <View style={styles.streakRow}>
        <Text style={styles.level}>Level {profile?.level || 1}</Text>
        <StreakBadge streak={profile?.streak || 0} />
      </View>

      <Avatar stage={profile?.avatarStage || 1} />
      <XPBar xp={profile?.xp || 0} />

      <WeeklyXPChart userId={user?.uid} />

      <Text style={styles.motivation}>{motivation}</Text>

      <Text style={styles.sectionTitle}>Daily Check</Text>
      <View style={styles.checkGrid}>
        {DAILY_CHECKS.map((check) => (
          <DailyCheckCard
            key={check.key}
            check={check}
            answered={dailyCheckData ? dailyCheckData[check.key] : undefined}
            onPress={() => setSelectedCheck(check)}
          />
        ))}

        <TouchableOpacity
          activeOpacity={0.6}
          style={styles.gridCard}
          onPress={() => setShowTasksModal(true)}
        >
          <Text style={styles.gridCardIcon}>📝</Text>
          <Text style={styles.gridCardLabel}>Today's Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.6}
          style={styles.gridCard}
          onPress={() => navigation.getParent()?.navigate('Hospitals')}
        >
          <Text style={styles.gridCardIcon}>🏥</Text>
          <Text style={styles.gridCardLabel}>Nearby Hospitals</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Today's Habits</Text>
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

      <TouchableOpacity
        style={styles.historyBtn}
        onPress={() => navigation.navigate('Progress')}
      >
        <Text style={styles.historyBtnText}>View Progress</Text>
      </TouchableOpacity>

      <CelebrationModal
        visible={showCelebration}
        level={newLevel}
        onClose={() => setShowCelebration(false)}
      />

      <DailyCheckModal
        visible={!!selectedCheck}
        check={selectedCheck}
        onSubmit={handleCheckSubmit}
        onClose={handleCheckClose}
      />

      <TasksModal
        visible={showTasksModal}
        userId={user?.uid}
        onXP={handleTaskXP}
        onClose={() => setShowTasksModal(false)}
      />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  level: {
    fontSize: 14,
    color: '#9b1c1c',
    fontWeight: '600',
    fontFamily: 'Jersey20',
  },
  motivation: {
    color: '#8c7a5e',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Jersey20',
  },
  sectionTitle: {
    color: '#283618',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: 'Jersey20',
  },
  checkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#fff8ec',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#8c9b6b',
    minHeight: 90,
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridCardIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  gridCardLabel: {
    color: '#283618',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Jersey20',
  },
  allDone: {
    color: '#2ecc71',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
    fontFamily: 'Jersey20',
  },
  historyBtn: {
    backgroundColor: '#fff8ec',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: '#8c9b6b',
  },
  historyBtnText: {
    color: '#9b1c1c',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Jersey20',
  },
});
