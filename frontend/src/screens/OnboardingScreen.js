import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  ImageBackground,
  Dimensions,
} from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { GENDERS, HEALTH_GOALS, COMMITMENT_LEVELS } from "../utils/constants";
import {
  activateHabits,
  seedHabitTemplates,
  getRecommendedHabits,
} from "../services/habitService";

const { width, height } = Dimensions.get("window");
const TOTAL_STEPS = 4;

export default function OnboardingScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState(null);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [commitmentLevel, setCommitmentLevel] = useState(null);
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    setError("");
    if (step === 0) {
      if (!gender) {
        setError("Please select your gender.");
        return;
      }
      setStep(1);
    } else if (step === 1) {
      if (selectedGoals.length === 0) {
        setError("Please select at least one goal.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!commitmentLevel) {
        setError("Please select your commitment level.");
        return;
      }
      setSelectedHabits([]);
      setStep(3);
    }
  };

  const handleBack = () => {
    setError("");
    if (step === 1) setStep(0);
    else if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const handleFinish = async () => {
    if (selectedHabits.length === 0 || selectedHabits.length > 4) {
      setError("Please select 1 to 4 habits.");
      return;
    }
    setLoading(true);
    try {
      await seedHabitTemplates();
      await activateHabits(user.uid, selectedHabits);
      await updateDoc(doc(db, "users", user.uid), {
        gender,
        selectedGoals,
        commitmentLevel,
        onboardingComplete: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Layout commun pour les boutons "Next" de style pilule 3D
  const NextButton = ({
    onPress,
    disabled,
    label = "Next",
    loading = false,
  }) => (
    <TouchableOpacity
      style={[styles.pixelButtonShadow, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <View style={styles.buttonInner}>
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>{label}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // ─── Step 1: Gender Selection (Style Gender.png) ───
  if (step === 0) {
    return (
      <View style={styles.whiteContainer}>
        <Text style={styles.pixelTitleBlack}>
          Which gender do you{"\n"}identify as?
        </Text>

        <View style={styles.genderContainer}>
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g}
              style={styles.genderItem}
              onPress={() => setGender(g)}
            >
              <View
                style={[
                  styles.avatarCircle,
                  gender === g && styles.avatarCircleActive,
                ]}
              >
                <Image
                  source={
                    g === "male"
                      ? require("../assets/avatars/male_avatar.png")
                      : require("../assets/avatars/female_avatar.png")
                  }
                  style={styles.avatarImg}
                />
              </View>
              <Text style={styles.genderLabelText}>{capitalize(g)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomNavSolo}>
          <NextButton onPress={handleNext} disabled={!gender} />
        </View>
      </View>
    );
  }

  // ─── Steps 2, 3, 4: Questions (Style Frame 36.jpg) ───
  return (
    <ImageBackground
      source={require("../assets/sky-background.png")}
      style={styles.container}
      imageStyle={{ top: -height * 0.1 }}
    >
      <View style={styles.overlay}>
        <Text style={styles.stepIndicator}>
          Step {step + 1} of {TOTAL_STEPS}
        </Text>

        {/* Bulle de question style Frame 36 */}
        <View style={styles.questionBubble}>
          <Text style={styles.questionText}>
            {step === 1
              ? "What are your goals?"
              : step === 2
                ? "How committed are you?"
                : "Choose your habits"}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollList}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 &&
            HEALTH_GOALS.map((g) => (
              <TouchableOpacity
                key={g.id}
                style={[
                  styles.optionCard,
                  selectedGoals.includes(g.id) && styles.optionCardActive,
                ]}
                onPress={() => toggleGoal(g.id)}
              >
                <Text style={styles.optionText}>{g.label}</Text>
              </TouchableOpacity>
            ))}

          {step === 2 &&
            COMMITMENT_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.optionCard,
                  commitmentLevel === level.id && styles.optionCardActive,
                ]}
                onPress={() => setCommitmentLevel(level.id)}
              >
                <Text style={styles.optionText}>{level.label}</Text>
                <Text style={styles.optionSubtext}>{level.description}</Text>
              </TouchableOpacity>
            ))}

          {step === 3 &&
            filteredHabits.map((habit) => (
              <TouchableOpacity
                key={habit.id}
                style={[
                  styles.optionCard,
                  selectedHabits.find((h) => h.id === habit.id) &&
                    styles.optionCardActive,
                ]}
                onPress={() => toggleHabit(habit)}
              >
                <Text style={styles.optionText}>{habit.title}</Text>
                <Text style={styles.optionSubtext}>
                  {habit.category} • {habit.xpReward} XP
                </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>

        <View style={styles.navRow}>
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.backLink}>Back</Text>
          </TouchableOpacity>
          <NextButton
            onPress={step === 3 ? handleFinish : handleNext}
            label={step === 3 ? "Finish" : "Next"}
            loading={loading}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // Containers
  whiteContainer: {
    flex: 1,
    backgroundColor: "#FFF",
    alignItems: "center",
    paddingTop: 80,
  },
  container: { flex: 1 },
  overlay: { flex: 1, paddingHorizontal: 25, paddingTop: 60 },

  // Typography
  pixelTitleBlack: {
    fontFamily: "PressStart2P",
    fontSize: 22,
    color: "#000",
    textAlign: "center",
    lineHeight: 35,
    marginBottom: 40,
  },
  stepIndicator: {
    fontFamily: "Jersey20",
    fontSize: 18,
    color: "#283618",
    textAlign: "center",
    marginBottom: 10,
  },

  // Gender Selection
  genderContainer: { gap: 30, alignItems: "center" },
  genderItem: { alignItems: "center" },
  avatarCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  avatarCircleActive: { backgroundColor: "#e2e2e2", borderWidth: 4 },
  avatarImg: { width: 110, height: 110, resizeMode: "contain" },
  genderLabelText: {
    fontFamily: "PressStart2P",
    fontSize: 20,
    marginTop: 15,
    color: "#000",
  },

  // Question Bubble
  questionBubble: {
    backgroundColor: "#fdf6e3",
    padding: 20,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#d4c4a8",
    marginBottom: 25,
    alignSelf: "center",
    width: "90%",
  },
  questionText: {
    fontFamily: "Jersey20",
    fontSize: 24,
    textAlign: "center",
    color: "#000",
  },

  // Options Cards
  scrollList: { flex: 1 },
  optionCard: {
    backgroundColor: "#fdf6e3",
    padding: 18,
    borderRadius: 30,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#d4c4a8",
    alignItems: "center",
  },
  optionCardActive: { backgroundColor: "#617143", borderColor: "#3a4528" },
  optionText: { fontFamily: "Jersey20", fontSize: 22, color: "#000" },
  optionSubtext: {
    fontFamily: "Jersey20",
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },

  // 3D Pixel Button
  pixelButtonShadow: {
    width: width * 0.7,
    height: 65,
    backgroundColor: "#1b2611",
    borderRadius: 35,
    paddingBottom: 7,
  },
  buttonInner: {
    flex: 1,
    backgroundColor: "#2d3a1a",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: { fontFamily: "Jersey20", fontSize: 32, color: "#FFF" },
  buttonDisabled: { opacity: 0.5 },

  // Navigation
  bottomNavSolo: { position: "absolute", bottom: 50 },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 40,
    gap: 15,
  },
  backLink: {
    fontFamily: "Jersey20",
    fontSize: 22,
    color: "#2d3a1a",
    textDecorationLine: "underline",
  },
});
