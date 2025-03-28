import { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  Text, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSend = () => {

    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }
    
    router.replace('../(auth)/reset-password');
  };

  const handleSignIn = () => {
    router.replace('../(auth)/signin');
  };

  const handleBack = () => {
    router.replace('../(auth)/signin');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoGraphic}>
            <View style={styles.dot1} />
            <View style={styles.dot2} />
            <View style={styles.dot3} />
            <View style={styles.dot4} />
            <View style={styles.dot5} />
          </View>
          <Text style={styles.logoText}>Huddled</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Forgot Password?</Text>
          
          <Text style={styles.description}>
            Please enter your registered email so that we can send you password reset link.
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email :</Text>
            <TextInput
              style={styles.input} 
              placeholder="your@email.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            
            {errorMessage ? (
              <Text style={styles.errorText}>
                Email does not exist. Try again.
              </Text>
            ) : null}
          </View>
          
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleSend}
            activeOpacity={0.8}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
          
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
              Remember Password? <Text style={styles.signInLink} onPress={handleSignIn}>Sign in</Text>
            </Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
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
  logoGraphic: {
    position: 'relative',
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  dot1: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#80C1E0',
    left: 10,
    top: 25,
  },
  dot2: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#80C1E0',
    left: 35,
    top: 15,
  },
  dot3: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#80C1E0',
    right: 12,
    top: 10,
  },
  dot4: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#80C1E0',
    right: 5,
    top: 25,
  },
  dot5: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#80C1E0',
    right: 18,
    top: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#80C1E0',
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
  sendButton: {
    backgroundColor: '#3268c7',
    borderRadius: 8,
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#555',
  },
  signInLink: {
    color: '#3268c7',
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  backButtonText: {
    position: 'absolute',
    fontSize: 16,
    color: '#555',
  },
}); 