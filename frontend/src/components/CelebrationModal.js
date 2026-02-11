import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getAvatarStage } from '../utils/helpers';
import { AVATAR_STAGES } from '../utils/constants';

export default function CelebrationModal({ visible, level, onClose }) {
  const stage = getAvatarStage(level || 1);
  const avatarName = AVATAR_STAGES[stage]?.name || 'Adventurer';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Level Up!</Text>
          <Text style={styles.levelText}>You reached Level {level}!</Text>
          <Text style={styles.avatarText}>
            You are now a {avatarName}
          </Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Keep Going!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 30,
    borderWidth: 2,
    borderColor: '#e94560',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e94560',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 18,
    color: '#eaeaea',
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 15,
    color: '#aaa',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
