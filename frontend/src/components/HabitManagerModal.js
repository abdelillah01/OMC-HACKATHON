import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { HABIT_TEMPLATES } from '../utils/constants';
import { activateHabits, deactivateHabit } from '../services/habitService';

export default function HabitManagerModal({ visible, activeHabits, userId, onClose }) {
  const [pending, setPending] = useState(null);

  // Map of templateId -> userHabit doc id (for active habits)
  const activeMap = {};
  activeHabits.forEach((h) => {
    activeMap[h.habitId] = h.id;
  });

  const handleToggle = async (template) => {
    if (pending) return;
    setPending(template.id);
    try {
      if (activeMap[template.id]) {
        await deactivateHabit(activeMap[template.id]);
      } else {
        await activateHabits(userId, [template]);
      }
      onClose(true); // true = refresh needed
    } catch (err) {
      console.error('Toggle habit error:', err);
    } finally {
      setPending(null);
    }
  };

  // Group templates by category
  const grouped = {};
  HABIT_TEMPLATES.forEach((t) => {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  });

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Manage Habits</Text>
          <Text style={styles.subtitle}>Tap to add or remove habits</Text>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {Object.entries(grouped).map(([category, templates]) => (
              <View key={category}>
                <Text style={styles.categoryTitle}>{category}</Text>
                {templates.map((template) => {
                  const isActive = !!activeMap[template.id];
                  const isLoading = pending === template.id;
                  return (
                    <TouchableOpacity
                      key={template.id}
                      style={[styles.habitRow, isActive && styles.habitRowActive]}
                      onPress={() => handleToggle(template)}
                      disabled={!!pending}
                      activeOpacity={0.6}
                    >
                      <View style={styles.habitInfo}>
                        <Text style={[styles.habitTitle, isActive && styles.habitTitleActive]}>
                          {template.title}
                        </Text>
                        <Text style={styles.habitMeta}>
                          +{template.xpReward} XP
                        </Text>
                      </View>
                      {isLoading ? (
                        <ActivityIndicator color="#9b1c1c" size="small" />
                      ) : (
                        <View style={[styles.toggle, isActive && styles.toggleActive]}>
                          <Text style={styles.toggleText}>{isActive ? '−' : '+'}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={() => onClose(false)}>
            <Text style={styles.closeBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff8ec',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: '#8c9b6b',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#283618',
    textAlign: 'center',
    fontFamily: 'Jersey20',
  },
  subtitle: {
    fontSize: 13,
    color: '#8c7a5e',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Jersey20',
  },
  scroll: {
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9b1c1c',
    marginTop: 14,
    marginBottom: 8,
    fontFamily: 'Jersey20',
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#ddd',
  },
  habitRowActive: {
    borderColor: '#2ecc71',
    backgroundColor: '#e8f5e9',
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 14,
    color: '#283618',
    fontWeight: '600',
    fontFamily: 'Jersey20',
  },
  habitTitleActive: {
    color: '#2ecc71',
  },
  habitMeta: {
    fontSize: 11,
    color: '#9b1c1c',
    marginTop: 2,
    fontFamily: 'Jersey20',
  },
  toggle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#9b1c1c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#e74c3c',
  },
  toggleText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  closeBtn: {
    backgroundColor: '#9b1c1c',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Jersey20',
  },
});
