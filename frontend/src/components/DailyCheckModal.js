import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

export default function DailyCheckModal({ visible, check, onSubmit, onClose }) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Reset internal state whenever the modal opens/closes
  useEffect(() => {
    if (!visible) {
      setLoading(false);
      setFeedback(null);
    }
  }, [visible]);

  const handleAnswer = async (value) => {
    if (!check) return;
    setLoading(true);
    try {
      const result = await onSubmit(check.key, value);
      if (value) {
        setFeedback({ type: 'yes', xp: result.xpAwarded });
      } else {
        setFeedback({ type: 'no' });
      }
      setTimeout(() => {
        onClose(result);
      }, 1500);
    } catch (err) {
      console.error('Daily check error:', err);
      onClose({ xpAwarded: 0, leveledUp: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        {check ? (
          <View style={styles.card}>
            <Text style={styles.icon}>{check.icon}</Text>
            <Text style={styles.question}>{check.question}</Text>

            {feedback ? (
              <Text style={styles.feedback}>
                {feedback.type === 'yes'
                  ? feedback.xp > 0
                    ? `+${feedback.xp} XP earned!`
                    : 'Noted! Take care of yourself.'
                  : "That's okay. Tomorrow is another opportunity."}
              </Text>
            ) : loading ? (
              <ActivityIndicator color="#e94560" size="large" style={{ marginTop: 20 }} />
            ) : (
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.yesBtn}
                  onPress={() => handleAnswer(true)}
                >
                  <Text style={styles.btnText}>Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.noBtn}
                  onPress={() => handleAnswer(false)}
                >
                  <Text style={styles.btnText}>No</Text>
                </TouchableOpacity>
              </View>
            )}

            {!feedback && !loading && (
              <TouchableOpacity
                activeOpacity={0.6}
                style={styles.cancelBtn}
                onPress={() => onClose(null)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
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
    padding: 28,
    alignItems: 'center',
    marginHorizontal: 30,
    borderWidth: 2,
    borderColor: '#0f3460',
    width: '85%',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  question: {
    fontSize: 18,
    color: '#eaeaea',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  yesBtn: {
    flex: 1,
    backgroundColor: '#2ecc71',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginRight: 7,
  },
  noBtn: {
    flex: 1,
    backgroundColor: '#e94560',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 7,
  },
  btnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  feedback: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  cancelBtn: {
    marginTop: 16,
  },
  cancelText: {
    color: '#666',
    fontSize: 14,
  },
});
