import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { getTodayTasks, addTask, toggleTask, deleteTask } from '../services/dailyCheckService';

export default function TasksModal({ visible, userId, onXP, onClose }) {
  const [tasks, setTasks] = useState([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  // Load tasks when modal opens
  useEffect(() => {
    if (visible && userId) {
      setLoading(true);
      getTodayTasks(userId)
        .then(setTasks)
        .catch((err) => console.error('Failed to load tasks:', err))
        .finally(() => setLoading(false));
    }
    if (!visible) {
      setNewText('');
    }
  }, [visible, userId]);

  const handleAdd = async () => {
    const trimmed = newText.trim();
    if (!trimmed || tasks.length >= 8) return;
    setAdding(true);
    try {
      const updated = await addTask(trimmed, userId);
      setTasks(updated);
      setNewText('');
    } catch (err) {
      console.error('Add task error:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (index) => {
    try {
      const result = await toggleTask(index, userId);
      setTasks(result.tasks);
      if (result.xpAwarded > 0) {
        onXP(result);
      }
    } catch (err) {
      console.error('Toggle task error:', err);
    }
  };

  const handleDelete = async (index) => {
    try {
      const updated = await deleteTask(index, userId);
      setTasks(updated);
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  const renderTask = ({ item, index }) => (
    <View style={styles.taskRow}>
      <TouchableOpacity
        activeOpacity={0.6}
        style={[styles.checkbox, item.completed && styles.checkboxDone]}
        onPress={() => handleToggle(index)}
      >
        {item.completed && <Text style={styles.checkIcon}>✓</Text>}
      </TouchableOpacity>
      <Text
        style={[styles.taskText, item.completed && styles.taskTextDone]}
        numberOfLines={2}
      >
        {item.text}
      </Text>
      <TouchableOpacity
        activeOpacity={0.6}
        style={styles.deleteBtn}
        onPress={() => handleDelete(index)}
      >
        <Text style={styles.deleteIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <Text style={styles.title}>Today's Tasks</Text>
          <Text style={styles.subtitle}>
            {tasks.length}/8 tasks{tasks.length >= 8 ? ' (max reached)' : ''}
          </Text>

          {/* Input row */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Add a task..."
              placeholderTextColor="#666"
              value={newText}
              onChangeText={setNewText}
              maxLength={80}
              editable={tasks.length < 8}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              style={[
                styles.addBtn,
                (!newText.trim() || tasks.length >= 8) && styles.addBtnDisabled,
              ]}
              onPress={handleAdd}
              disabled={!newText.trim() || tasks.length >= 8 || adding}
            >
              {adding ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.addBtnText}>+</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Task list */}
          {loading ? (
            <ActivityIndicator color="#e94560" size="large" style={{ marginTop: 24 }} />
          ) : tasks.length === 0 ? (
            <Text style={styles.empty}>No tasks yet. Add one above!</Text>
          ) : (
            <FlatList
              data={tasks}
              keyExtractor={(_, i) => String(i)}
              renderItem={renderTask}
              style={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Close button */}
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.closeBtn}
            onPress={onClose}
          >
            <Text style={styles.closeBtnText}>Close</Text>
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
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#eaeaea',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#eaeaea',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#0f3460',
    marginRight: 10,
  },
  addBtn: {
    backgroundColor: '#e94560',
    borderRadius: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 26,
  },
  list: {
    maxHeight: 300,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxDone: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  checkIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskText: {
    flex: 1,
    color: '#eaeaea',
    fontSize: 15,
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
    color: '#2ecc71',
  },
  deleteBtn: {
    marginLeft: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(233,69,96,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    color: '#e94560',
    fontSize: 13,
    fontWeight: 'bold',
  },
  empty: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    marginVertical: 24,
  },
  closeBtn: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  closeBtnText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '600',
  },
});
