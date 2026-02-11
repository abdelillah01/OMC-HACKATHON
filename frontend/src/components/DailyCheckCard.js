import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Platform } from 'react-native';

export default function DailyCheckCard({ check, answered, onPress }) {
  const done = answered === true || answered === false;

  return (
    <TouchableOpacity
      activeOpacity={done ? 1 : 0.6}
      style={[styles.card, done && styles.cardDone]}
      onPress={onPress}
      disabled={done}
    >
      <Text style={styles.icon}>{check.icon}</Text>
      <Text style={[styles.title, done && styles.titleDone]}>{check.title}</Text>
      {done && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#16213e',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
    minHeight: 90,
    justifyContent: 'center',
    marginBottom: 10,
    ...Platform.select({
      android: { elevation: 3 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
      },
    }),
  },
  cardDone: {
    borderColor: '#2ecc71',
    backgroundColor: '#1a3a2a',
  },
  icon: {
    fontSize: 28,
    marginBottom: 6,
  },
  title: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  titleDone: {
    color: '#2ecc71',
  },
  checkmark: {
    color: '#2ecc71',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
});
