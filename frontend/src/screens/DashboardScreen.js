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
import { getUserHabits, getTodayCompletions } from "../services/habitService";
import WeeklyXPChart from "../components/WeeklyXPChart";
import { DAILY_CHECKS } from "../utils/constants";

const { width } = Dimensions.get("window");

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const { profile } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [dailyCheckData, setDailyCheckData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les vraies données depuis Firebase
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const checkData = await getTodayCheck(user.uid);
      setDailyCheckData(checkData);
      // Ici tu peux aussi charger tes habitudes si besoin
    } catch (err) {
      console.error("Erreur chargement données:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
            <Text style={styles.dateText}>📅 Monday, October 28</Text>
            <Text style={styles.flowerText}>🌹 2</Text>
          </View>
          <Text style={styles.chartTitle}>weekly health progress</Text>
          <View style={styles.chartWrapper}>
            <WeeklyXPChart userId={user?.uid} />
          </View>
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
            onPress={() => navigation.navigate("AddHabit")}
          >
            <Text style={styles.plusIcon}>+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
});
