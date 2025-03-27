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
    //To home page
    router.replace('/(home)');
  };

  const handleSignUp = () => {
    //To sign up page
    router.replace('../(auth)/signup');
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
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subText}>Login to your account</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email :</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password :</Text>
            <TextInput
              style={styles.input}
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
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subText: {
    fontSize: 14,
    color: '#777777',
    marginBottom: 30,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#0066CC',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#0066CC',
    width: '100%',
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
    color: '#0066CC',
    fontWeight: 'bold',
  },
});