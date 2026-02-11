import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

export default function FeedbackScreen({ navigation }) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user.uid,
        message: trimmed,
        createdAt: serverTimestamp(),
      });
      setMessage('');
      Alert.alert('Thank you!', 'Your feedback has been submitted.');
    } catch (err) {
      console.error('Feedback error:', err);
      Alert.alert('Oops', 'Could not send feedback. Try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Give Us Your Feedback</Text>
        <Text style={styles.subtitle}>
          Help us improve PEXILIS! Tell us what you love or what we can do better.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Write your feedback here..."
          placeholderTextColor="#666"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
          textAlignVertical="top"
        />

        <Text style={styles.charCount}>{message.length}/500</Text>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.sendBtn, (!message.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!message.trim() || sending}
        >
          <Text style={styles.sendBtnText}>{sending ? 'Sending...' : 'Send Feedback'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scroll: {
    padding: 24,
    paddingTop: 56,
  },
  backBtn: {
    marginBottom: 20,
  },
  backText: {
    color: '#e94560',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#eaeaea',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 16,
    color: '#eaeaea',
    fontSize: 15,
    minHeight: 160,
    borderWidth: 1,
    borderColor: '#0f3460',
    lineHeight: 22,
  },
  charCount: {
    color: '#666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 6,
    marginBottom: 20,
  },
  sendBtn: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
