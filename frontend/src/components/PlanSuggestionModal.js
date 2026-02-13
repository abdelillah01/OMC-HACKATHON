import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

export default function PlanSuggestionModal({ visible, suggestion, onAccept, onDismiss }) {
  const [loading, setLoading] = useState(false);

  if (!suggestion) return null;

  const isHarder = suggestion.direction === 'harder';
  const { reason, swaps = [], toAdd = [], toRemove = [], completionRate } = suggestion;

  const handleAccept = async () => {
    setLoading(true);
    try {
      await onAccept();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {isHarder ? (
            <Image source={require('../assets/fire.png')} style={styles.emojiImage} />
          ) : (
            <Text style={styles.emoji}>🌱</Text>
          )}
          <Text style={styles.title}>
            {isHarder ? 'Ready for More?' : 'Let\'s Adjust'}
          </Text>
          <Text style={styles.reason}>{reason}</Text>

          <View style={styles.statRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{completionRate}%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{suggestion.willpower}</Text>
              <Text style={styles.statLabel}>Willpower</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{suggestion.planDifficulty}</Text>
              <Text style={styles.statLabel}>Plan Level</Text>
            </View>
          </View>

          <ScrollView style={styles.changesList} showsVerticalScrollIndicator={false}>
            <Text style={styles.changesTitle}>Proposed Changes:</Text>

            {swaps.map((swap, i) => (
              <View key={`swap-${i}`} style={styles.changeRow}>
                <View style={styles.removeBox}>
                  <Text style={styles.removeLabel}>Remove</Text>
                  <Text style={styles.habitName}>{swap.remove.title || swap.remove.habitId}</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
                <View style={styles.addBox}>
                  <Text style={styles.addLabel}>Add</Text>
                  <Text style={styles.habitName}>{swap.add.title}</Text>
                  <Text style={styles.xpLabel}>+{swap.add.xpReward} XP</Text>
                </View>
              </View>
            ))}

            {toAdd.map((habit, i) => (
              <View key={`add-${i}`} style={styles.singleChange}>
                <Text style={styles.addLabel}>+ New Habit</Text>
                <Text style={styles.habitName}>{habit.title}</Text>
                <Text style={styles.xpLabel}>+{habit.xpReward} XP</Text>
              </View>
            ))}

            {toRemove.map((habit, i) => (
              <View key={`rm-${i}`} style={styles.singleChange}>
                <Text style={styles.removeLabel}>- Remove</Text>
                <Text style={styles.habitName}>{habit.title || habit.habitId}</Text>
              </View>
            ))}
          </ScrollView>

          {loading ? (
            <ActivityIndicator color="#9b1c1c" size="large" style={{ marginTop: 16 }} />
          ) : (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={handleAccept}
                activeOpacity={0.7}
              >
                <Text style={styles.acceptText}>Accept Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dismissBtn}
                onPress={onDismiss}
                activeOpacity={0.7}
              >
                <Text style={styles.dismissText}>Keep My Plan</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff8ec',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: '#8c9b6b',
    width: '90%',
    maxHeight: '80%',
  },
  emoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 8,
  },
  emojiImage: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#283618',
    textAlign: 'center',
    fontFamily: 'Jersey20',
    marginBottom: 8,
  },
  reason: {
    fontSize: 14,
    color: '#8c7a5e',
    textAlign: 'center',
    fontFamily: 'Jersey20',
    marginBottom: 16,
    lineHeight: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9b1c1c',
    fontFamily: 'Jersey20',
  },
  statLabel: {
    fontSize: 10,
    color: '#8c7a5e',
    fontFamily: 'Jersey20',
  },
  changesList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  changesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#283618',
    marginBottom: 10,
    fontFamily: 'Jersey20',
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  removeBox: {
    flex: 1,
    backgroundColor: '#fdecea',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  addBox: {
    flex: 1,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#2ecc71',
  },
  arrow: {
    fontSize: 18,
    color: '#8c7a5e',
    marginHorizontal: 6,
    fontFamily: 'Jersey20',
  },
  removeLabel: {
    fontSize: 10,
    color: '#e74c3c',
    fontWeight: '700',
    fontFamily: 'Jersey20',
  },
  addLabel: {
    fontSize: 10,
    color: '#2ecc71',
    fontWeight: '700',
    fontFamily: 'Jersey20',
  },
  habitName: {
    fontSize: 12,
    color: '#283618',
    fontFamily: 'Jersey20',
    marginTop: 2,
  },
  xpLabel: {
    fontSize: 10,
    color: '#9b1c1c',
    fontFamily: 'Jersey20',
    marginTop: 2,
  },
  singleChange: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonRow: {
    gap: 10,
  },
  acceptBtn: {
    backgroundColor: '#9b1c1c',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  acceptText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Jersey20',
  },
  dismissBtn: {
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#8c9b6b',
  },
  dismissText: {
    color: '#8c7a5e',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Jersey20',
  },
});
