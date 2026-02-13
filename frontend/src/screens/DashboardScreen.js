import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useUser } from "../context/UserContext";
import { getTodayCheck } from "../services/dailyCheckService";
import { getUserHabits, getTodayCompletions, completeHabit, activateHabits, deleteUserHabit } from "../services/habitService";
import { updateWillpower, analyzeUserState, getSuggestions } from "../services/aiService";
import WeeklyXPChart from "../components/WeeklyXPChart";
import AISuggestionModal from "../components/AISuggestionModal";
import { DAILY_CHECKS, HABIT_TEMPLATES } from "../utils/constants";

const { width } = Dimensions.get("window");

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { profile } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [dailyCheckData, setDailyCheckData] = useState(null);
  const [userHabits, setUserHabits] = useState([]);
  const [completedHabits, setCompletedHabits] = useState({});
  const [loading, setLoading] = useState(true);

  // AI Modal State
  const [suggestionModalVisible, setSuggestionModalVisible] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(null);

  // Charger les vraies données depuis Firebase
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const checkData = await getTodayCheck(user.uid);
      setDailyCheckData(checkData);

      const habits = await getUserHabits(user.uid);
      setUserHabits(habits);

      const completed = await getTodayCompletions(user.uid);
      setCompletedHabits(completed);

    } catch (err) {
      console.error("Erreur chargement données:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleHabitComplete = async (habit) => {
    if (completedHabits[habit.habitId || habit.id]) return;

    try {
      // 1. Mark as complete
      await completeHabit(user.uid, habit.habitId || habit.id, habit.xpReward);

      // Update local state immediately for UI responsiveness
      setCompletedHabits(prev => ({ ...prev, [habit.habitId || habit.id]: true }));

      // 2. AI Analysis
      // We pass 'true' for success.
      const newWillpower = await updateWillpower(user.uid, habit, true);

      // Analyze with updated state (we simulate the updated user profile for analysis)
      const virtualUser = { ...profile, willpower: newWillpower };
      const analysis = analyzeUserState(virtualUser, userHabits);

      if (analysis.action !== 'MAINTAIN') {
        const suggestions = getSuggestions(analysis, virtualUser, userHabits);
        if (suggestions && suggestions.length > 0) {
          setCurrentSuggestion(suggestions[0]); // Pick first suggestion
          setSuggestionModalVisible(true);
        }
      }

    } catch (err) {
      console.error("Completion error:", err);
    }
  };

  const handleAcceptSuggestion = async () => {
    if (!currentSuggestion) return;
    setLoading(true);
    setSuggestionModalVisible(false);

    try {
      if (currentSuggestion.type === 'REPLACE') {
        await deleteUserHabit(currentSuggestion.remove.id);
        await activateHabits(user.uid, [currentSuggestion.add]);
      } else if (currentSuggestion.type === 'ADD') {
        await activateHabits(user.uid, [currentSuggestion.add]);
      }

      await loadData(); // Reload to show changes
      alert("Plan updated! Good luck!");
    } catch (err) {
      console.error("Error applying suggestion:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#283618" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#283618"
          />
        }
      >
        {/* HEADER : Hamburger & Badge Notifications */}
        <View style={styles.topNav}>
          <TouchableOpacity
            onPress={() => navigation.getParent()?.openDrawer()}
          >
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
            <View style={styles.hamburgerLine} />
          </TouchableOpacity>
          <View style={styles.notifBadge}>
            <Text style={styles.notifText}>77</Text>
          </View>
        </View>

        <Text style={styles.mainTitle}>welcome back!</Text>

        {/* SECTION AVATARS (Visuel seulement) */}
        <View style={styles.avatarRowPlaceholder}>
          <Text style={{ fontSize: 28 }}>🧑‍🤝‍🧑🧑‍🤝‍🧑🧑‍🤝‍🧑🏰</Text>
          <View style={styles.rowLine} />
        </View>

        {/* CARTE DE PROGRESSION HEBDOMADAIRE (Vrai composant Chart) */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.dateText}>📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
            <Text style={styles.flowerText}>Willpower: {profile?.willpower || 50} 🔋</Text>
          </View>
          <Text style={styles.chartTitle}>weekly health progress</Text>
          <View style={styles.chartWrapper}>
            <WeeklyXPChart userId={user?.uid} />
          </View>
        </View>

        {/* SECTION: MY HABITS */}
        <View style={{ marginTop: 25 }}>
          <Text style={styles.mainTitle}>My Goals</Text>
          {userHabits.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#666' }}>No habits yet. Restart onboarding?</Text>
          ) : (
            userHabits.map((habit) => {
              const isDone = completedHabits[habit.habitId || habit.id];
              return (
                <TouchableOpacity
                  key={habit.id}
                  style={[styles.habitRow, isDone && styles.habitRowDone]}
                  onPress={() => !isDone && handleHabitComplete(habit)}
                >
                  <View style={styles.habitContent}>
                    <Text style={[styles.habitTitleText, isDone && { textDecorationLine: 'line-through', color: '#888' }]}>
                      {habit.title}
                    </Text>
                    <Text style={styles.habitSubText}>
                      {habit.category} • {habit.xpReward} XP • Lvl {habit.difficultyScore || '?'}
                    </Text>
                  </View>
                  <View style={[styles.checkBox, isDone && styles.checkBoxDone]}>
                    {isDone && <Text style={{ color: '#fff' }}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* PERSONNAGE CENTRAL (Utilise trainer.png de ton dossier assets) */}
        <View style={styles.centerCharacter}>
          <Image
            source={require("../../assets/trainer.png")}
            style={styles.knightImg}
          />
          <Text style={styles.motivationText}>
            You're here ! that's already something
          </Text>
        </View>

        {/* GRILLE DYNAMIQUE DES QUESTIONS (Basée sur DAILY_CHECKS) */}
        <View style={styles.gridContainer}>
          {DAILY_CHECKS.map((check) => (
            <TouchableOpacity
              key={check.key}
              style={[
                styles.gridItem,
                dailyCheckData?.[check.key] && styles.gridItemDone, // Change d'aspect si complété
              ]}
              onPress={() => navigation.navigate("DailyCheck", { check })}
            >
              <Text style={styles.gridIconText}>{check.icon || "💊"}</Text>
              <Text style={styles.gridLabelText}>{check.label}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.gridItemPlus}
            onPress={() => navigation.navigate("AddHabit")} // You need to implement AddHabitScreen or just show a list
          >
            <Text style={styles.plusIcon}>+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AISuggestionModal
        visible={suggestionModalVisible}
        suggestion={currentSuggestion}
        onClose={() => setSuggestionModalVisible(false)}
        onAccept={handleAcceptSuggestion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  // Header Style Photo
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  hamburgerLine: {
    width: 22,
    height: 2,
    backgroundColor: "#000",
    marginVertical: 2.5,
  },
  notifBadge: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  notifText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },

  mainTitle: {
    fontFamily: "Jersey20",
    fontSize: 38,
    textAlign: "center",
    color: "#000",
    marginVertical: 10,
  },

  // Ligne d'avatars sous le titre
  avatarRowPlaceholder: { alignItems: "center", marginBottom: 25 },
  rowLine: {
    width: "80%",
    height: 4,
    backgroundColor: "#fefae0",
    borderRadius: 2,
    marginTop: -5,
  },

  // Graphique
  chartCard: {
    backgroundColor: "#f2f3e8",
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    elevation: 3,
  },
  chartHeader: { flexDirection: "row", justifyContent: "space-between" },
  dateText: { fontSize: 10, color: "#666", fontWeight: "bold" },
  flowerText: { fontSize: 12 },
  chartTitle: { fontFamily: "Jersey20", fontSize: 16, marginTop: 5 },
  chartWrapper: { height: 130, marginTop: 10 },

  // Perso central
  centerCharacter: { alignItems: "center", marginVertical: 25 },
  knightImg: { width: 90, height: 110, resizeMode: "contain" },
  motivationText: {
    fontFamily: "Jersey20",
    fontSize: 24,
    textAlign: "center",
    marginTop: 10,
  },

  // Grille 3 colonnes exactes
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: (width - 60) / 3,
    aspectRatio: 0.9,
    backgroundColor: "#fefae0",
    borderRadius: 12,
    padding: 8,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e6e6d0",
  },
  gridItemDone: { backgroundColor: "#e9edc9", borderColor: "#ccd5ae" }, // Aspect si validé
  gridItemPlus: {
    width: (width - 60) / 3,
    aspectRatio: 0.9,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#dcdcdc",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  gridIconText: { fontSize: 22, marginBottom: 4 },
  gridLabelText: {
    fontSize: 8,
    textAlign: "center",
    fontWeight: "bold",
    color: "#000",
  },
  plusIcon: { fontSize: 30, color: "#ccc" },

  // Habit Row Styles
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 2,
  },
  habitRowDone: {
    backgroundColor: '#f2f3e8',
    borderColor: '#dcdcdc',
    opacity: 0.8,
  },
  habitContent: {
    flex: 1,
  },
  habitTitleText: {
    fontFamily: 'Jersey20',
    fontSize: 20,
    color: '#000',
  },
  habitSubText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#283618',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  checkBoxDone: {
    backgroundColor: '#283618',
  },
});
