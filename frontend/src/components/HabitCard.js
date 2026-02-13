import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

export default function HabitCard({ habit, completedToday, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const isQuantitative = habit.isQuantitative;

  const handlePress = async () => {
    if (completedToday || loading) return;

    if (isQuantitative && !showInput) {
      setInputValue(habit.targetValue ? String(habit.targetValue) : '');
      setShowInput(true);
      return;
    }

    setLoading(true);
    try {
      await onComplete(habit, null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (loading) return;
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue <= 0) return;

    setLoading(true);
    try {
      await onComplete(habit, numValue);
    } finally {
      setLoading(false);
      setShowInput(false);
    }
  };

  const handleCancel = () => {
    setShowInput(false);
    setInputValue('');
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
        {isQuantitative && habit.targetValue && !completedToday && !showInput && (
          <Text style={styles.target}>
            Target: {habit.targetValue} {habit.unit}
          </Text>
        )}
      </View>

      {showInput && !completedToday ? (
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#a89880"
              autoFocus
            />
            <Text style={styles.unitLabel}>{habit.unit}</Text>
          </View>
          <View style={styles.inputActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.confirmBtnText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
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
      )}
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
  target: {
    color: '#8c7a5e',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
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

  // Quantitative input
  inputContainer: {
    alignItems: 'flex-end',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#8c9b6b',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: 60,
    fontSize: 16,
    color: '#283618',
    textAlign: 'center',
    fontFamily: 'Jersey20',
  },
  unitLabel: {
    color: '#8c7a5e',
    fontSize: 13,
    marginLeft: 6,
    fontFamily: 'Jersey20',
  },
  inputActions: {
    flexDirection: 'row',
    gap: 6,
  },
  cancelBtn: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#8c9b6b',
  },
  cancelBtnText: {
    color: '#8c7a5e',
    fontSize: 12,
    fontFamily: 'Jersey20',
  },
  confirmBtn: {
    backgroundColor: '#9b1c1c',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Jersey20',
  },
});
