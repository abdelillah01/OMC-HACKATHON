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
import { getTodayCheck, submitCheck } from '../services/dailyCheckService';
import { randomPick } from '../utils/helpers';
import { MOTIVATIONAL_MESSAGES, DAILY_CHECKS } from '../utils/constants';
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

  // Celebration / XP popup state
  const [showCelebration, setShowCelebration] = useState(false);
  const [newLevel, setNewLevel] = useState(null);
  const [xpPopup, setXpPopup] = useState(null);

  // Daily checks state
  const [dailyCheckData, setDailyCheckData] = useState(null);
  const [selectedCheck, setSelectedCheck] = useState(null);

  // Tasks modal state
  const [showTasksModal, setShowTasksModal] = useState(false);

  // Open tasks modal when navigated from drawer "Today's Plan"
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
    // Load daily checks separately so a failure here doesn't break the screen
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

  // Daily check handlers
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

  // Tasks modal XP handler
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
          <TouchableOpacity
            activeOpacity={0.6}
            style={styles.hamburger}
            onPress={() => navigation.getParent()?.openDrawer()}
          >
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
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

        {/* Weekly XP Chart */}
        <WeeklyXPChart userId={user?.uid} />

        {/* Motivational message */}
        <Text style={styles.motivation}>{motivation}</Text>

        {/* Daily Check Section */}
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
        </View>

        {/* Today's Tasks button */}
        <TouchableOpacity
          activeOpacity={0.6}
          style={styles.tasksBtn}
          onPress={() => setShowTasksModal(true)}
        >
          <Text style={styles.tasksBtnIcon}>📝</Text>
          <View>
            <Text style={styles.tasksBtnTitle}>Today's Tasks</Text>
            <Text style={styles.tasksBtnSub}>Manage your personal to-do list</Text>
          </View>
        </TouchableOpacity>

        {/* Active Habits */}
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

        {/* History button */}
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => navigation.navigate('Progress')}
        >
          <Text style={styles.historyBtnText}>View Progress</Text>
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

      {/* Daily Check modal */}
      <DailyCheckModal
        visible={!!selectedCheck}
        check={selectedCheck}
        onSubmit={handleCheckSubmit}
        onClose={handleCheckClose}
      />

      {/* Tasks modal */}
      <TasksModal
        visible={showTasksModal}
        userId={user?.uid}
        onXP={handleTaskXP}
        onClose={() => setShowTasksModal(false)}
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
    alignItems: 'center',
    marginBottom: 20,
  },
  hamburger: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  hamburgerLine: {
    width: 22,
    height: 2.5,
    backgroundColor: '#eaeaea',
    borderRadius: 2,
    marginVertical: 2.5,
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
  checkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tasksBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  tasksBtnIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  tasksBtnTitle: {
    color: '#eaeaea',
    fontSize: 16,
    fontWeight: '700',
  },
  tasksBtnSub: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
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
});
