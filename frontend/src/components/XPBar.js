import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getXPProgress } from '../utils/helpers';
import { XP_PER_LEVEL } from '../utils/constants';

export default function XPBar({ xp }) {
  const progress = getXPProgress(xp);
  const percentage = (progress / XP_PER_LEVEL) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>XP</Text>
        <Text style={styles.value}>
          {progress} / {XP_PER_LEVEL}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600',
  },
  value: {
    color: '#aaa',
    fontSize: 13,
  },
  track: {
    height: 10,
    backgroundColor: '#0f3460',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#e94560',
    borderRadius: 5,
  },
});
