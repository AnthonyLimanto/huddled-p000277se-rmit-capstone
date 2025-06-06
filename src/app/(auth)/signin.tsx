import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../api/supabase';
import ReCaptcha from 'react-native-recaptcha-that-works';

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const recaptchaRef = useRef<any>(null);

  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) return 'Email is required';
    if (!regex.test(value)) return 'Please enter a valid email address';
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) return 'Password is required';
    return '';
  };

  const handleLogin = async () => {
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setEmailError(emailErr);
    setPasswordError(passErr);
    if (emailErr || passErr) return;

    if ((Platform.OS === 'ios' || Platform.OS === 'android') && !captchaVerified) {
      recaptchaRef.current?.open();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Email not confirmed')) {
        setPasswordError('Email pending verification. Check your email to verify.');
      } else if (error.message.includes('Invalid login credentials')) {
        setPasswordError('Incorrect email or password');
      } else {
        setPasswordError(error.message);
      }
    } else {
      setSuccessModalVisible(true);
      setTimeout(() => {
        setSuccessModalVisible(false);
        setCaptchaVerified(false);
        router.replace('/(home)');
      }, 2000);
    }
  };

  const handleSignUp = () => router.replace('../(auth)/signup');
  const handleForgotPassword = () => router.replace('../(auth)/forgot-password');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topWhiteSection}>
          <Image
            source={require('../../../assets/images/icon-only.png')}
            style={styles.topIcon}
          />
            <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/images/Huddled-wordmark.png')}
            style={styles.logoWordmark}
          />
        </View>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >

        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subText}>Login to your account</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email :</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError(validateEmail(text));
              }}
              onBlur={() => setEmailError(validateEmail(email))}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password :</Text>
            <TextInput
              style={[styles.input, passwordError ? styles.inputError : null]}
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError(validatePassword(text));
              }}
              onBlur={() => setPasswordError(validatePassword(password))}
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.noAccountText}>Don't have an Account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signupLink}>Sign Up Here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {(Platform.OS === 'ios' || Platform.OS === 'android') && (
        <ReCaptcha
          ref={recaptchaRef}
          siteKey="6Ld2OxgrAAAAAAOiVeZgdx66ZbYCDfQ9rwZpC2tw"
          baseUrl="http://localhost"
          onVerify={() => {
            setCaptchaVerified(true);
            setTimeout(() => handleLogin(), 300);
          }}
          onExpire={() => setCaptchaVerified(false)}
        />
      )}

      <Modal transparent visible={successModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>Login Successful!</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CDECFF',
  },
  safeArea: {
    backgroundColor: '#fff',
  },
  topWhiteSection: {
    alignItems: 'center',
    paddingTop: 30,
    backgroundColor: '#fff',
  },
  topIcon: {
    width: 100,
    height: 90,
    resizeMode: 'contain',
  },
  keyboardView: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  logoWordmark: {
    width: 200,
    height: 50,
    resizeMode: 'contain',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#CDECFF',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    letterSpacing: 1.4,
  },
  subText: {
    fontSize: 14,
    marginBottom: 30,
    letterSpacing: 1.0,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    letterSpacing: 1.0,
  },
  input: {
    backgroundColor: '#fff',
    width: '100%',
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#000',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#FF5A5F',
  },
  errorText: {
    color: '#FF5A5F',
    fontSize: 13,
    marginTop: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#075DB6',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#075DB6',
    width: 160,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  noAccountText: {
    fontSize: 14,
    color: '#555',
  },
  signupLink: {
    fontSize: 14,
    color: '#075DB6',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#075DB6',
  },
});
