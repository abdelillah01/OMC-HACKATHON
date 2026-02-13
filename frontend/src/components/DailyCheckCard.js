import React from 'react';
import { TouchableOpacity, Text, Image, StyleSheet } from 'react-native';

export default function DailyCheckCard({ check, answered, onPress }) {
  const done = answered === true || answered === false;
  const isImage = typeof check.icon !== 'string';

  return (
    <TouchableOpacity
      activeOpacity={done ? 1 : 0.6}
      style={[styles.card, done && styles.cardDone]}
      onPress={onPress}
      disabled={done}
    >
      {isImage ? (
        <Image source={check.icon} style={styles.iconImage} />
      ) : (
        <Text style={styles.icon}>{check.icon}</Text>
      )}
      <Text style={[styles.title, done && styles.titleDone]}>{check.title}</Text>
      {done && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#fff8ec',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#8c9b6b',
    minHeight: 90,
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardDone: {
    borderColor: '#2ecc71',
    backgroundColor: '#e8f5e9',
  },
  icon: {
    fontSize: 28,
    marginBottom: 6,
  },
  iconImage: {
    width: 36,
    height: 36,
    marginBottom: 6,
    resizeMode: 'contain',
  },
  title: {
    color: '#283618',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Jersey20',
  },
  titleDone: {
    color: '#2ecc71',
  },
  checkmark: {
    color: '#2ecc71',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
    fontFamily: 'Jersey20',
  },
});
