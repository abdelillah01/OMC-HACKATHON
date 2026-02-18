import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/MainLayout';

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
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <MainLayout
        navigation={navigation}
        title="Feedback"
        showEncouragement={false}
        showActionGrid={false}
      >
        <View style={styles.starsSection}>
          <Image
            source={require('../assets/feedbackstars.png')}
            style={styles.starsImage}
          />
        </View>

        <View style={styles.textSection}>
          <Text style={styles.heading}>
            We're here to help.{'\n'}Don't forget to give{'\n'}us your feedback!
          </Text>
        </View>

        <View style={styles.bubbleWrapper}>
          <View style={styles.bubble}>
            <TextInput
              style={styles.bubbleInput}
              placeholder="write here ......"
              placeholderTextColor="#b5a98a"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
              textAlignVertical="top"
              onSubmitEditing={handleSend}
              blurOnSubmit
            />
          </View>
          <View style={styles.bubbleTail} />
        </View>
      </MainLayout>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  starsSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  starsImage: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    
  },
  textSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  heading: {
    fontSize: 20,
    color: '#3b2f1e',
    textAlign: 'center',
    lineHeight: 28,
    fontFamily: 'Jersey20',
  },
  bubbleWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
  bubble: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#c9bda3',
    padding: 20,
    minHeight: 150,
  },
  bubbleInput: {
    fontSize: 16,
    color: '#3b2f1e',
    lineHeight: 22,
    fontFamily: 'Jersey20',
    minHeight: 110,
  },
  bubbleTail: {
    width: 20,
    height: 20,
    backgroundColor: '#ffffff',
    borderRightWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: '#c9bda3',
    transform: [{ rotate: '45deg' }],
    marginTop: -12,
    alignSelf: 'flex-end',
    marginRight: 40,
  },
});
