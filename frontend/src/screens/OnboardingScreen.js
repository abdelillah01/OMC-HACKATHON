import React, { useState, useMemo } from "react";
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
import { GOALS } from "../utils/constants";
import { activateHabits, seedHabitTemplates } from "../services/habitService";

const { width } = Dimensions.get("window");

export default function OnboardingScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState(null);
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = () => {
    setError("");
    if (step === 0 && !gender) return setError("Please select your gender.");
    if (step === 1 && !goal) return setError("Please select an option.");

    if (step === 1) {
      handleFinish();
    } else {
      setStep(step + 1);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await seedHabitTemplates();
      // Ici, nous activons des habitudes par défaut basées sur le Power Level choisi
      await updateDoc(doc(db, "users", user.uid), {
        gender,
        healthGoal: goal,
        onboardingComplete: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ─── ÉCRAN 1: GENDER SELECTION (Design Exact) ───
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
              activeOpacity={0.8}
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
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.avatarCircle,
                  gender === "female" && styles.avatarSelected,
                ]}
              >
                <Image
                  source={require("../../assets/female_avatar.png")}
                  style={styles.avatarImgFemale}
                />
              </View>
              <Text style={styles.genderText}>Female</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── ÉCRAN 2: QUEST (Power Level) ───
  if (step === 1) {
    const powerLevelQuestions = [
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
        <View style={styles.overlay}>
          <Text style={styles.pixelTitleDark}>let us know you!</Text>

          <View style={styles.dialogRow}>
            <Image
              source={require("../../assets/trainer.png")}
              style={styles.trainerMini}
            />
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>
                "What is your current Power Level when you wake up?"
              </Text>
            </View>
          </View>

          <View style={styles.optionsContainer}>
            {powerLevelQuestions.map((q) => (
              <TouchableOpacity
                key={q}
                style={[
                  styles.questOption,
                  goal === q && styles.questOptionActive,
                ]}
                onPress={() => setGoal(q)}
              >
                <Text style={styles.questOptionText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            disabled={loading}
          >
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

  return null;
}

const styles = StyleSheet.create({
  // Structure globale
  whiteContainer: {
    flex: 1,
    backgroundColor: "#FFF",
    paddingHorizontal: 30,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 80,
  },
  mapContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  // Typographie Pixel
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
    marginBottom: 30,
  },

  // Style Gender (Image Gender.png)
  genderContainer: {
    width: "100%",
    alignItems: "center",
    gap: 30,
  },
  genderItem: {
    alignItems: "center",
  },
  avatarCircle: {
    width: 155,
    height: 155,
    borderRadius: 77.5,
    borderWidth: 1.5,
    borderColor: "#000",
    overflow: "hidden",
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarSelected: {
    borderColor: "#283618",
    borderWidth: 5,
    backgroundColor: "#f0f1e8",
  },
  avatarImg: {
    width: 152,
    height: 134,
    resizeMode: "cover",
  },
  // Supprimez avatarImgFemale et utilisez celui-ci pour les deux
  avatarImgFemale: {
    width: "85%", // Ajusté pour ne pas toucher les bords du cercle noir
    height: "85%",
    resizeMode: "contain", // "contain" évite que les cheveux pixelisés ne soient coupés
  },
  genderText: {
    fontFamily: "Jersey20",
    fontSize: 32,
    color: "#000",
    marginTop: 10,
  },

  // Style Dialogue (Image qst.jpg)
  dialogRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    width: "100%",
    marginBottom: 25,
  },
  trainerMini: {
    width: 70,
    height: 90,
    resizeMode: "contain",
  },
  bubble: {
    backgroundColor: "#f2f3e8",
    borderRadius: 20,
    padding: 15,
    flex: 1,
    marginLeft: 5,
    borderWidth: 1,
    borderColor: "#dcdcdc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  bubbleText: {
    fontFamily: "Jersey20",
    fontSize: 20,
    textAlign: "center",
    color: "#000",
  },

  // Options Quest
  optionsContainer: {
    width: "100%",
    gap: 12,
  },
  questOption: {
    backgroundColor: "#f2f3e8",
    borderRadius: 35,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  questOptionActive: {
    backgroundColor: "rgba(40, 54, 24, 0.4)",
  },
  questOptionText: {
    fontFamily: "Jersey20",
    fontSize: 18,
    color: "#000",
    textAlign: "center",
  },

  // Bouton Next (Capsule)
  nextButton: {
    backgroundColor: "#283618",
    borderRadius: 40,
    width: "100%",
    height: 65,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
  },
  nextButtonText: {
    color: "#FFF",
    fontFamily: "Jersey20",
    fontSize: 30,
  },
});
