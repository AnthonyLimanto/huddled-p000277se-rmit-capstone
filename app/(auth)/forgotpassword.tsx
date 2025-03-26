import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSend = () => {
    if (email.trim() === '') {
      setErrorMessage('Email does not exist. Try again.');
      return;
    }
    
    // 点击Send后跳转到Reset password页面
    // 这里只是演示，实际上不会有验证邮箱的功能
    // 假设resetpassword页面将位于与forgotpassword同一目录
    router.push('../(auth)/resetpassword'); 
  };

  const handleSignIn = () => {
    // 点击Sign in链接，回到signin页面
    router.replace('/(auth)/signin');
  };

  const handleBack = () => {
    // 点击back按钮，返回到signin页面
    router.replace('/(auth)/signin');
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
        
        <View style={styles.formContainer}>
          <Text style={styles.title}>Forgot Password?</Text>
          
          <Text style={styles.description}>
            Please enter your registered email so that we can send you password reset link.
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email :</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
          </View>
          
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleSend}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
          
          <View style={styles.rememberContainer}>
            <Text style={styles.rememberText}>Remember Password? </Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>
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
  formContainer: {
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
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 25,
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
    fontSize: 14,
    marginTop: 5,
  },
  sendButton: {
    backgroundColor: '#0066CC',
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rememberContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  rememberText: {
    fontSize: 14,
    color: '#555',
  },
  signInLink: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  backButtonText: {
    fontSize: 16,
    color: '#555',
  },
}); 