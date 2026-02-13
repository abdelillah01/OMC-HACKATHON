import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

export default function HabitCard({ habit, completedToday, onComplete }) {
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (completedToday || loading) return;
    setLoading(true);
    try {
      await onComplete(habit);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.card, completedToday && styles.cardCompleted]}>
      <View style={styles.info}>
        <Text style={[styles.title, completedToday && styles.titleCompleted]}>
          {habit.title}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.category}>
            {habit.category.charAt(0).toUpperCase() + habit.category.slice(1)}
          </Text>
          <Text style={styles.xp}>+{habit.xpReward} XP</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.completeBtn, completedToday && styles.completeBtnDone]}
        onPress={handlePress}
        disabled={completedToday || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.completeBtnText}>
            {completedToday ? 'Done' : 'Complete'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff8ec',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#8c9b6b',
  },
  cardCompleted: {
    borderColor: '#2ecc71',
    opacity: 0.7,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: '#283618',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Jersey20',
  },
  titleCompleted: {
    color: '#2ecc71',
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  category: {
    color: '#8c7a5e',
    fontSize: 13,
    fontFamily: 'Jersey20',
  },
  xp: {
    color: '#9b1c1c',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Jersey20',
  },
  completeBtn: {
    backgroundColor: '#9b1c1c',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 85,
    alignItems: 'center',
  },
  completeBtnDone: {
    backgroundColor: '#2ecc71',
  },
  completeBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Jersey20',
  },
});
