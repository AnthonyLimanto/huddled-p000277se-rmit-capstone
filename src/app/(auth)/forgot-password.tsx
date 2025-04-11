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
          <Image source={require('../../../assets/images/icon-only.png')} style={styles.logoImage} />
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
    right: 20,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 16,
    color: '#555',
  },
}); 