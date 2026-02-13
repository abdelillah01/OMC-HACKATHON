import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  ImageBackground,
  Dimensions,
} from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { INTEREST_CATEGORIES, HABIT_TEMPLATES } from "../utils/constants";
import { activateHabits } from "../services/habitService";

const { height } = Dimensions.get("window");

export default function OnboardingScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState(null);
  const [goal, setGoal] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step === 0 && !gender) return;
    if (step === 1 && !goal) return;
    if (step === 2 && selectedInterests.length === 0) return;
    if (step === 3 && selectedHabits.length === 0) return;

    if (step === 3) handleFinish();
    else setStep(step + 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // 1. Activate selected habits
      await activateHabits(user.uid, selectedHabits);

      // 2. Update user profile
      await updateDoc(doc(db, "users", user.uid), {
        gender,
        healthGoal: goal,
        selectedInterests,
        onboardingComplete: true,
        // Initialize willpower if not already done by constant defaults (handled mostly in aiService now)
      });
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      if (selectedInterests.length < 3) {
        setSelectedInterests([...selectedInterests, interest]);
      }
    }
  };

  const toggleHabit = (habit) => {
    const exists = selectedHabits.find((h) => h.id === habit.id);
    if (exists) {
      setSelectedHabits(selectedHabits.filter((h) => h.id !== habit.id));
    } else {
      if (selectedHabits.length < 3) {
        setSelectedHabits([...selectedHabits, habit]);
      }
    }
  };

  // ─── ÉCRAN 1: GENDER SELECTION (Gardé tel quel) ───
  if (step === 0) {
    return (
      <View style={styles.whiteContainer}>
        <View style={styles.content}>
          <Text style={styles.pixelTitle}>
            Which gender do you{"\n"}identify as?
          </Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              onPress={() => setGender("male")}
              style={styles.genderItem}
            >
              <View
                style={[
                  styles.avatarCircle,
                  gender === "male" && styles.avatarSelected,
                ]}
              >
                <Image
                  source={require("../../assets/male_avatar.png")}
                  style={styles.avatarImg}
                />
              </View>
              <Text style={styles.genderText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setGender("female")}
              style={styles.genderItem}
            >
              <View
                style={[
                  styles.avatarCircle,
                  gender === "female" && styles.avatarSelected,
                ]}
              >
                <Image
                  source={require("../../assets/female_avatar.png")}
                  style={styles.avatarImg}
                />
              </View>
              <Text style={styles.genderText}>Female</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.nextButtonBottom} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── ÉCRAN 2: QUEST (Ajusté selon qst.jpg) ───
  if (step === 1) {
    const questions = [
      'Depleted: I need a "potion" (coffee) just to move.',
      "Low Battery: I'm dragging until midday.",
      "Steady: I have enough fuel for the basics.",
      "Overcharged: I'm ready to sprint into the day.",
    ];

    return (
      <ImageBackground
        source={require("../../assets/map_bg.png")}
        style={styles.mapContainer}
      >
        <View style={styles.overlayQuest}>
          {/* Titre descendu ici */}
          <Text style={styles.pixelTitleDark}>let us know you!</Text>

          <View style={styles.dialogWrapper}>
            <View style={styles.characterBlock}>
              <Image
                source={require("../../assets/trainer.png")}
                style={styles.trainerImg}
              />
              {/* Bulles de pensée repositionnées AU-DESSUS du perso */}
              <View style={styles.dotSmall} />
              <View style={styles.dotLarge} />
            </View>

            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>
                "What is your current Power Level when you wake up?"
              </Text>
            </View>
          </View>

          <View style={styles.optionsList}>
            {questions.map((q) => (
              <TouchableOpacity
                key={q}
                style={[styles.optionBtn, goal === q && styles.optionBtnActive]}
                onPress={() => setGoal(q)}
              >
                <Text style={styles.optionBtnText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.nextButtonQuest} onPress={handleNext}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.nextButtonText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }
  // ─── ÉCRAN 3: INTERESTS ───
  if (step === 2) {
    return (
      <View style={styles.whiteContainer}>
        <View style={styles.content}>
          <Text style={styles.pixelTitle}>
            Pick up to 3 topics{"\n"}you care about
          </Text>
          <View style={styles.optionsList}>
            {INTEREST_CATEGORIES.map((interest) => (
              <TouchableOpacity
                key={interest}
                style={[
                  styles.optionBtn,
                  selectedInterests.includes(interest) && styles.optionBtnActive,
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={styles.optionBtnText}>
                  {interest.charAt(0).toUpperCase() + interest.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <TouchableOpacity style={styles.nextButtonBottom} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── ÉCRAN 4: HABITS ───
  if (step === 3) {
    // Filter habits based on selected interests/goals for better relevance?
    // For now show all matching the selected interests
    const recommendedHabits = HABIT_TEMPLATES.filter((h) =>
      selectedInterests.includes(h.category)
    );

    return (
      <View style={styles.whiteContainer}>
        <View style={styles.content}>
          <Text style={styles.pixelTitle}>
            Choose 3 starter habits to begin with
          </Text>
          <View style={styles.optionsList}>
            {recommendedHabits.map((habit) => (
              <TouchableOpacity
                key={habit.id}
                style={[
                  styles.optionBtn,
                  selectedHabits.find((h) => h.id === habit.id) &&
                  styles.optionBtnActive,
                ]}
                onPress={() => toggleHabit(habit)}
              >
                <Text style={styles.optionBtnText}>
                  {habit.title} ({habit.xpReward} XP)
                </Text>
              </TouchableOpacity>
            ))}
            {recommendedHabits.length === 0 && (
              <Text>No habits found for your interests. Try going back and selecting different ones.</Text>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.nextButtonBottom} onPress={handleNext}>
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.nextButtonText}>Start Journey</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  // Structure
  whiteContainer: { flex: 1, backgroundColor: "#FFF", paddingHorizontal: 30 },
  mapContainer: { flex: 1 },
  content: { flex: 1, alignItems: "center", paddingTop: 80 },

  overlayQuest: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    paddingTop: 110, // Augmenté pour descendre le titre comme sur l'image
    paddingHorizontal: 20,
  },

  // Titres
  pixelTitle: {
    fontFamily: "Jersey20",
    fontSize: 34,
    textAlign: "center",
    color: "#000",
    marginBottom: 50,
  },
  pixelTitleDark: {
    fontFamily: "Jersey20",
    fontSize: 45,
    color: "#283618",
    marginBottom: 40, // Plus d'espace sous le titre
  },

  // Gender Styles
  genderContainer: { width: "100%", alignItems: "center", gap: 30 },
  genderItem: { alignItems: "center" },
  avatarCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: "#000",
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSelected: {
    borderColor: "#283618",
    borderWidth: 4,
    backgroundColor: "#f0f1e8",
  },
  avatarImg: { width: "100%", height: "100%", resizeMode: "contain" },
  genderText: {
    fontFamily: "Jersey20",
    fontSize: 32,
    color: "#000",
    marginTop: 10,
  },

  // Dialogue & Trainer
  dialogWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: 15,
  },
  characterBlock: {
    position: "relative",
    width: 75,
    height: 100,
    justifyContent: "flex-end",
  },
  trainerImg: { width: 65, height: 85, resizeMode: "contain" },

  // Bulles de pensée (Au-dessus du perso)
  dotSmall: {
    position: "absolute",
    top: 10,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f2f3e8",
    borderWidth: 1,
    borderColor: "#dcdcdc",
  },
  dotLarge: {
    position: "absolute",
    top: -5,
    right: -10,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#f2f3e8",
    borderWidth: 1,
    borderColor: "#dcdcdc",
  },

  speechBubble: {
    backgroundColor: "#f2f3e8",
    borderRadius: 25,
    padding: 15,
    flex: 1,
    marginLeft: 20,
    marginTop: -10, // Remonte légèrement pour s'aligner avec les points
    borderWidth: 1,
    borderColor: "#dcdcdc",
  },
  speechText: {
    fontFamily: "Jersey20",
    fontSize: 18,
    textAlign: "center",
    color: "#000",
  },

  // Options (Grand Espacement)
  optionsList: { width: "100%", marginTop: 20, gap: 40 },
  optionBtn: {
    backgroundColor: "#fefae0",
    borderRadius: 35,
    paddingVertical: 18,
    paddingHorizontal: 15,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  optionBtnActive: { backgroundColor: "rgba(40, 54, 24, 0.4)" },
  optionBtnText: {
    fontFamily: "Jersey20",
    fontSize: 17,
    color: "#000",
    textAlign: "center",
  },

  // Boutons Next
  nextButtonBottom: {
    backgroundColor: "#283618",
    borderRadius: 40,
    width: "100%",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  nextButtonQuest: {
    backgroundColor: "#222c14",
    borderRadius: 35,
    width: 170,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
  },
  nextButtonText: { color: "#FFF", fontFamily: "Jersey20", fontSize: 28 },
});
