import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';

export default function SignIn() {
  const router = useRouter();

  const handleLogin = () => {
    router.replace('/(home)');
  };

  const handleSignUp = () => {
    router.replace('../(auth)/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/images/icon-only.png')} 
            style={styles.logoIcon} 
          />
          <Image 
            source={require('../../../assets/images/Huddled-wordmark.png')} 
            style={styles.logoWordmark} 
          />
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subText}>Login to your account</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email :</Text>
            <TextInput
              style={styles.input}
              placeholder="someone@example.com"
              placeholderTextColor="#777777"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password :</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#777777"
              secureTextEntry
            />
          </View>
          
          <TouchableOpacity style={styles.forgotPassword}>
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
  logoIcon: {
    width: 90,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  logoWordmark: {
    width: 200,
    height: 50,
    resizeMode: 'contain',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#CDECFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 30,
    alignItems: 'center',
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
    letterSpacing: 1.0,
  },
  label: {
    fontSize: 14,
    marginBottom: 10,
    letterSpacing: 1.0,
  },
  input: {
    backgroundColor: '#fff',
    width: '100%',
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#000', // <-- this makes user input text black
    letterSpacing: 1.0,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
    letterSpacing: 1.0,
  },
  forgotPasswordText: {
    color: '#075DB6',
    fontSize: 14,
    letterSpacing: 1.0,
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
    letterSpacing: 1.0,
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  noAccountText: {
    fontSize: 14,
    color: '#555',
    letterSpacing: 1.0,
  },
  signupLink: {
    fontSize: 14,
    color: '#075DB6',
    fontWeight: 'bold',
    letterSpacing: 1.0,
  },
});
