import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import {
  getUserHabits,
  completeHabit,
  getTodayCompletions,
} from "../services/habitService";
import { awardXP } from "../services/gamificationService";
import { updateStreak } from "../services/streakService";
import { getTodayCheck, submitCheck } from "../services/dailyCheckService";
import { randomPick } from "../utils/helpers";
import { MOTIVATIONAL_MESSAGES, DAILY_CHECKS } from "../utils/constants";
import MainLayout from "../components/MainLayout";
import Avatar from "../components/Avatar";
import XPBar from "../components/XPBar";
import StreakBadge from "../components/StreakBadge";
import HabitCard from "../components/HabitCard";
import CelebrationModal from "../components/CelebrationModal";
import XPPopup from "../components/XPPopup";
import WeeklyXPChart from "../components/WeeklyXPChart";
import DailyCheckCard from "../components/DailyCheckCard";
import DailyCheckModal from "../components/DailyCheckModal";
import TasksModal from "../components/TasksModal";
import HabitManagerModal from "../components/HabitManagerModal";
import PlanSuggestionModal from "../components/PlanSuggestionModal";
import {
  evaluatePlan,
  applySuggestion,
  dismissSuggestion,
} from "../services/willpowerService";

export default function DashboardScreen({ navigation, route }) {
  const { user } = useAuth();
  const { profile } = useUser();
  const [habits, setHabits] = useState([]);
  const [todayCompletions, setTodayCompletions] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [motivation, setMotivation] = useState("");

  const [showCelebration, setShowCelebration] = useState(false);
  const [newLevel, setNewLevel] = useState(null);
  const [xpPopup, setXpPopup] = useState(null);

  const [dailyCheckData, setDailyCheckData] = useState(null);
  const [selectedCheck, setSelectedCheck] = useState(null);

  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showHabitManager, setShowHabitManager] = useState(false);
  const [expandedHabit, setExpandedHabit] = useState(null);

  const [planSuggestion, setPlanSuggestion] = useState(null);
  const [showPlanSuggestion, setShowPlanSuggestion] = useState(false);

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
      console.error("Failed to load habits:", err);
    }
    try {
      const checkData = await getTodayCheck(user.uid);
      setDailyCheckData(checkData);
    } catch (err) {
      console.error("Failed to load daily checks:", err);
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

  const handleComplete = async (habit, completedValue) => {
    try {
      await completeHabit(
        user.uid,
        habit.habitId,
        habit.xpReward,
        completedValue,
      );
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

      // AI willpower evaluation after each completion
      try {
        const suggestion = await evaluatePlan(user.uid);
        if (suggestion) {
          setPlanSuggestion(suggestion);
          setShowPlanSuggestion(true);
        }
      } catch (evalErr) {
        console.log("Willpower eval skipped:", evalErr.message);
      }
    } catch (err) {
      console.error("Completion error:", err);
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

  const allDone =
    habits.length > 0 && habits.every((h) => todayCompletions[h.habitId]);

  return (
    <MainLayout
      navigation={navigation}
      title={`Hello, ${profile?.name || "Adventurer"}!`}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#9b1c1c"
        />
      }
      showActionGrid={false}
      showCharacter={true}
      showEncouragement={false}
      overlays={<>{xpPopup?.visible && <XPPopup amount={xpPopup.amount} />}</>}
    >
      <View style={styles.streakRow}>
        <Text style={styles.level}>Level {profile?.level || 1}</Text>
        <StreakBadge streak={profile?.streak || 0} />
      </View>

      <Avatar stage={profile?.avatarStage || 1} gender={profile?.gender} />
      <XPBar xp={profile?.xp || 0} />

      <WeeklyXPChart userId={user?.uid} />

      <Text style={styles.motivation}>{motivation}</Text>

      <Text style={styles.sectionTitle}>Daily Checks</Text>
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

      <Text style={styles.sectionTitle}>My Habits</Text>
      <View style={styles.checkGrid}>
        {habits.map((habit) => {
          const done = !!todayCompletions[habit.habitId];
          const isExpanded = expandedHabit === habit.id;

          if (isExpanded && !done) {
            return (
              <View key={habit.id} style={styles.expandedCard}>
                <HabitCard
                  habit={habit}
                  completedToday={done}
                  onComplete={async (h, val) => {
                    await handleComplete(h, val);
                    setExpandedHabit(null);
                  }}
                />
                <TouchableOpacity
                  style={styles.collapseBtn}
                  onPress={() => setExpandedHabit(null)}
                >
                  <Text style={styles.collapseBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={habit.id}
              activeOpacity={done ? 1 : 0.6}
              style={[styles.gridCard, done && styles.gridCardDone]}
              onPress={() => {
                if (done) return;
                if (habit.isQuantitative) {
                  setExpandedHabit(habit.id);
                } else {
                  handleComplete(habit, null);
                }
              }}
              disabled={done}
            >
              <Text
                style={[styles.gridCardLabel, done && styles.gridCardLabelDone]}
                numberOfLines={2}
              >
                {habit.title}
              </Text>
              {done && <Text style={styles.gridCardCheck}>✓</Text>}
              {!done && (
                <Text style={styles.gridCardXP}>+{habit.xpReward} XP</Text>
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          activeOpacity={0.6}
          style={styles.addCard}
          onPress={() => setShowHabitManager(true)}
        >
          <Text style={styles.addCardPlus}>+</Text>
          <Text style={styles.gridCardLabel}>Add / Modify</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.checkGrid}>
        <TouchableOpacity
          activeOpacity={0.6}
          style={styles.gridCard}
          onPress={() => setShowTasksModal(true)}
        >
          <Image
            source={require("../assets/avatars/to do list.png")}
            style={styles.gridCardImage}
          />
          <Text style={styles.gridCardLabel}>Today's Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.6}
          style={styles.gridCard}
          onPress={() => navigation.getParent()?.navigate("Hospitals")}
        >
          <Image
            source={require("../assets/avatars/location.png")}
            style={styles.gridCardImage}
          />
          <Text style={styles.gridCardLabel}>Nearby Hospitals</Text>
        </TouchableOpacity>
      </View>

      {allDone && (
        <Text style={styles.allDone}>
          All habits done for today — amazing work!
        </Text>
      )}

      <TouchableOpacity
        style={styles.historyBtn}
        onPress={() => navigation.navigate("Progress")}
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

      <HabitManagerModal
        visible={showHabitManager}
        activeHabits={habits}
        userId={user?.uid}
        onClose={(needsRefresh) => {
          setShowHabitManager(false);
          if (needsRefresh) loadData();
        }}
      />

      <PlanSuggestionModal
        visible={showPlanSuggestion}
        suggestion={planSuggestion}
        onAccept={async () => {
          await applySuggestion(user.uid, planSuggestion);
          setShowPlanSuggestion(false);
          setPlanSuggestion(null);
          loadData();
        }}
        onDismiss={async () => {
          await dismissSuggestion(user.uid);
          setShowPlanSuggestion(false);
          setPlanSuggestion(null);
        }}
      />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  streakRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  level: {
    fontSize: 14,
    color: "#9b1c1c",
    fontWeight: "600",
    fontFamily: "Jersey20",
  },
  motivation: {
    color: "#8c7a5e",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 24,
    fontFamily: "Jersey20",
  },
  sectionTitle: {
    color: "#283618",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    fontFamily: "Jersey20",
  },
  checkGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridCard: {
    width: "48%",
    backgroundColor: "#fff8ec",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#8c9b6b",
    minHeight: 90,
    justifyContent: "center",
    marginBottom: 10,
  },
  gridCardDone: {
    borderColor: "#2ecc71",
    backgroundColor: "#e8f5e9",
  },
  gridCardIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  gridCardInitial: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#9b1c1c",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  gridCardInitialText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    fontFamily: "Jersey20",
  },
  gridCardImage: {
    width: 36,
    height: 36,
    marginBottom: 6,
    resizeMode: "contain",
  },
  gridCardLabel: {
    color: "#283618",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "Jersey20",
  },
  gridCardLabelDone: {
    color: "#2ecc71",
  },
  gridCardCheck: {
    color: "#2ecc71",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 2,
    fontFamily: "Jersey20",
  },
  gridCardXP: {
    color: "#9b1c1c",
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
    fontFamily: "Jersey20",
  },
  addCard: {
    width: "48%",
    backgroundColor: "#fff8ec",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#9b1c1c",
    borderStyle: "dashed",
    minHeight: 90,
    justifyContent: "center",
    marginBottom: 10,
  },
  addCardPlus: {
    fontSize: 28,
    color: "#9b1c1c",
    fontWeight: "700",
    marginBottom: 4,
  },
  expandedCard: {
    width: "100%",
    marginBottom: 10,
  },
  collapseBtn: {
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginTop: -4,
    marginBottom: 4,
  },
  collapseBtnText: {
    color: "#8c7a5e",
    fontSize: 13,
    fontFamily: "Jersey20",
  },
  allDone: {
    color: "#2ecc71",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 16,
    fontFamily: "Jersey20",
  },
  historyBtn: {
    backgroundColor: "#fff8ec",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: "#8c9b6b",
  },
  historyBtnText: {
    color: "#9b1c1c",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Jersey20",
  },
});
