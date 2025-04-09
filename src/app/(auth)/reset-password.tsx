import { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleReset = () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Try again.');
      return;
    }
    // Navigate to Reset-Done page
    router.replace('../(auth)/reset-done');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.logoContainer}>
          <Image source={require('../../../assets/images/icon-only.png')} style={styles.logoImage} />
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Reset your Password</Text>
          <Text style={styles.description}>Please enter your new password below.</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password :</Text>
            <TextInput
              style={styles.input} 
              placeholder="New Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <Text style={styles.label}>Re-enter New Password :</Text>
            <TextInput
              style={styles.input} 
              placeholder="Re-enter New Password"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
          </View>
          <TouchableOpacity 
            style={styles.resetButton} 
            onPress={handleReset}
            activeOpacity={0.8}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.replace('../(auth)/signin')}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
    position: 'relative',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 30,
  },
  logoImage: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  card: {
    flex: 1,
    backgroundColor: '#E5F3FD',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#555',
    lineHeight: 22,
    paddingHorizontal: 15,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    width: '100%',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 8,
    fontSize: 14,
  },
  resetButton: {
    backgroundColor: '#3268c7',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    color: '#555',
  },
}); 