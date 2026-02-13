import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';

export default function DailyCheckModal({ visible, check, onSubmit, onClose }) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

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
            {typeof check.icon === 'string' ? (
              <Text style={styles.icon}>{check.icon}</Text>
            ) : (
              <Image source={check.icon} style={styles.iconImage} />
            )}
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
              <ActivityIndicator color="#9b1c1c" size="large" style={{ marginTop: 20 }} />
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff8ec',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginHorizontal: 30,
    borderWidth: 2,
    borderColor: '#8c9b6b',
    width: '85%',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  iconImage: {
    width: 56,
    height: 56,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  question: {
    fontSize: 18,
    color: '#283618',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 24,
    fontFamily: 'Jersey20',
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
    backgroundColor: '#9b1c1c',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginLeft: 7,
  },
  btnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'Jersey20',
  },
  feedback: {
    fontSize: 16,
    color: '#8c7a5e',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
    fontFamily: 'Jersey20',
  },
  cancelBtn: {
    marginTop: 16,
  },
  cancelText: {
    color: '#8c7a5e',
    fontSize: 14,
    fontFamily: 'Jersey20',
  },
});
