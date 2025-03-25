import React, { useState } from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Logging in with:", email, password);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.logoContainer}>
          <Image source={require("../assets/images/icon-only.png")} style={styles.icon} />
          <Image source={require("../assets/images/Huddled-wordmark.png")} style={styles.wordmark} />
        </View>
  
        {/* Bottom box */}
        <View style={styles.bottomBox}>
          <Text style={styles.welcome}>Welcome Back</Text>
          <Text style={styles.subtitle}>Login to your account</Text>
  
          <Text style={styles.label}>Email :</Text>
          <TextInput
            style={styles.input}
            placeholder="someone@xsj.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
  
          <Text style={styles.label}>Password :</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Your Password Here"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
  
          <TouchableOpacity>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </TouchableOpacity>
  
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>
  
          <Text style={styles.signupPrompt}>
            Don’t have an Account?
            <Text style={styles.signupLink}> Sign Up Here</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "flex-start",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  icon: {
    width: 90,
    height: 80,
    resizeMode: "contain",
    marginBottom: 20,
  },
  wordmark: {
    width: 200,
    height: 50,
    resizeMode: "contain",
    marginBottom: 20,
  },
  bottomBox: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#CDECFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 90,
  },
  welcome: {
    fontFamily: "Poppins",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 1.4,
    textAlign: "center",
    marginBottom: 4,
    paddingTop:10,
  },
  subtitle: {
    fontFamily: "Poppins",
    fontSize: 14,
    letterSpacing: 1.0,
    textAlign: "center",
    marginBottom: 20,
    color: "#444",
  },
  label: {
    fontFamily: "Poppins",
    marginTop: 10,
    marginBottom: 4,
    fontSize: 14,
    letterSpacing: 1.0,
  },
  input: {
    fontFamily: "Poppins",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 14,
    letterSpacing: 1.0,
    marginBottom: 10,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  forgot: {
    fontFamily: "Poppins",
    letterSpacing: 1.0,
    color: "#085DB7",
    fontSize: 13,
    textAlign: "right",
    marginBottom: 30,
  },
  loginBtn: {
    backgroundColor: "#075DB6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
    width: 166,
    height: 46,
    justifyContent: "center",
    alignSelf: "center",
  },
  loginText: {
    fontFamily: "Poppins",
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1.0,
  },
  signupPrompt: {
    fontFamily: "Poppins",
    textAlign: "center",
    fontSize: 13,
    color: "#333",
    letterSpacing: 1.0,
  },
  signupLink: {
    fontFamily: "Poppins",
    color: "#075DB6",
    fontWeight: "600",
    letterSpacing: 1.0,
  },
});

export default Login;
